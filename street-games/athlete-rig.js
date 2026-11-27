/* Original 3D athlete. A hierarchy of actual THREE.Bone joints drives rigid
   meshes (not mocap and not a skinned character mesh). Separate from game physics. */
(function () {
  'use strict';
  window.createAthleteRig = function () {
    if (!window.THREE) return null;
    const T=window.THREE;
    try {
      const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
      renderer.setSize(240,320,false);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
      const scene=new T.Scene();
      const camera=new T.OrthographicCamera(-1.25,1.25,1.665,-1.665,.1,30);camera.position.set(0,1,7);camera.lookAt(0,1,0);
      scene.add(new T.HemisphereLight(0xffffff,0x435574,2));const light=new T.DirectionalLight(0xffebce,2.3);light.position.set(2,4,6);scene.add(light);
      const mat=(color)=>new T.MeshStandardMaterial({color,roughness:.8});
      const skin=mat(0x9d603e), shadowSkin=mat(0x81492f), shirt=mat(0xe99124), trim=mat(0xffe3a4), shorts=mat(0x263f6b), socks=mat(0xf6eee0), shoes=mat(0x223653), hair=mat(0x171d30), band=mat(0x28baa8), eyes=mat(0x161a25), white=mat(0xfaf6ed);
      const mesh=(geo,m,parent,x,y,z)=>{const a=new T.Mesh(geo,m);a.position.set(x,y,z);parent.add(a);return a};
      const box=(parent,m,x,y,z,w,h,d)=>mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z);
      const ellipsoid=(parent,m,x,y,z,w,h,d)=>{const a=mesh(new T.SphereGeometry(1,14,10),m,parent,x,y,z);a.scale.set(w,h,d);return a};
      const bone=(parent,x,y,z)=>{const b=new T.Bone();b.position.set(x,y,z);parent.add(b);return b};
      const root=bone(scene,0,0,0), pelvis=bone(root,0,.88,0), spine=bone(pelvis,0,.12,0);
      ellipsoid(pelvis,shorts,0,.02,0,.22,.17,.13);
      box(spine,shirt,0,.25,0,.34,.50,.22);box(spine,trim,.004,.18,.115,.30,.04,.012);
      ellipsoid(spine,skin,0,.55,0,.075,.085,.075);
      const head=bone(spine,0,.70,0);ellipsoid(head,skin,0,.07,0,.19,.235,.17);
      // Anime-influenced hair silhouette and headband, original design.
      ellipsoid(head,hair,-.025,.22,0,.19,.12,.17);
      for(let i=0;i<4;i++){const spike=mesh(new T.ConeGeometry(.075,.23,6),hair,head,-.14+i*.08,.33,0);spike.rotation.z=.35-i*.2;}
      box(head,band,0,.18,.16,.30,.045,.02);ellipsoid(head,white,.12,.07,.14,.055,.055,.025);ellipsoid(head,eyes,.15,.07,.16,.022,.026,.014);
      ellipsoid(head,skin,.19,.015,0,.055,.045,.06);
      const limbs=[];
      function leg(z,far){const hip=bone(pelvis,0,-.05,z);ellipsoid(hip,shorts,0,-.10,0,.105,.16,.10);box(hip,far?shadowSkin:skin,0,-.20,0,.14,.37,.14);const knee=bone(hip,0,-.38,0);ellipsoid(knee,far?shadowSkin:skin,0,0,0,.08,.08,.08);box(knee,far?shadowSkin:skin,0,-.19,0,.12,.37,.12);const ankle=bone(knee,0,-.38,0);box(ankle,socks,0,.04,0,.13,.10,.13);ellipsoid(ankle,shoes,.075,-.015,0,.16,.065,.09);return {hip,knee,ankle};}
      function arm(z,far){const shoulder=bone(spine,0,.46,z);ellipsoid(shoulder,shirt,0,-.03,0,.105,.10,.10);box(shoulder,far?shadowSkin:skin,0,-.14,0,.11,.25,.11);const elbow=bone(shoulder,0,-.27,0);box(elbow,far?shadowSkin:skin,0,-.13,0,.10,.25,.10);ellipsoid(elbow,skin,0,-.27,0,.075,.075,.07);return {shoulder,elbow};}
      const farLeg=leg(-.105,true),nearLeg=leg(.105,false),farArm=arm(-.16,true),nearArm=arm(.16,false);
      // Bone hierarchy is the skeleton; meshes are parented to individual bones.
      const skeleton=new T.Skeleton([root,pelvis,spine,head,farLeg.hip,farLeg.knee,farLeg.ankle,nearLeg.hip,nearLeg.knee,nearLeg.ankle,farArm.shoulder,farArm.elbow,nearArm.shoulder,nearArm.elbow]);
      const worldA=new T.Vector3(),worldB=new T.Vector3();
      function animate(game){
        const running=game.mode==='run'&&game.speed>4, airborne=game.mode==='air';
        const stride=running?Math.sin(game.time*(10+game.speed/32)):0;
        spine.rotation.z=airborne?-.16:running?-.10:0;
        if(airborne){
          nearLeg.hip.rotation.z=.95;nearLeg.knee.rotation.z=-1.05;farLeg.hip.rotation.z=-.55;farLeg.knee.rotation.z=-.65;
          nearArm.shoulder.rotation.z=-1.0;nearArm.elbow.rotation.z=.5;farArm.shoulder.rotation.z=.9;farArm.elbow.rotation.z=-.8;
        }else if(running){
          nearLeg.hip.rotation.z=stride*.80;farLeg.hip.rotation.z=-stride*.80;
          nearLeg.knee.rotation.z=-Math.max(0,-stride)*1.20;farLeg.knee.rotation.z=-Math.max(0,stride)*1.20;
          nearArm.shoulder.rotation.z=-stride*.72;farArm.shoulder.rotation.z=stride*.72;
          nearArm.elbow.rotation.z=.75;farArm.elbow.rotation.z=.75;
        }else{
          nearLeg.hip.rotation.z=farLeg.hip.rotation.z=0;nearLeg.knee.rotation.z=farLeg.knee.rotation.z=0;
          nearArm.shoulder.rotation.z=-.08;farArm.shoulder.rotation.z=.08;nearArm.elbow.rotation.z=.12;farArm.elbow.rotation.z=.12;
        }
        // Set the lowest foot on the track for ground animations. This is a
        // lightweight grounding correction, not inverse kinematics or mocap.
        root.position.y=0;scene.updateMatrixWorld(true);
        nearLeg.ankle.getWorldPosition(worldA);farLeg.ankle.getWorldPosition(worldB);
        if(!airborne)root.position.y=.065-Math.min(worldA.y,worldB.y);
        scene.updateMatrixWorld(true);skeleton.update();renderer.render(scene,camera);
      }
      return {canvas:renderer.domElement,animate,skeleton};
    }catch(e){console.warn('3D athlete unavailable; using 2D animated fallback.',e);return null;}
  };
})();
