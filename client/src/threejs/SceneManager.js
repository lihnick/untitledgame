import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const GameAsset = require('./GameAsset');

/* ThreeJS Coordinate System
+X points to the right of the screen
-X points to the left of the screen
+Y points to the top of the screen
-Y points to the bottom of the screen
+Z points out of the screen (towards you)
-Z points into the screen (away from you)
*/

function initThree(canvas) {
  let scene;
  let camera;
  let loader;
  let renderer;
  let lights = [];
  let objects = []; 
  let mixers = [];
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    
    let delta = clock.getDelta();
    mixers.forEach(item => {
      item.update(delta);
    });

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function panControl() {
    window.addEventListener('keydown', function (key) {
      if (key.keyCode === 87) { // w
        camera.position.x += 1;
      }
      if (key.keyCode === 65) { // a
        camera.position.z -= 1;
      }
      if (key.keyCode === 83) { // s
        camera.position.x -= 1;
      }
      if (key.keyCode === 68) { // d
        camera.position.z += 1;
      }
    });
  }

  let api = {
    init: () => {
      if (scene === undefined) {  
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          canvas: canvas
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0.0); // transparent background
        renderer.gammaOutput = true;

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        camera.position.y = 5;
        camera.position.x = 0;
        camera.rotateY(- Math.PI / 2 );
        camera.rotateX(- Math.PI / 6 );
        scene.add(camera);

        lights[0] = new THREE.AmbientLight(0x999999);
        scene.add(lights[0]);
        lights[1] = new THREE.DirectionalLight(0xffffff, 0.6);
        lights[1].position.set(1, 0, 0);
        lights[2] = new THREE.DirectionalLight(0x11E8BB, 0.6);
        lights[2].position.set(0.75, 1, 0.5);
        lights[3] = new THREE.DirectionalLight(0x8200C9, 0.6);
        lights[3].position.set(-0.75, -1, 0.5);
        scene.add(lights[1]);
        scene.add(lights[2]);
        scene.add(lights[3]);

        loader = new GLTFLoader();
        panControl();

        api.loadGLB('./asset/Pillar.glb',
          { 'x': 3 , 'y': 1, 'z': 5},
          { 'x': 0, 'y': 0, 'z': 0 },
          { 'x': 1, 'y': 1, 'z': 1 }
        );
        
        api.loadGLB('./asset/Grassy.glb',
          { 'x': 3, 'y': 0, 'z': 5 },
          { 'x': 0, 'y': 0, 'z': 0 },
          { 'x': 1, 'y': 1, 'z': 1 }
        );
        console.log(objects);
        animate();
        window.addEventListener('resize', onWindowResize, false);
      }
    },
    loadGLB: (glbFile, position, rotation, scale) => {
      let model;
      let animations;
      loader.load(
        // resourceURL
        glbFile,
        // called when resource is loaded
        function (glb) {
          model = glb.scene;
          animations = glb.animations;
          model.position.set(position.x, position.y, position.z);
          model.rotation.set(rotation.x, rotation.y, rotation.z);
          model.scale.set(scale.x, scale.y, scale.z);
          scene.add(model);
          objects.push(glb);
          if (animations.length > 0) {
            let mixer = new THREE.AnimationMixer(model);
            let rotateAnim = THREE.AnimationClip.findByName(animations, 'PillarAction');
            mixer.clipAction(rotateAnim).play();
            mixers.push(mixer);
            console.log(model, animations, mixer, rotateAnim);
          }
        },
        // called when loading is in progress
        function (xhr) {
          // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
          console.error('GLB load error');
          console.log(error);
        }
      );
      return model;
    },
    loadMap: (map) => {
      // need a function here to add a task that can span temporally to the animate function called by the requestAnimationFrame fucntion
      // rxjs queue? must be synchronous task!
      console.log(map);
      mixers.forEach(item => item.stopAllAction());
      mixers = [];
      objects.forEach(item => scene.remove(item.scene));
      for (let x = 0; x < map['size'][0]; x++) {
        for (let z = 0; z < map['size'][1]; z++) {
          if (map['Terrain'][x][z] >= 0) {
            api.loadGLB(
              GameAsset['Terrain'][map['Terrain'][x][z]]['asset'], 
              {'x': 2*x, 'y': 0, 'z': 2*z },
              {'x': 0, 'y': 0, 'z': 0},
              {'x': 1, 'y': 1, 'z': 1}
            );
          }
          if (map['Surface'][x][z] >= 0) {
            api.loadGLB(
              GameAsset['Surface'][map['Surface'][x][z]]['asset'],
              { 'x': 2 * x, 'y': 1, 'z': 2 * z },
              { 'x': 0, 'y': 0, 'z': 0 },
              { 'x': 1, 'y': 1, 'z': 1 }
            );
          }
        }
      }
    }
  }
  return Object.seal(api);
}

export default initThree;