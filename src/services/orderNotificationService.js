import { supabase, isSupabaseConfigured } from './supabaseClient';

class OrderNotificationService {
  constructor() {
    this.audioCtx = null;
    this.activeOscillator = null;
    this.activeGain = null;
    this.sirenTimer = null;
    this.broadcastChannel = null;
    this.isSirenPlaying = false;
    this.listeners = new Set();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('growlocal_orders_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event?.data?.type === 'NEW_ORDER') {
            this.handleIncomingOrder(event.data.order);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'growlocal_latest_order_event' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.order) {
              this.handleIncomingOrder(parsed.order);
            }
          } catch (err) {
            console.error('Error parsing cross-tab order notification:', err);
          }
        }
      });
    }
  }

  // Unlock audio context on user gesture (e.g. click anywhere in Merchant Dashboard)
  initAudio() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  // Play high-urgency alternating siren sound using Web Audio API
  playSiren(durationSeconds = 8) {
    if (typeof window === 'undefined') return;

    // Ensure audio context is ready
    this.initAudio();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    // Stop any existing siren first
    this.stopSiren();

    try {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';

      const now = ctx.currentTime;
      const cycleDuration = 0.55; // cycle between low and high siren frequency
      const cycles = Math.ceil(durationSeconds / cycleDuration);

      // Pitch sweep simulation (650Hz to 950Hz ambulance/fire siren warble)
      for (let i = 0; i < cycles; i++) {
        const t = now + i * cycleDuration;
        osc.frequency.setValueAtTime(620, t);
        osc.frequency.exponentialRampToValueAtTime(960, t + cycleDuration * 0.5);
        osc.frequency.exponentialRampToValueAtTime(620, t + cycleDuration);
      }

      // Gain envelope to avoid clicking and ensure strong, clean audible siren
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.1);
      gain.gain.setValueAtTime(0.28, now + durationSeconds - 0.2);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      this.activeOscillator = osc;
      this.activeGain = gain;
      this.isSirenPlaying = true;

      this.sirenTimer = setTimeout(() => {
        this.stopSiren();
      }, durationSeconds * 1000);
    } catch (e) {
      console.warn('Unable to play siren tone:', e);
      this.isSirenPlaying = false;
    }
  }

  // Stop siren immediately (e.g. when merchant clicks 'Acknowledge' or 'Mute')
  stopSiren() {
    if (this.sirenTimer) {
      clearTimeout(this.sirenTimer);
      this.sirenTimer = null;
    }

    if (this.activeOscillator) {
      try {
        this.activeOscillator.stop();
        this.activeOscillator.disconnect();
      } catch (e) {}
      this.activeOscillator = null;
    }

    if (this.activeGain) {
      try {
        this.activeGain.disconnect();
      } catch (e) {}
      this.activeGain = null;
    }

    this.isSirenPlaying = false;
  }

  // Triggered when a customer confirms an order / Buy Now
  notifyNewOrder(order) {
    if (!order) return;

    // 1. Cross-tab BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'NEW_ORDER', order });
      } catch (e) {}
    }

    // 2. localStorage storage event for multi-tab notification
    try {
      localStorage.setItem('growlocal_latest_order_event', JSON.stringify({
        timestamp: Date.now(),
        order
      }));
    } catch (e) {}

    // 3. Supabase Realtime Broadcast (if connected)
    if (isSupabaseConfigured) {
      try {
        const channel = supabase.channel('merchant-orders-broadcast');
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.send({
              type: 'broadcast',
              event: 'order_created',
              payload: order
            });
          }
        });
      } catch (e) {}
    }

    // 4. Also handle in current window (in case user and merchant run in same tab for testing)
    this.handleIncomingOrder(order);
  }

  handleIncomingOrder(order) {
    // Notify all registered merchant UI listeners
    this.listeners.forEach((listener) => {
      try {
        listener(order);
      } catch (err) {
        console.error('Error executing order listener:', err);
      }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);

    // Also listen to Supabase realtime reservations if available
    let supabaseChannel = null;
    if (isSupabaseConfigured) {
      try {
        supabaseChannel = supabase
          .channel('public:reservations')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'reservations' },
            (payload) => {
              if (payload.new) {
                const order = {
                  id: payload.new.reservation_code || payload.new.id,
                  productName: payload.new.product_name || 'Product',
                  totalAmount: payload.new.total_amount || 0,
                  customerName: payload.new.customer_name || 'Nagpur Customer',
                  shopId: payload.new.shop_id,
                  ...payload.new
                };
                this.handleIncomingOrder(order);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Could not connect to Supabase reservations realtime:', e);
      }
    }

    return () => {
      this.listeners.delete(listener);
      if (supabaseChannel && isSupabaseConfigured) {
        try {
          supabase.removeChannel(supabaseChannel);
        } catch (e) {}
      }
    };
  }
}

export const orderNotificationService = new OrderNotificationService();
