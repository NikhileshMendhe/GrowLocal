import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DeliveryBoy3D({ className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ==========================================
    // 1. RENDERER, SCENE & CAMERA SETUP
    // ==========================================
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 1.35, 5.8);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true, 
      powerPreference: "high-performance",
      precision: "highp" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    // ==========================================
    // 2. STUDIO LIGHTING SETUP
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xEAF7EE, 0.5);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    const greenRim = new THREE.PointLight(0x138A36, 4.5, 12);
    greenRim.position.set(-4.5, 3.5, -2);
    scene.add(greenRim);

    const goldAccent = new THREE.PointLight(0xFFB703, 3.5, 10);
    goldAccent.position.set(4, -0.5, 3.5);
    scene.add(goldAccent);

    // ==========================================
    // 3. GROUND DYNAMIC CONTACT SHADOW DISC
    // ==========================================
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const groundShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -1.28;
    scene.add(groundShadow);

    // ==========================================
    // 4. MATERIAL PALETTE (PREMIUM MASCOT STYLE)
    // ==========================================
    const greenBodyMat = new THREE.MeshStandardMaterial({ color: 0x138A36, roughness: 0.25, metalness: 0.12 });
    const greenHelmetMat = new THREE.MeshStandardMaterial({ color: 0x0B6B2B, roughness: 0.2, metalness: 0.15 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xF5CBA7, roughness: 0.45, metalness: 0.02 });
    const blackVisorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.08, metalness: 0.85 });
    const darkCollarMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.4, metalness: 0.1 });
    const whiteZipperMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.15 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE8E8E8, roughness: 0.08, metalness: 0.95 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1F1F1F, roughness: 0.8, metalness: 0.05 });
    const parcelMat = new THREE.MeshStandardMaterial({ color: 0xE2B170, roughness: 0.65 });
    const goldDetailMat = new THREE.MeshStandardMaterial({ color: 0xFFB703, metalness: 0.75, roughness: 0.18 });

    // ==========================================
    // 5. MASTER HIERARCHY & KINEMATIC CHAINS
    // ==========================================
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // A) SCOOTER / MOPED ASSEMBLY
    const scooterGroup = new THREE.Group();
    scooterGroup.position.set(0, -0.6, 0);
    masterGroup.add(scooterGroup);

    // Rounded Aerodynamic Front Shield
    const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 32), greenBodyMat);
    shieldMesh.scale.set(0.92, 0.78, 0.46);
    shieldMesh.position.set(0, 0.25, 0.36);
    shieldMesh.castShadow = true;
    scooterGroup.add(shieldMesh);

    // Golden/Beige Front Detail Badge
    const frontDetailBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 32), goldDetailMat);
    frontDetailBadge.position.set(0, 0.28, 0.58);
    frontDetailBadge.rotation.x = Math.PI / 2;
    scooterGroup.add(frontDetailBadge);

    // Front Mudguard (Mounted above front wheel)
    const mudguardMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
      greenBodyMat
    );
    mudguardMesh.position.set(0, -0.05, 0.72);
    scooterGroup.add(mudguardMesh);

    // STEERING HANDLEBARS & HEADLIGHT GROUP
    const steeringGroup = new THREE.Group();
    steeringGroup.position.set(0, 0.6, 0.35);
    scooterGroup.add(steeringGroup);

    // Round Central Headlight
    const headlightLensMat = new THREE.MeshStandardMaterial({ 
      color: 0xFFFFFF, 
      emissive: 0xFFFFFF, 
      emissiveIntensity: 0.95, 
      roughness: 0.04 
    });
    const headlightLens = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), headlightLensMat);
    headlightLens.scale.set(1, 1, 0.4);
    headlightLens.position.set(0, 0, 0.18);
    steeringGroup.add(headlightLens);

    const headlightBezel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 16, 32), chromeMat);
    headlightBezel.position.set(0, 0, 0.18);
    steeringGroup.add(headlightBezel);

    // Black Handlebars Bar & Grips
    const handlebarTube = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-0.66, 0, 0),
          new THREE.Vector3(0, 0.08, 0.05),
          new THREE.Vector3(0.66, 0, 0)
        ),
        24, 0.04, 16, false
      ),
      darkCollarMat
    );
    steeringGroup.add(handlebarTube);

    // Black Mirrors (Left & Right)
    const createMirror = (x) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(x, 0.22, 0);

      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.26, 12), darkCollarMat);
      stalk.rotation.z = x > 0 ? -0.32 : 0.32;
      mGroup.add(stalk);

      const mirrorHead = new THREE.Mesh(new THREE.SphereGeometry(0.095, 24, 24), darkCollarMat);
      mirrorHead.scale.set(1, 1, 0.3);
      mirrorHead.position.set(x > 0 ? 0.05 : -0.05, 0.15, 0);
      mGroup.add(mirrorHead);

      steeringGroup.add(mGroup);
    };
    createMirror(-0.56);
    createMirror(0.56);

    // ==========================================
    // 5B. PROPER 3D FRONT SUSPENSION FORK & FRONT WHEEL
    // ==========================================
    // Steering column extending down from handlebar/headlight into suspension fork
    const forkGroup = new THREE.Group();
    steeringGroup.add(forkGroup);

    // Central Steering Column Stem
    const steeringStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16), darkCollarMat);
    steeringStem.position.set(0, -0.2, 0.2);
    forkGroup.add(steeringStem);

    // Fork Crown Connector
    const forkCrown = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.08), darkCollarMat);
    forkCrown.position.set(0, -0.36, 0.28);
    forkGroup.add(forkCrown);

    // Dual Suspension Fork Struts (Left & Right)
    const createForkStrut = (x) => {
      const strutGroup = new THREE.Group();
      strutGroup.position.set(x, -0.62, 0.37);

      // Upper Outer Leg Tube
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.028, 0.32, 16), darkCollarMat);
      strutGroup.add(upperLeg);

      // Chrome Inner Damper Shaft
      const innerDamper = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 16), chromeMat);
      innerDamper.position.y = -0.12;
      strutGroup.add(innerDamper);

      // Lower Axle Drop-out Mount
      const dropOut = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.08, 16), darkCollarMat);
      dropOut.position.set(0, -0.24, 0);
      strutGroup.add(dropOut);

      forkGroup.add(strutGroup);
    };

    createForkStrut(-0.14); // Left Fork Leg
    createForkStrut(0.14);  // Right Fork Leg

    // REAL CENTRAL HORIZONTAL AXLE
    const axleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 16), chromeMat);
    axleMesh.rotation.z = Math.PI / 2;
    axleMesh.position.set(0, -0.86, 0.72);
    scooterGroup.add(axleMesh);

    // REAL PROPERLY MODELED 3D FRONT WHEEL
    const frontWheelGroup = new THREE.Group();
    frontWheelGroup.position.set(0, -0.86, 0.72); // Positioned clearly in front of green body
    scooterGroup.add(frontWheelGroup);

    // Realistic Rubber Tire with Curved Sidewalls & Tread Grooves
    const frontTire = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.11, 32, 64), tireMat);
    frontTire.castShadow = true;
    frontTire.receiveShadow = true;
    frontWheelGroup.add(frontTire);

    // Inner Metallic Wheel Rim
    const frontRim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 32), chromeMat);
    frontRim.rotation.x = Math.PI / 2;
    frontWheelGroup.add(frontRim);

    // Central Wheel Hub
    const frontHub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 24), darkCollarMat);
    frontHub.rotation.x = Math.PI / 2;
    frontWheelGroup.add(frontHub);

    // 5 Solid Metallic Rim Spokes
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.028, 0.028), chromeMat);
      spoke.rotation.z = (Math.PI / 5) * i;
      frontWheelGroup.add(spoke);
    }

    // REAR 3D WHEEL
    const rearWheelGroup = new THREE.Group();
    rearWheelGroup.position.set(0, -0.86, -0.5);

    const rearTire = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.11, 32, 64), tireMat);
    rearTire.castShadow = true;
    rearWheelGroup.add(rearTire);

    const rearRim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 32), chromeMat);
    rearRim.rotation.x = Math.PI / 2;
    rearWheelGroup.add(rearRim);

    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.028, 0.028), chromeMat);
      spoke.rotation.z = (Math.PI / 5) * i;
      rearWheelGroup.add(spoke);
    }
    scooterGroup.add(rearWheelGroup);

    // List of wheels for rotation tracking
    const wheelsList = [frontWheelGroup, rearWheelGroup];

    // B) CHARACTER BODY (ROUNDED GREEN BODY + COLLAR + ZIPPER + BACKPACK)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.2, 0);
    masterGroup.add(bodyGroup);

    // Rounded Green Body Torso
    const torsoMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), greenBodyMat);
    torsoMesh.scale.set(1, 1.15, 0.92);
    torsoMesh.position.set(0, 0.5, 0);
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);

    // White Vertical Zipper Detail
    const zipperMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.92, 16), whiteZipperMat);
    zipperMesh.position.set(0, 0.5, 0.44);
    bodyGroup.add(zipperMesh);

    // Black Collar
    const collarMesh = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.065, 16, 32), darkCollarMat);
    collarMesh.position.set(0, 0.98, 0);
    collarMesh.rotation.x = Math.PI / 2;
    bodyGroup.add(collarMesh);

    // Green Arms & Beige Hands Firmly Gripping Handlebars
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.42, 0.8, 0);
    bodyGroup.add(leftArmGroup);

    const leftArmMesh = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-0.15, -0.25, 0.2),
          new THREE.Vector3(-0.2, -0.2, 0.35)
        ), 16, 0.09, 16, false
      ), greenBodyMat
    );
    leftArmGroup.add(leftArmMesh);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), skinMat);
    leftHand.position.set(-0.2, -0.2, 0.35);
    leftArmGroup.add(leftHand);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.42, 0.8, 0);
    bodyGroup.add(rightArmGroup);

    const rightArmMesh = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.15, -0.25, 0.2),
          new THREE.Vector3(0.2, -0.2, 0.35)
        ), 16, 0.09, 16, false
      ), greenBodyMat
    );
    rightArmGroup.add(rightArmMesh);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), skinMat);
    rightHand.position.set(0.2, -0.2, 0.35);
    rightArmGroup.add(rightHand);

    // Green Delivery Backpack (Attached to Back)
    const bagMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), new THREE.MeshStandardMaterial({ color: 0x0B6B2B, roughness: 0.35 }));
    bagMesh.scale.set(0.85, 1.1, 0.6);
    bagMesh.position.set(0, 0.58, -0.42);
    bagMesh.castShadow = true;
    bodyGroup.add(bagMesh);

    const stripeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 32, 1, false, -Math.PI * 0.4, Math.PI * 0.8), goldDetailMat);
    stripeMesh.position.set(0, 0.58, -0.5);
    stripeMesh.rotation.x = Math.PI / 2;
    bodyGroup.add(stripeMesh);

    // C) HEAD, BEIGE FACE, GREEN HELMET & BLACK HORIZONTAL VISOR
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.45, 0);
    bodyGroup.add(headGroup);

    // Beige/Skin-Colored Face Base
    const faceMesh = new THREE.Mesh(new THREE.SphereGeometry(0.56, 32, 32), skinMat);
    faceMesh.castShadow = true;
    headGroup.add(faceMesh);

    // Green Helmet Dome
    const helmetMesh = new THREE.Mesh(new THREE.SphereGeometry(0.59, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.53), greenHelmetMat);
    headGroup.add(helmetMesh);

    // Black Visor Brim / Visor Base
    const visorBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.69, 0.05, 32, 1, false, -Math.PI * 0.35, Math.PI * 0.7), darkCollarMat);
    visorBrim.position.set(0, 0.16, 0.25);
    visorBrim.rotation.x = 0.18;
    headGroup.add(visorBrim);

    // BLACK HORIZONTAL VISOR / GOGGLE WITH CURVED SPECULAR HIGHLIGHT
    const visorGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.22, 32, 1, false, -Math.PI * 0.38, Math.PI * 0.76);
    const visorMesh = new THREE.Mesh(visorGeo, blackVisorMat);
    visorMesh.position.set(0, 0.08, 0.03);
    headGroup.add(visorMesh);

    // Curved Specular Glint Line on Visor
    const glintGeo = new THREE.CylinderGeometry(0.59, 0.59, 0.04, 32, 1, false, -Math.PI * 0.2, Math.PI * 0.3);
    const glintMesh = new THREE.Mesh(glintGeo, whiteZipperMat);
    glintMesh.position.set(0, 0.12, 0.03);
    headGroup.add(glintMesh);

    // FACIAL EYES & BLINK RIG
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.2, -0.05, 0.52);
    headGroup.add(rightEyeGroup);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), darkCollarMat);
    rightEyeGroup.add(rightEye);

    const rightShine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), whiteZipperMat);
    rightShine.position.set(0.02, 0.02, 0.05);
    rightEyeGroup.add(rightShine);

    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.2, -0.05, 0.52);
    headGroup.add(leftEyeGroup);

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), darkCollarMat);
    leftEyeGroup.add(leftEye);

    const leftShine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), whiteZipperMat);
    leftShine.position.set(0.02, 0.02, 0.05);
    leftEyeGroup.add(leftShine);

    // Friendly Cute Smile Curve
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.12, -0.22, 0.52),
      new THREE.Vector3(0, -0.28, 0.55),
      new THREE.Vector3(0.12, -0.22, 0.52)
    );
    const mouthMesh = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 16, 0.022, 8, false), darkCollarMat);
    headGroup.add(mouthMesh);

    // D) EXPRESS PARCEL PACKAGE
    const parcelGroup = new THREE.Group();
    parcelGroup.position.set(0, 0.28, 0.72);
    scooterGroup.add(parcelGroup);

    const parcelBox = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), parcelMat);
    parcelBox.scale.set(0.85, 0.65, 0.65);
    parcelBox.castShadow = true;
    parcelGroup.add(parcelBox);

    const ribbonH = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 24), goldDetailMat);
    ribbonH.scale.set(0.87, 1, 0.67);
    parcelGroup.add(ribbonH);

    // E) SUBTLE FLOATING AMBIENT PARTICLES
    const particlesGroup = new THREE.Group();
    const particleList = [];
    for (let i = 0; i < 18; i++) {
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x138A36, transparent: true, opacity: Math.random() * 0.4 + 0.15 })
      );
      pMesh.position.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 4
      );
      particlesGroup.add(pMesh);
      particleList.push({ mesh: pMesh, speed: Math.random() * 0.04 + 0.015 });
    }
    scene.add(particlesGroup);

    // ==========================================
    // 6. KINEMATIC DAMPED SPRINGS & LOOP PHYSICS
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = -(y / rect.height) * 2;
    };

    const handlePointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // State Variables for Kinematic Chain & Natural Blinking
    let nextBlinkTime = 2.0;
    let isBlinking = false;
    let blinkDuration = 0.15;
    let blinkProgress = 0;

    // Kinematic Spring Positional Tracking
    let bodyY = 0;
    let bodyRotY = 0;
    let headRotY = 0;
    let headRotZ = 0;
    let steeringRotY = 0;

    const clock = new THREE.Clock();
    let animFrameId;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05); // Cap delta to prevent spikes
      const elapsedTime = clock.getElapsedTime();

      // Exponential frame-rate independent lerp dampening for mouse response
      const mouseDamp = 1 - Math.exp(-6 * delta);
      targetMouseX = THREE.MathUtils.lerp(targetMouseX, mouseX, mouseDamp);
      targetMouseY = THREE.MathUtils.lerp(targetMouseY, mouseY, mouseDamp);

      // Continuous 3D Wheel Rotation around central horizontal axle
      wheelsList.forEach(w => {
        w.rotation.x += delta * 15;
      });

      // 1. PRIMARY MOTION: SCOOTER SUSPENSION & ROAD VIBRATION
      const scooterBounce = Math.sin(elapsedTime * 4.2) * 0.05 + Math.cos(elapsedTime * 8.4) * 0.01;
      const autoSteerWave = Math.sin(elapsedTime * 0.9) * 0.04;
      
      steeringRotY = THREE.MathUtils.lerp(steeringRotY, targetMouseX * 0.35 + autoSteerWave, 1 - Math.exp(-8 * delta));
      steeringGroup.rotation.y = steeringRotY;

      // Suspension compression on front fork
      forkGroup.position.y = Math.sin(elapsedTime * 8.4) * 0.012;

      // Master Scooter Ride Height & Pitch Damping
      scooterGroup.position.y = -0.6 + scooterBounce;
      scooterGroup.rotation.z = -steeringRotY * 0.15; // Scooter leans slightly into turns

      // 2. SECONDARY MOTION: BODY FOLLOWS SCOOTER WITH DELAY & OVERSHOOT
      const targetBodyY = scooterBounce * 0.7;
      bodyY = THREE.MathUtils.lerp(bodyY, targetBodyY, 1 - Math.exp(-10 * delta));
      bodyGroup.position.y = 0.2 + bodyY;

      bodyRotY = THREE.MathUtils.lerp(bodyRotY, targetMouseX * 0.25, 1 - Math.exp(-7 * delta));
      bodyGroup.rotation.y = bodyRotY;
      bodyGroup.rotation.z = -steeringRotY * 0.08;

      // 3. SECONDARY MOTION: HEAD FOLLOWS BODY WITH INERTIA & DELAY
      headRotY = THREE.MathUtils.lerp(headRotY, targetMouseX * 0.35 + Math.sin(elapsedTime * 1.8) * 0.05, 1 - Math.exp(-5 * delta));
      headRotZ = THREE.MathUtils.lerp(headRotZ, Math.sin(elapsedTime * 2.5) * 0.035, 1 - Math.exp(-5 * delta));

      headGroup.rotation.y = headRotY;
      headGroup.rotation.z = headRotZ;
      headGroup.rotation.x = -targetMouseY * 0.12 + Math.sin(elapsedTime * 3.5) * 0.02;

      // 4. FACIAL BLINKING LOGIC (NATURAL 3-6s RANDOM INTERVALS)
      if (elapsedTime > nextBlinkTime && !isBlinking) {
        isBlinking = true;
        blinkProgress = 0;
      }

      if (isBlinking) {
        blinkProgress += delta / blinkDuration;
        const eyeScaleY = Math.abs(Math.sin(blinkProgress * Math.PI));
        rightEyeGroup.scale.y = 1 - eyeScaleY * 0.9;
        leftEyeGroup.scale.y = 1 - eyeScaleY * 0.9;

        if (blinkProgress >= 1) {
          isBlinking = false;
          nextBlinkTime = elapsedTime + 3.0 + Math.random() * 3.5;
        }
      }

      // 5. CAMERA FLOATING PARALLAX
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetMouseX * 0.15, 1 - Math.exp(-4 * delta));
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.35 + targetMouseY * 0.1, 1 - Math.exp(-4 * delta));
      camera.lookAt(0, 0.4, 0);

      // Ground Shadow Scale & Opacity Damping based on bounce
      const shadowScale = 1 - scooterBounce * 0.6;
      groundShadow.scale.set(shadowScale, shadowScale, 1);
      shadowMat.opacity = 0.52 - scooterBounce * 0.4;

      // Ambient Floating Particles
      particleList.forEach(p => {
        p.mesh.position.z += p.speed * (delta * 60);
        if (p.mesh.position.z > 3.8) {
          p.mesh.position.z = -4.5;
          p.mesh.position.x = (Math.random() - 0.5) * 5;
          p.mesh.position.y = (Math.random() - 0.5) * 3.5;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 7. RESPONSIVE RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-[340px] md:h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* Soft Ambient Radial Backlight */}
      <div className="absolute inset-0 bg-radial from-[#138A36]/25 via-[#138A36]/5 to-transparent blur-3xl pointer-events-none"></div>
    </div>
  );
}
