import { supabase, isSupabaseConfigured } from './supabaseClient';

class OrderNotificationService {
  constructor() {
    this.audioCtx = null;
    this.masterGainNode = null;
    this.activeNodes = [];
    this.ringtoneTimer = null;
    this.isRingtonePlaying = false;
    this.currentActiveOrder = null;
    this.listeners = new Set();
    this.dismissListeners = new Set();
    this.statusListeners = new Set();
    this.broadcastChannel = null;

    // Cross-tab broadcast channel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('growlocal_orders_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event?.data?.type === 'NEW_ORDER' && event.data.order) {
            this.handleIncomingOrder(event.data.order, true);
          } else if (event?.data?.type === 'STOP_RINGTONE') {
            this.stopRingtone(false);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted:', e);
      }
    }

    // Cross-tab localStorage fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'growlocal_latest_order_event' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.order) {
              this.handleIncomingOrder(parsed.order, true);
            }
          } catch (err) {
            console.error('Error parsing cross-tab order notification:', err);
          }
        } else if (e.key === 'growlocal_stop_ringtone_event') {
          this.stopRingtone(false);
        }
      });

      // Automatically unlock audio on first interaction anywhere
      const unlockAudio = () => {
        this.initAudio();
        if (this.audioCtx && this.audioCtx.state === 'running') {
          ['click', 'touchstart', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, unlockAudio);
          });
        }
      };
      ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true });
      });
    }
  }

  // Initialize or resume AudioContext
  initAudio() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.masterGainNode = this.audioCtx.createGain();
          this.masterGainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
          this.masterGainNode.connect(this.audioCtx.destination);
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  // Synthesize a single harmonic bell chime note (pure, smooth, acoustic marimba/celesta timbre)
  playChimeTone(ctx, freq, startTime, duration = 0.45, gainLevel = 0.22) {
    try {
      // Primary fundamental tone (pure, sweet sine)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      // Warm harmonic overtone (soft triangle wave an octave higher for crystalline chime resonance)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      const noteGain = ctx.createGain();
      // Gentle attack without pop
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.018);
      // Smooth exponential decay
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.0001, startTime);
      overtoneGain.gain.linearRampToValueAtTime(gainLevel * 0.20, startTime + 0.015);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.65);

      osc1.connect(noteGain);
      osc2.connect(overtoneGain);
      noteGain.connect(this.masterGainNode || ctx.destination);
      overtoneGain.connect(this.masterGainNode || ctx.destination);

      osc1.start(startTime);
      osc1.stop(startTime + duration);
      osc2.start(startTime);
      osc2.stop(startTime + duration);

      this.activeNodes.push(osc1, osc2, noteGain, overtoneGain);

      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(
          n => n !== osc1 && n !== osc2 && n !== noteGain && n !== overtoneGain
        );
      }, (duration + 0.2) * 1000);
    } catch (e) {
      console.warn('Error generating chime note:', e);
    }
  }

  // A smooth, lovely musical chime phrase (E Major Pentatonic / Bell bloom)
  playLovelyPhrase() {
    if (!this.audioCtx || !this.isRingtonePlaying) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime + 0.05;

    // Upbeat, warm bell melody
    this.playChimeTone(ctx, 659.25, now + 0.00, 0.42, 0.22); // E5
    this.playChimeTone(ctx, 830.61, now + 0.22, 0.42, 0.24); // G#5
    this.playChimeTone(ctx, 987.77, now + 0.44, 0.42, 0.26); // B5
    this.playChimeTone(ctx, 1318.51, now + 0.66, 0.58, 0.28); // E6 (crystal peak)
    this.playChimeTone(ctx, 987.77, now + 1.00, 0.42, 0.24); // B5
    this.playChimeTone(ctx, 830.61, now + 1.25, 0.45, 0.22); // G#5
    // Warm harmonic blooming chord
    this.playChimeTone(ctx, 659.25, now + 1.55, 1.10, 0.25); // E5
    this.playChimeTone(ctx, 1318.51, now + 1.55, 1.10, 0.18); // E6
  }

  // Starts the smooth lovely ringtone. Loops continuously ("tab tak jab tak koi usse band nahi kr deta")
  startRingtone() {
    if (typeof window === 'undefined') return;
    this.initAudio();

    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    // If already playing, keep looping
    if (this.isRingtonePlaying) return;
    this.isRingtonePlaying = true;
    this.notifyStatusListeners();

    const loopPhrase = () => {
      if (!this.isRingtonePlaying) return;
      this.playLovelyPhrase();
      this.ringtoneTimer = setTimeout(() => {
        if (this.isRingtonePlaying) {
          loopPhrase();
        }
      }, 2800); // 2.8s pleasant cycle
    };

    loopPhrase();
  }

  // Backward-compatible alias for existing call-sites
  playSiren(_unusedDuration) {
    this.startRingtone();
  }

  // Stops the ringtone immediately and clears state
  stopRingtone(broadcast = true) {
    this.isRingtonePlaying = false;

    if (this.ringtoneTimer) {
      clearTimeout(this.ringtoneTimer);
      this.ringtoneTimer = null;
    }

    // Stop active audio nodes with quick smooth fade to prevent clicks
    try {
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
    } catch (e) {}

    this.currentActiveOrder = null;
    this.notifyStatusListeners();

    // Notify dismissal listeners
    this.dismissListeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('Error in dismiss listener:', err);
      }
    });

    // Cross-tab broadcast that ringtone was stopped
    if (broadcast) {
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({ type: 'STOP_RINGTONE' });
        } catch (e) {}
      }
      try {
        localStorage.setItem('growlocal_stop_ringtone_event', String(Date.now()));
      } catch (e) {}
    }
  }

  // Backward-compatible alias
  stopSiren(broadcast = true) {
    this.stopRingtone(broadcast);
  }

  // Triggered when a customer buys/orders something
  notifyNewOrder(order) {
    if (!order) return;

    this.currentActiveOrder = order;

    // Start lovely ringtone locally
    this.startRingtone();

    // 1. Cross-tab BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'NEW_ORDER', order });
      } catch (e) {}
    }

    // 2. localStorage storage event for multi-tab
    try {
      localStorage.setItem('growlocal_latest_order_event', JSON.stringify({
        timestamp: Date.now(),
        order
      }));
    } catch (e) {}

    // 3. Supabase Realtime Broadcast (if configured)
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

    // 4. Handle in current window
    this.handleIncomingOrder(order, false);
  }

  handleIncomingOrder(order, startSound = true) {
    this.currentActiveOrder = order;
    if (startSound) {
      this.startRingtone();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(order);
      } catch (err) {
        console.error('Error executing order listener:', err);
      }
    });
  }

  // Subscribe to incoming orders
  subscribe(listener) {
    this.listeners.add(listener);

    // If there is already an active order when subscribing, notify immediately
    if (this.currentActiveOrder) {
      try {
        listener(this.currentActiveOrder);
      } catch (e) {}
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  // Subscribe to dismissal events
  onDismiss(listener) {
    this.dismissListeners.add(listener);
    return () => {
      this.dismissListeners.delete(listener);
    };
  }

  // Subscribe to any change in ringing status or active order
  onStatusChange(listener) {
    this.statusListeners.add(listener);
    try {
      listener({
        isPlaying: Boolean(this.isRingtonePlaying),
        activeOrder: this.currentActiveOrder
      });
    } catch (e) {}
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  notifyStatusListeners() {
    const payload = {
      isPlaying: Boolean(this.isRingtonePlaying),
      activeOrder: this.currentActiveOrder
    };
    this.statusListeners.forEach(listener => {
      try {
        listener(payload);
      } catch (e) {
        console.error('Error in statusListener:', e);
      }
    });
  }

  getActiveOrder() {
    return this.currentActiveOrder;
  }

  isRinging() {
    return this.isRingtonePlaying;
  }
}

export const orderNotificationService = new OrderNotificationService();
