/**
 * Pure 3D Character Renderer (Three.js)
 * Procedural 3D Pakistani Schoolgirl avatar with dynamic facial expressions & skeletal posing
 */

class Character3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();
    
    // Camera Setup
    const width = this.container.clientWidth || 360;
    const height = this.container.clientHeight || 280;
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.2, 4.5);
    this.camera.lookAt(0, 0.8, 0);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
    mainLight.position.set(2, 4, 3);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    this.scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.6);
    rimLight.position.set(-3, 2, -2);
    this.scene.add(rimLight);

    // Character Mesh Group
    this.characterGroup = new THREE.Group();
    this.scene.add(this.characterGroup);

    // Current State
    this.currentExpression = 'happy';
    this.time = 0;

    // Build Procedural 3D Girl Avatar
    this.buildCharacterMesh();

    // Mouse Interaction for 3D Orbit
    this.mouseX = 0;
    this.targetRotationY = 0;
    this.initInteraction();

    // Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  buildCharacterMesh() {
    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: 0xF3C8A9 });
    const blueKameezMat = new THREE.MeshToonMaterial({ color: 0x2563EB });
    const whiteDupattaMat = new THREE.MeshToonMaterial({ color: 0xF8FAFC });
    const greenBagMat = new THREE.MeshToonMaterial({ color: 0x059669 });
    const darkShoesMat = new THREE.MeshToonMaterial({ color: 0x1E293B });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0F172A });
    const eyebrowMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991B1B });

    // 1. HEAD & FACE
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.35, 0);
    this.headGroup = headGroup;

    // Head Sphere
    const headGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Dupatta / Hijab Hood (Surrounding Head)
    const hijabGeo = new THREE.SphereGeometry(0.31, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.75);
    const hijabMesh = new THREE.Mesh(hijabGeo, whiteDupattaMat);
    hijabMesh.position.set(0, 0.02, -0.02);
    hijabMesh.castShadow = true;
    headGroup.add(hijabMesh);

    // EYES (3D Spheres with Pupils)
    const eyeGeo = new THREE.SphereGeometry(0.04, 16, 16);
    this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEye.position.set(-0.09, 0.04, 0.25);
    this.leftEye.scale.set(1, 1.2, 0.5);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightEye.position.set(0.09, 0.04, 0.25);
    this.rightEye.scale.set(1, 1.2, 0.5);

    headGroup.add(this.leftEye);
    headGroup.add(this.rightEye);

    // EYEBROWS (3D Arcs)
    const eyebrowGeo = new THREE.BoxGeometry(0.07, 0.015, 0.01);
    this.leftEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
    this.leftEyebrow.position.set(-0.09, 0.12, 0.26);

    this.rightEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
    this.rightEyebrow.position.set(0.09, 0.12, 0.26);

    headGroup.add(this.leftEyebrow);
    headGroup.add(this.rightEyebrow);

    // MOUTH (Dynamic Curve for Expressions)
    const mouthGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 16, Math.PI);
    this.mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    this.mouthMesh.position.set(0, -0.08, 0.25);
    this.mouthMesh.rotation.x = Math.PI;
    headGroup.add(this.mouthMesh);

    this.characterGroup.add(headGroup);

    // 2. TORSO (Blue Kameez / Tunic)
    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.65, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, blueKameezMat);
    torsoMesh.position.set(0, 0.85, 0);
    torsoMesh.castShadow = true;
    this.characterGroup.add(torsoMesh);

    // White Dupatta Draped over Shoulders
    const dupattaDrapeGeo = new THREE.CylinderGeometry(0.24, 0.29, 0.35, 32, 1, true, -Math.PI * 0.4, Math.PI * 0.8);
    const dupattaDrapeMesh = new THREE.Mesh(dupattaDrapeGeo, whiteDupattaMat);
    dupattaDrapeMesh.position.set(0, 0.98, 0.01);
    dupattaDrapeMesh.castShadow = true;
    this.characterGroup.add(dupattaDrapeMesh);

    // 3. ARMS & HANDS
    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.26, 1.1, 0);

    const armGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.45, 16);
    const leftArmMesh = new THREE.Mesh(armGeo, blueKameezMat);
    leftArmMesh.position.set(0, -0.2, 0);
    leftArmMesh.castShadow = true;
    this.leftArmGroup.add(leftArmMesh);

    const handGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
    leftHandMesh.position.set(0, -0.42, 0);
    this.leftArmGroup.add(leftHandMesh);

    this.characterGroup.add(this.leftArmGroup);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.26, 1.1, 0);

    const rightArmMesh = new THREE.Mesh(armGeo, blueKameezMat);
    rightArmMesh.position.set(0, -0.2, 0);
    rightArmMesh.castShadow = true;
    this.rightArmGroup.add(rightArmMesh);

    const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
    rightHandMesh.position.set(0, -0.42, 0);
    this.rightArmGroup.add(rightHandMesh);

    this.characterGroup.add(this.rightArmGroup);

    // 4. GREEN SATCHEL SCHOOL BAG
    const bagGeo = new THREE.BoxGeometry(0.2, 0.22, 0.08);
    const bagMesh = new THREE.Mesh(bagGeo, greenBagMat);
    bagMesh.position.set(-0.18, 0.72, 0.12);
    bagMesh.rotation.z = 0.15;
    bagMesh.castShadow = true;
    this.characterGroup.add(bagMesh);

    // Bag Strap
    const strapGeo = new THREE.TorusGeometry(0.26, 0.012, 8, 32, Math.PI * 1.2);
    const strapMesh = new THREE.Mesh(strapGeo, greenBagMat);
    strapMesh.position.set(0.02, 0.95, 0.05);
    strapMesh.rotation.y = Math.PI * 0.4;
    strapMesh.rotation.z = -Math.PI * 0.3;
    this.characterGroup.add(strapMesh);

    // 5. LEGS & SHOES (White Shalwar & Dark Shoes)
    const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.5, 16);
    const leftLeg = new THREE.Mesh(legGeo, whiteDupattaMat);
    leftLeg.position.set(-0.1, 0.28, 0);
    leftLeg.castShadow = true;
    this.characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, whiteDupattaMat);
    rightLeg.position.set(0.1, 0.28, 0);
    rightLeg.castShadow = true;
    this.characterGroup.add(rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.09, 0.06, 0.16);
    const leftShoe = new THREE.Mesh(shoeGeo, darkShoesMat);
    leftShoe.position.set(-0.1, 0.03, 0.03);
    leftShoe.castShadow = true;
    this.characterGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, darkShoesMat);
    rightShoe.position.set(0.1, 0.03, 0.03);
    rightShoe.castShadow = true;
    this.characterGroup.add(rightShoe);

    // 6. REALISTIC SOFT GROUND SHADOW (3D Plane with Shadow Material)
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
  }

  setExpression(expression) {
    this.currentExpression = expression;
    if (!this.mouthMesh || !this.leftEyebrow || !this.rightEyebrow) return;

    switch (expression) {
      case 'happy':
        // Big smile, arched eyebrows, arms relaxed & happy
        this.mouthMesh.rotation.x = Math.PI; // Upward smile arc
        this.mouthMesh.scale.set(1.1, 1.2, 1);
        this.leftEyebrow.rotation.z = 0.1;
        this.rightEyebrow.rotation.z = -0.1;
        this.leftEyebrow.position.y = 0.13;
        this.rightEyebrow.position.y = 0.13;

        this.leftArmGroup.rotation.z = 0.2;
        this.rightArmGroup.rotation.z = -0.2;
        break;

      case 'worried':
        // Wavy/straight mouth, inner-tilted anxious eyebrows, arms folded in
        this.mouthMesh.rotation.x = 0; // Flat/straight mouth
        this.mouthMesh.scale.set(0.8, 0.6, 1);
        this.leftEyebrow.rotation.z = -0.25; // Tilted inwards
        this.rightEyebrow.rotation.z = 0.25;
        this.leftEyebrow.position.y = 0.11;
        this.rightEyebrow.position.y = 0.11;

        this.leftArmGroup.rotation.z = 0.5; // Arms drawn inward
        this.rightArmGroup.rotation.z = -0.5;
        break;

      case 'sad':
        // Frown mouth (inverted arc), drooped outer eyebrows, head lowered
        this.mouthMesh.rotation.x = 0; // Frown down curve
        this.mouthMesh.scale.set(1, 1, 1);
        this.leftEyebrow.rotation.z = 0.25; // Drooped outwards
        this.rightEyebrow.rotation.z = -0.25;
        this.leftEyebrow.position.y = 0.1;
        this.rightEyebrow.position.y = 0.1;

        this.leftArmGroup.rotation.z = 0.05; // Arms hanging lifelessly
        this.rightArmGroup.rotation.z = -0.05;
        break;

      case 'relieved':
        // Soft happy smile, head tilted back slightly, arms open
        this.mouthMesh.rotation.x = Math.PI;
        this.mouthMesh.scale.set(1, 0.9, 1);
        this.leftEyebrow.rotation.z = 0;
        this.rightEyebrow.rotation.z = 0;
        this.leftEyebrow.position.y = 0.14;
        this.rightEyebrow.position.y = 0.14;

        this.leftArmGroup.rotation.z = 0.35; // Arms open wide
        this.rightArmGroup.rotation.z = -0.35;
        break;
    }
  }

  initInteraction() {
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      this.targetRotationY = x * 0.8;
    });

    this.container.addEventListener('mouseleave', () => {
      this.targetRotationY = 0;
    });

    window.addEventListener('resize', () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.time += 0.03;

    // Smooth Orbit Y Rotation based on mouse
    if (this.characterGroup) {
      this.characterGroup.rotation.y += (this.targetRotationY - this.characterGroup.rotation.y) * 0.1;

      // 3D Idle Breathing & Expression Motion Dynamics
      if (this.currentExpression === 'happy') {
        this.characterGroup.position.y = Math.sin(this.time * 2) * 0.04;
        if (this.headGroup) this.headGroup.rotation.z = Math.sin(this.time * 1.5) * 0.03;
      } else if (this.currentExpression === 'worried') {
        this.characterGroup.position.y = Math.sin(this.time * 4) * 0.015;
        if (this.headGroup) this.headGroup.rotation.z = Math.sin(this.time * 6) * 0.02; // Tremble
      } else if (this.currentExpression === 'sad') {
        this.characterGroup.position.y = -0.02 + Math.sin(this.time * 1) * 0.01;
        if (this.headGroup) this.headGroup.rotation.x = 0.12 + Math.sin(this.time * 1.2) * 0.02; // Head down
      } else if (this.currentExpression === 'relieved') {
        this.characterGroup.position.y = Math.sin(this.time * 1.5) * 0.03;
        if (this.headGroup) this.headGroup.rotation.x = -0.08 + Math.sin(this.time * 1.5) * 0.03; // Head back
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global Export
window.Character3D = Character3D;
