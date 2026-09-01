import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DeliveryBoy3D({ className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ============================================================
    // 1. SCENE / CAMERA / RENDERER
    // ============================================================

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      1,
      0.05,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      precision: "highp",
      logarithmicDepthBuffer: true,
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setClearAlpha(0);

    container.appendChild(renderer.domElement);

    // ============================================================
    // 2. CAMERA ORBIT
    // ============================================================

    const orbit = {
      yaw: 0.22,
      pitch: 0.31,
      radius: 6.2,

      targetYaw: 0.22,
      targetPitch: 0.31,
      targetRadius: 6.2,

      autoRotate: true,
      autoRotateSpeed: 0.075,

      idleTimer: 0,
    };

    const MIN_PITCH = 0.05;
    const MAX_PITCH = 1.12;

    const MIN_RADIUS = 3.5;
    const MAX_RADIUS = 10;

    let isDragging = false;

    let lastPointerX = 0;
    let lastPointerY = 0;

    let mouseX = 0;
    let mouseY = 0;

    // ============================================================
    // 3. REALISTIC SKY / ENVIRONMENT
    // ============================================================

    const skyCanvas = document.createElement("canvas");

    skyCanvas.width = 2048;
    skyCanvas.height = 1024;

    const skyCtx = skyCanvas.getContext("2d");

    // Sky
    const skyGradient = skyCtx.createLinearGradient(
      0,
      0,
      0,
      1024
    );

    skyGradient.addColorStop(0, "#3F6793");
    skyGradient.addColorStop(0.28, "#7198BB");
    skyGradient.addColorStop(0.48, "#AFCADB");
    skyGradient.addColorStop(0.60, "#DDE5E3");
    skyGradient.addColorStop(0.72, "#E9E1D3");
    skyGradient.addColorStop(1, "#A7A59C");

    skyCtx.fillStyle = skyGradient;
    skyCtx.fillRect(
      0,
      0,
      2048,
      1024
    );

    // Sun glow
    const sunGradient =
      skyCtx.createRadialGradient(
        1530,
        230,
        15,
        1530,
        230,
        430
      );

    sunGradient.addColorStop(
      0,
      "rgba(255,255,235,1)"
    );

    sunGradient.addColorStop(
      0.12,
      "rgba(255,249,220,.78)"
    );

    sunGradient.addColorStop(
      0.35,
      "rgba(255,231,190,.25)"
    );

    sunGradient.addColorStop(
      1,
      "rgba(255,225,180,0)"
    );

    skyCtx.fillStyle = sunGradient;

    skyCtx.fillRect(
      0,
      0,
      2048,
      1024
    );

    // Soft clouds
    for (let i = 0; i < 14; i++) {
      const x =
        100 +
        i * 150;

      const y =
        380 +
        Math.sin(i * 1.35) * 60;

      const cloud =
        skyCtx.createRadialGradient(
          x,
          y,
          5,
          x,
          y,
          190
        );

      cloud.addColorStop(
        0,
        "rgba(255,255,255,.18)"
      );

      cloud.addColorStop(
        1,
        "rgba(255,255,255,0)"
      );

      skyCtx.fillStyle = cloud;

      skyCtx.beginPath();

      skyCtx.ellipse(
        x,
        y,
        250,
        45,
        0,
        0,
        Math.PI * 2
      );

      skyCtx.fill();
    }

    // Horizon haze
    const horizonGradient =
      skyCtx.createLinearGradient(
        0,
        530,
        0,
        1024
      );

    horizonGradient.addColorStop(
      0,
      "rgba(232,231,216,.8)"
    );

    horizonGradient.addColorStop(
      1,
      "rgba(145,145,137,.98)"
    );

    skyCtx.fillStyle =
      horizonGradient;

    skyCtx.fillRect(
      0,
      530,
      2048,
      494
    );

    const skyTexture =
      new THREE.CanvasTexture(
        skyCanvas
      );

    skyTexture.mapping =
      THREE.EquirectangularReflectionMapping;

    skyTexture.colorSpace =
      THREE.SRGBColorSpace;

    const pmremGenerator =
      new THREE.PMREMGenerator(
        renderer
      );

    pmremGenerator.compileEquirectangularShader();

    const environment =
      pmremGenerator.fromEquirectangular(
        skyTexture
      ).texture;

    scene.environment =
      environment;

    scene.background =
      environment;

    scene.backgroundBlurriness =
      0.58;

    scene.backgroundIntensity =
      0.9;

    // Atmospheric fog
    scene.fog = new THREE.Fog(
      0xBAC5C7,
      10,
      31
    );

    // ============================================================
    // 4. LIGHTING
    // ============================================================

    const hemisphere =
      new THREE.HemisphereLight(
        0xBBD6EF,
        0x5D5549,
        1.0
      );

    scene.add(hemisphere);

    const ambient =
      new THREE.AmbientLight(
        0xFFFFFF,
        0.18
      );

    scene.add(ambient);

    // Main sunlight
    const keyLight =
      new THREE.DirectionalLight(
        0xFFF0D0,
        3.0
      );

    keyLight.position.set(
      6,
      10,
      7
    );

    keyLight.castShadow = true;

    keyLight.shadow.mapSize.width =
      2048;

    keyLight.shadow.mapSize.height =
      2048;

    keyLight.shadow.camera.near =
      0.1;

    keyLight.shadow.camera.far =
      35;

    keyLight.shadow.camera.left =
      -6;

    keyLight.shadow.camera.right =
      6;

    keyLight.shadow.camera.top =
      6;

    keyLight.shadow.camera.bottom =
      -6;

    keyLight.shadow.bias =
      -0.00015;

    keyLight.shadow.normalBias =
      0.025;

    scene.add(keyLight);

    // Cool fill
    const fillLight =
      new THREE.DirectionalLight(
        0xDDEEFF,
        0.65
      );

    fillLight.position.set(
      -6,
      5,
      4
    );

    scene.add(fillLight);

    // Green rim
    const greenRim =
      new THREE.PointLight(
        0x16A548,
        2.5,
        11
      );

    greenRim.position.set(
      -4,
      3.5,
      -3
    );

    scene.add(greenRim);

    // Warm rim
    const warmRim =
      new THREE.PointLight(
        0xFFB52A,
        1.6,
        9
      );

    warmRim.position.set(
      4,
      1.5,
      4
    );

    scene.add(warmRim);

    // Camera fill
    const followLight =
      new THREE.PointLight(
        0xFFFFFF,
        0.7,
        15
      );

    scene.add(followLight);

    // ============================================================
    // 5. REALISTIC MATERIALS
    // ============================================================

    const physicalMaterial = ({
      color,
      roughness,
      metalness,
      clearcoat = 0,
      clearcoatRoughness = 0.25,
      emissive = 0x000000,
      emissiveIntensity = 0,
    }) => {
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness,
        metalness,
        clearcoat,
        clearcoatRoughness,
        emissive,
        emissiveIntensity,
        envMapIntensity: 1.2,
      });
    };

    const greenBodyMat =
      physicalMaterial({
        color: 0x128C3A,
        roughness: 0.22,
        metalness: 0.12,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
      });

    const darkGreenMat =
      physicalMaterial({
        color: 0x075D29,
        roughness: 0.2,
        metalness: 0.15,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      });

    const skinMat =
      physicalMaterial({
        color: 0xE8AD83,
        roughness: 0.48,
        metalness: 0.0,
      });

    const blackMat =
      physicalMaterial({
        color: 0x111315,
        roughness: 0.32,
        metalness: 0.18,
      });

    const rubberMat =
      physicalMaterial({
        color: 0x101112,
        roughness: 0.88,
        metalness: 0.02,
      });

    const chromeMat =
      physicalMaterial({
        color: 0xE8EDF0,
        roughness: 0.07,
        metalness: 0.96,
      });

    const darkChromeMat =
      physicalMaterial({
        color: 0x51585C,
        roughness: 0.18,
        metalness: 0.88,
      });

    const goldMat =
      physicalMaterial({
        color: 0xFFB20A,
        roughness: 0.16,
        metalness: 0.82,
        clearcoat: 0.5,
        clearcoatRoughness: 0.08,
      });

    const parcelMat =
      physicalMaterial({
        color: 0xC88C4C,
        roughness: 0.75,
        metalness: 0,
      });

    const whiteMat =
      physicalMaterial({
        color: 0xFFFFFF,
        roughness: 0.2,
        metalness: 0,
      });

    const visorMat =
      physicalMaterial({
        color: 0x050607,
        roughness: 0.025,
        metalness: 0.92,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
      });

    const tailLightMat =
      physicalMaterial({
        color: 0x670000,
        roughness: 0.2,
        metalness: 0,
        emissive: 0xFF0505,
        emissiveIntensity: 1.5,
      });

    const headlightMat =
      physicalMaterial({
        color: 0xFFFFFF,
        roughness: 0.02,
        metalness: 0.05,
        emissive: 0xFFFFFF,
        emissiveIntensity: 2.6,
      });

    // ============================================================
    // 6. GROUND / ASPHALT
    // ============================================================

    const asphaltCanvas =
      document.createElement("canvas");

    asphaltCanvas.width = 1024;
    asphaltCanvas.height = 1024;

    const asphaltCtx =
      asphaltCanvas.getContext("2d");

    asphaltCtx.fillStyle =
      "#363A3D";

    asphaltCtx.fillRect(
      0,
      0,
      1024,
      1024
    );

    // Asphalt micro texture
    for (
      let i = 0;
      i < 18000;
      i++
    ) {
      const brightness =
        25 +
        Math.random() * 55;

      const alpha =
        0.06 +
        Math.random() * 0.18;

      asphaltCtx.fillStyle =
        `rgba(${brightness},${brightness},${brightness},${alpha})`;

      const size =
        0.2 +
        Math.random() * 2.4;

      asphaltCtx.fillRect(
        Math.random() * 1024,
        Math.random() * 1024,
        size,
        size
      );
    }

    // Small road cracks
    asphaltCtx.strokeStyle =
      "rgba(0,0,0,.16)";

    asphaltCtx.lineWidth = 2;

    for (
      let i = 0;
      i < 40;
      i++
    ) {
      let x =
        Math.random() *
        1024;

      let y =
        Math.random() *
        1024;

      asphaltCtx.beginPath();

      asphaltCtx.moveTo(
        x,
        y
      );

      for (
        let j = 0;
        j < 5;
        j++
      ) {
        x +=
          (Math.random() -
            0.5) *
          100;

        y +=
          Math.random() *
          80;

        asphaltCtx.lineTo(
          x,
          y
        );
      }

      asphaltCtx.stroke();
    }

    // Lane marking
    asphaltCtx.strokeStyle =
      "rgba(240,230,205,.35)";

    asphaltCtx.lineWidth = 12;

    asphaltCtx.setLineDash([
      90,
      70,
    ]);

    asphaltCtx.beginPath();

    asphaltCtx.moveTo(
      512,
      0
    );

    asphaltCtx.lineTo(
      512,
      1024
    );

    asphaltCtx.stroke();

    const asphaltTexture =
      new THREE.CanvasTexture(
        asphaltCanvas
      );

    asphaltTexture.wrapS =
      THREE.RepeatWrapping;

    asphaltTexture.wrapT =
      THREE.RepeatWrapping;

    asphaltTexture.repeat.set(
      5,
      5
    );

    asphaltTexture.colorSpace =
      THREE.SRGBColorSpace;

    const asphaltMaterial =
      new THREE.MeshStandardMaterial({
        map: asphaltTexture,
        roughness: 0.94,
        metalness: 0.02,
      });

    const ground =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          50,
          50
        ),
        asphaltMaterial
      );

    ground.rotation.x =
      -Math.PI / 2;

    ground.position.y =
      -1.31;

    ground.receiveShadow = true;

    scene.add(ground);

    // ============================================================
    // 7. CONTACT SHADOW
    // ============================================================

    const shadowCanvas =
      document.createElement("canvas");

    shadowCanvas.width = 512;
    shadowCanvas.height = 512;

    const shadowCtx =
      shadowCanvas.getContext("2d");

    const shadowGradient =
      shadowCtx.createRadialGradient(
        256,
        256,
        5,
        256,
        256,
        256
      );

    shadowGradient.addColorStop(
      0,
      "rgba(0,0,0,.65)"
    );

    shadowGradient.addColorStop(
      0.35,
      "rgba(0,0,0,.38)"
    );

    shadowGradient.addColorStop(
      0.7,
      "rgba(0,0,0,.12)"
    );

    shadowGradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );

    shadowCtx.fillStyle =
      shadowGradient;

    shadowCtx.fillRect(
      0,
      0,
      512,
      512
    );

    const shadowTexture =
      new THREE.CanvasTexture(
        shadowCanvas
      );

    const shadowMaterial =
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.56,
      });

    const contactShadow =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          3.8,
          2.5
        ),
        shadowMaterial
      );

    contactShadow.rotation.x =
      -Math.PI / 2;

    contactShadow.position.y =
      -1.295;

    scene.add(contactShadow);

    // ============================================================
    // 8. MASTER GROUP
    // ============================================================

    const orbitGroup =
      new THREE.Group();

    scene.add(orbitGroup);

    const masterGroup =
      new THREE.Group();

    orbitGroup.add(
      masterGroup
    );

    const scooterGroup =
      new THREE.Group();

    scooterGroup.position.y =
      -0.58;

    masterGroup.add(
      scooterGroup
    );

    const bodyGroup =
      new THREE.Group();

    bodyGroup.position.y =
      0.18;

    masterGroup.add(
      bodyGroup
    );

    // ============================================================
    // 9. HELPER
    // ============================================================

    const castReceiveShadow = (
      mesh
    ) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const cylinderBetween = (
      start,
      end,
      radius,
      material,
      segments = 18
    ) => {
      const direction =
        new THREE.Vector3()
          .subVectors(
            end,
            start
          );

      const length =
        direction.length();

      const geometry =
        new THREE.CylinderGeometry(
          radius,
          radius,
          length,
          segments
        );

      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );

      mesh.position
        .copy(start)
        .add(end)
        .multiplyScalar(0.5);

      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(
          0,
          1,
          0
        ),
        direction.normalize()
      );

      return castReceiveShadow(
        mesh
      );
    };

    // ============================================================
    // 10. SCOOTER FRONT BODY
    // ============================================================

    const frontShield =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.62,
            48,
            32
          ),
          greenBodyMat
        )
      );

    frontShield.scale.set(
      0.92,
      0.86,
      0.48
    );

    frontShield.position.set(
      0,
      0.28,
      0.38
    );

    scooterGroup.add(
      frontShield
    );

    // Lower front panel
    const lowerPanel =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.42,
            40,
            24
          ),
          darkGreenMat
        )
      );

    lowerPanel.scale.set(
      0.82,
      0.58,
      0.42
    );

    lowerPanel.position.set(
      0,
      -0.05,
      0.43
    );

    scooterGroup.add(
      lowerPanel
    );

    // ============================================================
    // 11. FRONT GOLD BADGE
    // ============================================================

    const badge =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.14,
          0.14,
          0.045,
          48
        ),
        goldMat
      );

    badge.rotation.x =
      Math.PI / 2;

    badge.position.set(
      0,
      0.30,
      0.69
    );

    scooterGroup.add(
      badge
    );

    // ============================================================
    // 12. DECK
    // ============================================================

    const deck =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.66,
            0.18,
            1.2
          ),
          greenBodyMat
        )
      );

    deck.position.set(
      0,
      -0.43,
      -0.12
    );

    deck.rotation.x =
      -0.02;

    scooterGroup.add(
      deck
    );

    // Rubber foot area
    const footBoard =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.48,
          0.035,
          0.7
        ),
        rubberMat
      );

    footBoard.position.set(
      0,
      -0.325,
      -0.13
    );

    scooterGroup.add(
      footBoard
    );

    // ============================================================
    // 13. REAR BODY
    // ============================================================

    const rearBody =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.46,
            40,
            30
          ),
          greenBodyMat
        )
      );

    rearBody.scale.set(
      0.9,
      0.62,
      1.18
    );

    rearBody.position.set(
      0,
      -0.02,
      -0.7
    );

    scooterGroup.add(
      rearBody
    );

    // ============================================================
    // 14. SEAT
    // ============================================================

    const seat =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.CapsuleGeometry(
            0.25,
            0.55,
            8,
            24
          ),
          blackMat
        )
      );

    seat.rotation.z =
      Math.PI / 2;

    seat.position.set(
      0,
      0.17,
      -0.30
    );

    scooterGroup.add(
      seat
    );

    // ============================================================
    // 15. TAIL LIGHT
    // ============================================================

    const tailLightMesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.25,
          0.11,
          0.055
        ),
        tailLightMat
      );

    tailLightMesh.position.set(
      0,
      0.07,
      -1.18
    );

    scooterGroup.add(
      tailLightMesh
    );

    const tailGlow =
      new THREE.PointLight(
        0xFF1010,
        0.45,
        2.5
      );

    tailGlow.position.set(
      0,
      0.07,
      -1.22
    );

    scooterGroup.add(
      tailGlow
    );

    // ============================================================
    // 16. LICENSE PLATE
    // ============================================================

    const plate =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.27,
          0.15,
          0.025
        ),
        whiteMat
      );

    plate.position.set(
      0,
      -0.18,
      -1.18
    );

    scooterGroup.add(
      plate
    );

    // ============================================================
    // 17. EXHAUST
    // ============================================================

    const exhaustGroup =
      new THREE.Group();

    exhaustGroup.position.set(
      0.31,
      -0.72,
      -0.58
    );

    scooterGroup.add(
      exhaustGroup
    );

    const exhaustPipe =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.045,
          0.065,
          0.58,
          24
        ),
        chromeMat
      );

    exhaustPipe.rotation.x =
      Math.PI / 2.2;

    exhaustGroup.add(
      exhaustPipe
    );

    const exhaustTip =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.065,
          0.065,
          0.08,
          24
        ),
        blackMat
      );

    exhaustTip.position.z =
      0.31;

    exhaustTip.rotation.x =
      Math.PI / 2.2;

    exhaustGroup.add(
      exhaustTip
    );

    // ============================================================
    // 18. STEERING
    // ============================================================

    const steeringGroup =
      new THREE.Group();

    steeringGroup.position.set(
      0,
      0.60,
      0.37
    );

    scooterGroup.add(
      steeringGroup
    );

    // Stem
    const steeringStem =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.038,
          0.045,
          0.45,
          20
        ),
        darkChromeMat
      );

    steeringStem.position.y =
      -0.22;

    steeringGroup.add(
      steeringStem
    );

    // Handlebar
    const handleCurve =
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(
          -0.65,
          0,
          0
        ),
        new THREE.Vector3(
          0,
          0.12,
          0.02
        ),
        new THREE.Vector3(
          0.65,
          0,
          0
        )
      );

    const handlebar =
      new THREE.Mesh(
        new THREE.TubeGeometry(
          handleCurve,
          32,
          0.035,
          12,
          false
        ),
        blackMat
      );

    steeringGroup.add(
      handlebar
    );

    // ============================================================
    // 19. HEADLIGHT
    // ============================================================

    const headlightHousing =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.19,
          0.035,
          16,
          48
        ),
        chromeMat
      );

    headlightHousing.position.set(
      0,
      0,
      0.19
    );

    steeringGroup.add(
      headlightHousing
    );

    const headlight =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.17,
          40,
          24
        ),
        headlightMat
      );

    headlight.scale.z =
      0.38;

    headlight.position.set(
      0,
      0,
      0.19
    );

    steeringGroup.add(
      headlight
    );

    const headlightGlow =
      new THREE.PointLight(
        0xFFFFFF,
        0.8,
        4
      );

    headlightGlow.position.set(
      0,
      0,
      0.42
    );

    steeringGroup.add(
      headlightGlow
    );

    // ============================================================
    // 20. MIRRORS
    // ============================================================

    const createMirror = (
      side
    ) => {
      const group =
        new THREE.Group();

      group.position.set(
        side * 0.57,
        0.22,
        0
      );

      const stalk =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.014,
            0.02,
            0.28,
            16
          ),
          blackMat
        );

      stalk.rotation.z =
        side > 0
          ? -0.32
          : 0.32;

      group.add(
        stalk
      );

      const mirror =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.105,
            24,
            16
          ),
          visorMat
        );

      mirror.scale.set(
        1,
        0.85,
        0.32
      );

      mirror.position.set(
        side * 0.055,
        0.15,
        0
      );

      group.add(
        mirror
      );

      steeringGroup.add(
        group
      );
    };

    createMirror(-1);
    createMirror(1);

    // ============================================================
    // 21. FRONT WHEEL + SUSPENSION
    // ============================================================

    const frontWheelPivot =
      new THREE.Group();

    frontWheelPivot.position.set(
      0,
      -0.87,
      0.73
    );

    scooterGroup.add(
      frontWheelPivot
    );

    const forkGroup =
      new THREE.Group();

    steeringGroup.add(
      forkGroup
    );

    const forkCrown =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.28,
          0.055,
          0.09
        ),
        blackMat
      );

    forkCrown.position.set(
      0,
      -0.37,
      0.3
    );

    forkGroup.add(
      forkCrown
    );

    for (
      const side of [-1, 1]
    ) {
      const forkOuter =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.028,
            0.032,
            0.38,
            20
          ),
          blackMat
        );

      forkOuter.position.set(
        side * 0.13,
        -0.56,
        0.4
      );

      forkGroup.add(
        forkOuter
      );

      const forkInner =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.018,
            0.018,
            0.30,
            20
          ),
          chromeMat
        );

      forkInner.position.set(
        side * 0.13,
        -0.72,
        0.4
      );

      forkGroup.add(
        forkInner
      );
    }

    // ============================================================
    // 22. REAR WHEEL
    // ============================================================

    const rearWheelGroup =
      new THREE.Group();

    rearWheelGroup.position.set(
      0,
      -0.87,
      -0.57
    );

    scooterGroup.add(
      rearWheelGroup
    );

    const createWheel =
      (parent) => {
        const tire =
          new THREE.Mesh(
            new THREE.TorusGeometry(
              0.35,
              0.105,
              32,
              72
            ),
            rubberMat
          );

        tire.castShadow = true;
        tire.receiveShadow = true;

        parent.add(
          tire
        );

        const rim =
          new THREE.Mesh(
            new THREE.CylinderGeometry(
              0.245,
              0.245,
              0.14,
              48
            ),
            chromeMat
          );

        rim.rotation.x =
          Math.PI / 2;

        parent.add(
          rim
        );

        const hub =
          new THREE.Mesh(
            new THREE.CylinderGeometry(
              0.075,
              0.075,
              0.18,
              24
            ),
            darkChromeMat
          );

        hub.rotation.x =
          Math.PI / 2;

        parent.add(
          hub
        );

        for (
          let i = 0;
          i < 10;
          i++
        ) {
          const spoke =
            new THREE.Mesh(
              new THREE.BoxGeometry(
                0.46,
                0.018,
                0.018
              ),
              chromeMat
            );

          spoke.rotation.z =
            (Math.PI * 2 * i) /
            10;

          parent.add(
            spoke
          );
        }
      };

    createWheel(
      frontWheelPivot
    );

    createWheel(
      rearWheelGroup
    );

    // ============================================================
    // 23. RIDER BODY
    // ============================================================

    const torso =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.49,
            40,
            32
          ),
          greenBodyMat
        )
      );

    torso.scale.set(
      1,
      1.2,
      0.92
    );

    torso.position.set(
      0,
      0.5,
      0
    );

    bodyGroup.add(
      torso
    );

    // Collar
    const collar =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.35,
          0.065,
          16,
          40
        ),
        blackMat
      );

    collar.rotation.x =
      Math.PI / 2;

    collar.position.set(
      0,
      0.99,
      0
    );

    bodyGroup.add(
      collar
    );

    // Zipper
    const zipper =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.022,
          0.022,
          0.9,
          16
        ),
        whiteMat
      );

    zipper.position.set(
      0,
      0.52,
      0.44
    );

    bodyGroup.add(
      zipper
    );

    // ============================================================
    // 24. ARMS
    // ============================================================

    const createArm = (
      side
    ) => {
      const armGroup =
        new THREE.Group();

      armGroup.position.set(
        side * 0.40,
        0.82,
        0
      );

      bodyGroup.add(
        armGroup
      );

      const shoulder =
        new THREE.Vector3(
          0,
          0,
          0
        );

      const elbow =
        new THREE.Vector3(
          side * 0.16,
          -0.26,
          0.21
        );

      const hand =
        new THREE.Vector3(
          side * 0.22,
          -0.18,
          0.4
        );

      armGroup.add(
        cylinderBetween(
          shoulder,
          elbow,
          0.09,
          greenBodyMat
        )
      );

      armGroup.add(
        cylinderBetween(
          elbow,
          hand,
          0.075,
          greenBodyMat
        )
      );

      const handMesh =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.085,
            20,
            16
          ),
          skinMat
        );

      handMesh.position.copy(
        hand
      );

      armGroup.add(
        handMesh
      );
    };

    createArm(-1);
    createArm(1);

    // ============================================================
    // 25. LEGS
    // ============================================================

    const createLeg = (
      side
    ) => {
      const legGroup =
        new THREE.Group();

      legGroup.position.set(
        side * 0.23,
        0.1,
        0.04
      );

      bodyGroup.add(
        legGroup
      );

      const hip =
        new THREE.Vector3(
          0,
          0,
          0
        );

      const knee =
        new THREE.Vector3(
          side * 0.14,
          -0.28,
          0.27
        );

      const ankle =
        new THREE.Vector3(
          side * 0.16,
          -0.62,
          0.12
        );

      legGroup.add(
        cylinderBetween(
          hip,
          knee,
          0.105,
          greenBodyMat
        )
      );

      legGroup.add(
        cylinderBetween(
          knee,
          ankle,
          0.085,
          blackMat
        )
      );

      const shoe =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.12,
            24,
            16
          ),
          blackMat
        );

      shoe.scale.set(
        1,
        0.75,
        1.65
      );

      shoe.position.set(
        side * 0.16,
        -0.67,
        0.2
      );

      legGroup.add(
        shoe
      );
    };

    createLeg(-1);
    createLeg(1);

    // ============================================================
    // 26. BACKPACK
    // ============================================================

    const backpack =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.5,
            40,
            28
          ),
          darkGreenMat
        )
      );

    backpack.scale.set(
      0.88,
      1.12,
      0.62
    );

    backpack.position.set(
      0,
      0.58,
      -0.44
    );

    bodyGroup.add(
      backpack
    );

    // Backpack front panel
    const backpackPanel =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.48,
          0.56,
          0.045
        ),
        greenBodyMat
      );

    backpackPanel.position.set(
      0,
      0.58,
      -0.82
    );

    bodyGroup.add(
      backpackPanel
    );

    // Gold stripe
    const backpackStripe =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.65,
          0.08,
          0.03
        ),
        goldMat
      );

    backpackStripe.position.set(
      0,
      0.60,
      -0.82
    );

    bodyGroup.add(
      backpackStripe
    );

    // Straps
    for (
      const side of [-1, 1]
    ) {
      const strapCurve =
        new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(
            side * 0.28,
            0.93,
            -0.25
          ),
          new THREE.Vector3(
            side * 0.18,
            0.72,
            0.22
          ),
          new THREE.Vector3(
            side * 0.12,
            0.35,
            0.4
          )
        );

      const strap =
        new THREE.Mesh(
          new THREE.TubeGeometry(
            strapCurve,
            18,
            0.035,
            8,
            false
          ),
          blackMat
        );

      bodyGroup.add(
        strap
      );
    }

    // ============================================================
    // 27. HEAD
    // ============================================================

    const headGroup =
      new THREE.Group();

    headGroup.position.set(
      0,
      1.48,
      0
    );

    bodyGroup.add(
      headGroup
    );

    // Face
    const face =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.55,
            48,
            36
          ),
          skinMat
        )
      );

    headGroup.add(
      face
    );

    // ============================================================
    // 28. HELMET
    // ============================================================

    const helmet =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.59,
            48,
            32,
            0,
            Math.PI * 2,
            0,
            Math.PI * 0.58
          ),
          darkGreenMat
        )
      );

    helmet.position.y =
      0.02;

    headGroup.add(
      helmet
    );

    // Helmet ear sections
    for (
      const side of [-1, 1]
    ) {
      const ear =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.14,
            20,
            16
          ),
          darkGreenMat
        );

      ear.scale.z =
        0.45;

      ear.position.set(
        side * 0.48,
        -0.02,
        0
      );

      headGroup.add(
        ear
      );
    }

    // Helmet vent
    const helmetVent =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.08,
          0.055,
          0.15
        ),
        blackMat
      );

    helmetVent.position.set(
      0,
      0.38,
      -0.38
    );

    headGroup.add(
      helmetVent
    );

    // ============================================================
    // 29. VISOR
    // ============================================================

    const visorBrim =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.65,
          0.69,
          0.055,
          48,
          1,
          false,
          -Math.PI * 0.42,
          Math.PI * 0.84
        ),
        blackMat
      );

    visorBrim.position.set(
      0,
      0.17,
      0.26
    );

    visorBrim.rotation.x =
      0.16;

    headGroup.add(
      visorBrim
    );

    const visor =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.575,
          0.575,
          0.22,
          48,
          1,
          false,
          -Math.PI * 0.39,
          Math.PI * 0.78
        ),
        visorMat
      );

    visor.position.set(
      0,
      0.07,
      0.045
    );

    headGroup.add(
      visor
    );

    // Visor highlight
    const visorHighlight =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.58,
          0.58,
          0.018,
          48,
          1,
          false,
          -Math.PI * 0.18,
          Math.PI * 0.32
        ),
        whiteMat
      );

    visorHighlight.position.set(
      -0.13,
      0.13,
      0.06
    );

    visorHighlight.rotation.z =
      -0.25;

    headGroup.add(
      visorHighlight
    );

    // ============================================================
    // 30. EYES
    // ============================================================

    const eyeGroups = [];

    for (
      const side of [-1, 1]
    ) {
      const eyeGroup =
        new THREE.Group();

      eyeGroup.position.set(
        side * 0.20,
        -0.055,
        0.51
      );

      headGroup.add(
        eyeGroup
      );

      const eye =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.066,
            20,
            16
          ),
          blackMat
        );

      eyeGroup.add(
        eye
      );

      const eyeShine =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.021,
            12,
            10
          ),
          whiteMat
        );

      eyeShine.position.set(
        0.02,
        0.025,
        0.055
      );

      eyeGroup.add(
        eyeShine
      );

      eyeGroups.push(
        eyeGroup
      );
    }

    // ============================================================
    // 31. MOUTH
    // ============================================================

    const mouthCurve =
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(
          -0.12,
          -0.22,
          0.51
        ),
        new THREE.Vector3(
          0,
          -0.275,
          0.55
        ),
        new THREE.Vector3(
          0.12,
          -0.22,
          0.51
        )
      );

    const mouth =
      new THREE.Mesh(
        new THREE.TubeGeometry(
          mouthCurve,
          20,
          0.018,
          10,
          false
        ),
        blackMat
      );

    headGroup.add(
      mouth
    );

    // ============================================================
    // 32. DELIVERY PARCEL
    // ============================================================

    const parcelGroup =
      new THREE.Group();

    parcelGroup.position.set(
      0,
      0.3,
      0.72
    );

    scooterGroup.add(
      parcelGroup
    );

    const parcelBox =
      castReceiveShadow(
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.52,
            0.42,
            0.42
          ),
          parcelMat
        )
      );

    parcelGroup.add(
      parcelBox
    );

    // Horizontal tape
    const parcelTapeH =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.10,
          0.43,
          0.44
        ),
        goldMat
      );

    parcelGroup.add(
      parcelTapeH
    );

    // Vertical tape
    const parcelTapeV =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.53,
          0.10,
          0.43
        ),
        goldMat
      );

    parcelGroup.add(
      parcelTapeV
    );

    // ============================================================
    // 33. AMBIENT PARTICLES
    // ============================================================

    const particlesGroup =
      new THREE.Group();

    const particles = [];

    const particleGeometry =
      new THREE.SphereGeometry(
        0.025,
        8,
        8
      );

    for (
      let i = 0;
      i < 30;
      i++
    ) {
      const particleMaterial =
        new THREE.MeshBasicMaterial({
          color:
            i % 2 === 0
              ? 0x79CA91
              : 0xFFD66B,
          transparent: true,
          opacity:
            0.06 +
            Math.random() * 0.18,
        });

      const particle =
        new THREE.Mesh(
          particleGeometry,
          particleMaterial
        );

      particle.position.set(
        (Math.random() - 0.5) * 6,
        Math.random() * 4 - 1,
        (Math.random() - 0.5) * 6
      );

      particlesGroup.add(
        particle
      );

      particles.push({
        mesh: particle,
        speed:
          0.12 +
          Math.random() * 0.35,
        phase:
          Math.random() *
          Math.PI *
          2,
      });
    }

    scene.add(
      particlesGroup
    );

    // ============================================================
    // 34. SPRING PHYSICS
    // ============================================================

    const createSpring = (
      stiffness,
      damping
    ) => {
      const spring = {
        value: 0,
        velocity: 0,
        target: 0,
      };

      spring.update = (
        dt
      ) => {
        const force =
          (spring.target -
            spring.value) *
          stiffness -
          spring.velocity *
          damping;

        spring.velocity +=
          force * dt;

        spring.value +=
          spring.velocity * dt;

        return spring.value;
      };

      return spring;
    };

    const leanSpring =
      createSpring(
        75,
        11
      );

    const suspensionSpring =
      createSpring(
        230,
        18
      );

    const bodySpring =
      createSpring(
        90,
        13
      );

    const backpackSpring =
      createSpring(
        110,
        12
      );

    const parcelSpring =
      createSpring(
        125,
        12
      );

    // ============================================================
    // 35. POINTER CONTROLS
    // ============================================================

    const handlePointerDown = (
      event
    ) => {
      isDragging = true;

      orbit.autoRotate =
        false;

      orbit.idleTimer = 0;

      lastPointerX =
        event.clientX;

      lastPointerY =
        event.clientY;

      container.style.cursor =
        "grabbing";

      try {
        renderer.domElement.setPointerCapture(
          event.pointerId
        );
      } catch { }
    };

    const handlePointerMove = (
      event
    ) => {
      const rect =
        container.getBoundingClientRect();

      mouseX =
        ((event.clientX -
          rect.left) /
          rect.width) *
        2 -
        1;

      mouseY =
        -(
          ((event.clientY -
            rect.top) /
            rect.height) *
          2 -
          1
        );

      if (!isDragging) {
        return;
      }

      const dx =
        event.clientX -
        lastPointerX;

      const dy =
        event.clientY -
        lastPointerY;

      orbit.targetYaw +=
        dx * 0.007;

      orbit.targetPitch =
        THREE.MathUtils.clamp(
          orbit.targetPitch -
          dy * 0.005,
          MIN_PITCH,
          MAX_PITCH
        );

      lastPointerX =
        event.clientX;

      lastPointerY =
        event.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;

      orbit.idleTimer = 0;

      container.style.cursor =
        "grab";
    };

    const handlePointerLeave = () => {
      mouseX = 0;
      mouseY = 0;

      if (isDragging) {
        isDragging = false;

        container.style.cursor =
          "grab";
      }
    };

    const handleWheel = (
      event
    ) => {
      event.preventDefault();

      orbit.targetRadius =
        THREE.MathUtils.clamp(
          orbit.targetRadius +
          event.deltaY * 0.003,
          MIN_RADIUS,
          MAX_RADIUS
        );
    };

    container.style.cursor =
      "grab";

    container.style.touchAction =
      "none";

    container.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );

    container.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    container.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    // ============================================================
    // 36. BLINK STATE
    // ============================================================

    let nextBlinkTime =
      2 +
      Math.random() * 2;

    let isBlinking = false;

    let blinkProgress = 0;

    const blinkDuration =
      0.12;

    // ============================================================
    // 37. ANIMATION
    // ============================================================

    const clock =
      new THREE.Clock();

    let animationFrameId;

    let wheelRotation = 0;

    const animate = () => {
      animationFrameId =
        requestAnimationFrame(
          animate
        );

      const delta =
        Math.min(
          clock.getDelta(),
          0.033
        );

      const elapsedTime =
        clock.getElapsedTime();

      // ----------------------------------------------------------
      // CAMERA
      // ----------------------------------------------------------

      if (!isDragging) {
        orbit.idleTimer +=
          delta;

        if (
          orbit.idleTimer >
          2.4
        ) {
          orbit.autoRotate =
            true;
        }

        if (
          orbit.autoRotate
        ) {
          orbit.targetYaw +=
            orbit.autoRotateSpeed *
            delta;
        }
      }

      const cameraDamping =
        1 -
        Math.exp(
          -5.5 * delta
        );

      orbit.yaw =
        THREE.MathUtils.lerp(
          orbit.yaw,
          orbit.targetYaw,
          cameraDamping
        );

      orbit.pitch =
        THREE.MathUtils.lerp(
          orbit.pitch,
          orbit.targetPitch,
          cameraDamping
        );

      orbit.radius =
        THREE.MathUtils.lerp(
          orbit.radius,
          orbit.targetRadius,
          cameraDamping
        );

      const cameraX =
        orbit.radius *
        Math.sin(
          orbit.yaw
        ) *
        Math.cos(
          orbit.pitch
        );

      const cameraY =
        0.55 +
        orbit.radius *
        Math.sin(
          orbit.pitch
        );

      const cameraZ =
        orbit.radius *
        Math.cos(
          orbit.yaw
        ) *
        Math.cos(
          orbit.pitch
        );

      // Cinematic micro movement
      const jitterX =
        Math.sin(
          elapsedTime * 11.3
        ) *
        0.002 +
        Math.sin(
          elapsedTime * 18.2
        ) *
        0.001;

      const jitterY =
        Math.sin(
          elapsedTime * 8.2
        ) *
        0.002;

      camera.position.set(
        cameraX + jitterX,
        cameraY + jitterY,
        cameraZ
      );

      camera.lookAt(
        0,
        0.30,
        0
      );

      followLight.position.set(
        cameraX * 0.55,
        cameraY + 1.4,
        cameraZ * 0.55
      );

      // ----------------------------------------------------------
      // SPEED
      // ----------------------------------------------------------

      const speedCycle =
        (elapsedTime *
          0.055) %
        1;

      const acceleration =
        0.5 -
        0.5 *
        Math.cos(
          speedCycle *
          Math.PI *
          2
        );

      const speed =
        0.72 +
        acceleration *
        0.35;

      // ----------------------------------------------------------
      // ROAD NOISE
      // ----------------------------------------------------------

      const roadNoise =
        Math.sin(
          elapsedTime * 4.1
        ) *
        0.027 +
        Math.sin(
          elapsedTime * 7.7 +
          1.2
        ) *
        0.013 +
        Math.sin(
          elapsedTime * 12.7 +
          0.4
        ) *
        0.006;

      const roadWave =
        Math.sin(
          elapsedTime * 1.25
        ) *
        0.012;

      const roadMotion =
        roadNoise +
        roadWave;

      // ----------------------------------------------------------
      // STEERING
      // ----------------------------------------------------------

      const autoSteer =
        Math.sin(
          elapsedTime * 0.85
        ) *
        0.035;

      const targetSteering =
        mouseX * 0.30 +
        autoSteer;

      steeringGroup.rotation.y =
        THREE.MathUtils.lerp(
          steeringGroup.rotation.y,
          targetSteering,
          1 -
          Math.exp(
            -8 * delta
          )
        );

      const steering =
        steeringGroup.rotation.y;

      // ----------------------------------------------------------
      // WHEELS
      // ----------------------------------------------------------

      wheelRotation +=
        delta *
        15 *
        speed;

      frontWheelPivot.rotation.x =
        wheelRotation;

      rearWheelGroup.rotation.x =
        wheelRotation;

      // Front wheel steering
      frontWheelPivot.rotation.y =
        steering * 0.70;

      // ----------------------------------------------------------
      // SUSPENSION
      // ----------------------------------------------------------

      suspensionSpring.target =
        roadMotion * 1.5;

      const suspension =
        suspensionSpring.update(
          delta
        );

      scooterGroup.position.y =
        -0.58 +
        roadMotion +
        suspension * 0.05;

      scooterGroup.rotation.x =
        -roadMotion * 0.15;

      // ----------------------------------------------------------
      // LEAN
      // ----------------------------------------------------------

      leanSpring.target =
        -steering *
        (0.45 +
          speed * 0.42);

      const lean =
        leanSpring.update(
          delta
        );

      scooterGroup.rotation.z =
        lean * 0.48;

      // ----------------------------------------------------------
      // RIDER BODY
      // ----------------------------------------------------------

      bodySpring.target =
        roadMotion *
        0.65;

      const bodyBounce =
        bodySpring.update(
          delta
        );

      bodyGroup.position.y =
        0.18 +
        bodyBounce;

      // Rider counterbalance
      bodyGroup.rotation.z =
        lean * 0.16;

      bodyGroup.rotation.y =
        THREE.MathUtils.lerp(
          bodyGroup.rotation.y,
          mouseX * 0.15,
          1 -
          Math.exp(
            -5 * delta
          )
        );

      // Natural breathing
      const breathing =
        Math.sin(
          elapsedTime * 1.35
        ) *
        0.008;

      bodyGroup.scale.y =
        1 +
        breathing;

      // ----------------------------------------------------------
      // HEAD INERTIA
      // ----------------------------------------------------------

      headGroup.rotation.y =
        THREE.MathUtils.lerp(
          headGroup.rotation.y,
          mouseX * 0.32,
          1 -
          Math.exp(
            -4.5 * delta
          )
        );

      headGroup.rotation.x =
        THREE.MathUtils.lerp(
          headGroup.rotation.x,
          -mouseY * 0.08,
          1 -
          Math.exp(
            -4 * delta
          )
        );

      headGroup.rotation.z =
        Math.sin(
          elapsedTime * 1.7
        ) *
        0.018 -
        lean * 0.06;

      // ----------------------------------------------------------
      // BACKPACK
      // ----------------------------------------------------------

      backpackSpring.target =
        roadMotion;

      const backpackMotion =
        backpackSpring.update(
          delta
        );

      backpack.position.y =
        0.58 +
        backpackMotion *
        0.55;

      backpack.rotation.z =
        backpackMotion *
        0.12;

      // ----------------------------------------------------------
      // PARCEL
      // ----------------------------------------------------------

      parcelSpring.target =
        roadMotion;

      const parcelMotion =
        parcelSpring.update(
          delta
        );

      parcelGroup.position.y =
        0.30 +
        parcelMotion *
        0.45;

      parcelGroup.rotation.z =
        parcelMotion *
        0.18;

      // ----------------------------------------------------------
      // ENGINE VIBRATION
      // ----------------------------------------------------------

      exhaustGroup.rotation.z =
        Math.sin(
          elapsedTime *
          20 *
          speed
        ) *
        0.008;

      // ----------------------------------------------------------
      // BLINKING
      // ----------------------------------------------------------

      if (
        !isBlinking &&
        elapsedTime >
        nextBlinkTime
      ) {
        isBlinking =
          true;

        blinkProgress =
          0;
      }

      if (isBlinking) {
        blinkProgress +=
          delta /
          blinkDuration;

        const blinkAmount =
          Math.sin(
            blinkProgress *
            Math.PI
          );

        eyeGroups.forEach(
          (eye) => {
            eye.scale.y =
              1 -
              blinkAmount *
              0.92;
          }
        );

        if (
          blinkProgress >=
          1
        ) {
          isBlinking =
            false;

          eyeGroups.forEach(
            (eye) => {
              eye.scale.y =
                1;
            }
          );

          nextBlinkTime =
            elapsedTime +
            2.8 +
            Math.random() *
            4.2;
        }
      }

      // ----------------------------------------------------------
      // CONTACT SHADOW
      // ----------------------------------------------------------

      const shadowScale =
        1 -
        roadMotion *
        2.2;

      contactShadow.scale.set(
        shadowScale,
        1,
        shadowScale
      );

      shadowMaterial.opacity =
        THREE.MathUtils.clamp(
          0.56 -
          Math.abs(
            roadMotion
          ) *
          1.8,
          0.30,
          0.58
        );

      // ----------------------------------------------------------
      // PARTICLES
      // ----------------------------------------------------------

      particles.forEach(
        (particle) => {
          const mesh =
            particle.mesh;

          mesh.position.z +=
            particle.speed *
            delta;

          mesh.position.x +=
            Math.sin(
              elapsedTime *
              0.35 +
              particle.phase
            ) *
            0.0007;

          mesh.position.y +=
            Math.sin(
              elapsedTime *
              0.8 +
              particle.phase
            ) *
            0.0008;

          if (
            mesh.position.z >
            4
          ) {
            mesh.position.z =
              -4;

            mesh.position.x =
              (Math.random() -
                0.5) *
              6;

            mesh.position.y =
              Math.random() *
              4 -
              1;
          }
        }
      );

      // ----------------------------------------------------------
      // RENDER
      // ----------------------------------------------------------

      renderer.render(
        scene,
        camera
      );
    };

    // ============================================================
    // 38. RESIZE
    // ============================================================

    const handleResize = () => {
      if (!container) return;

      const width =
        container.clientWidth ||
        400;

      const height =
        container.clientHeight ||
        400;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio ||
          1,
          2
        )
      );

      renderer.setSize(
        width,
        height,
        false
      );
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    animate();

    // ============================================================
    // 39. CLEANUP
    // ============================================================

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );

      container.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );

      container.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );

      container.removeEventListener(
        "wheel",
        handleWheel
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      scene.traverse(
        (object) => {
          if (
            object.geometry
          ) {
            object.geometry.dispose();
          }

          if (
            object.material
          ) {
            if (
              Array.isArray(
                object.material
              )
            ) {
              object.material.forEach(
                (material) => {
                  material.dispose();
                }
              );
            } else {
              object.material.dispose();
            }
          }
        }
      );

      asphaltTexture.dispose();
      skyTexture.dispose();
      shadowTexture.dispose();
      environment.dispose();

      pmremGenerator.dispose();

      renderer.dispose();

      if (
        renderer.domElement &&
        renderer.domElement.parentNode ===
        container
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`
        relative
        w-full
        h-[340px]
        md:h-[440px]
        flex
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        ${className}
      `}
    />
  );
}