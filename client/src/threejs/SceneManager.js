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
  // WORLD_UNIT is divided by the size of the object
  let WORLD_UNIT = 1;
  let scene;
  let camera;
  let loader;
  let renderer;
  let lights = [];
  let terrain = [];
  let surface = [];
  let players = {};
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

  function glbLoadedCallback(glb) {
    if (typeof this === 'undefined') {
      console.error('')
      return;
    }
    let model = glb.scene;
    let animations = glb.animations;
    model.position.set(
      WORLD_UNIT * this.position.x,
      WORLD_UNIT * this.position.y,
      WORLD_UNIT * this.position.z
    );
    model.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    const scale = WORLD_UNIT / this.property['size'];
    model.scale.set(scale, scale, scale);
    
    scene.add(model);
    if (this.type === 'player') {
      players[this.id] = glb;
      if ('animate' in this.property) {
        console.log('Animation Found, to be implemented');
      }
    }
    else if (this.type === 'surface') {
      surface.push(glb);
      if ('animate' in this.property) {
        let mixer = new THREE.AnimationMixer(model);
        let rotateAnim = THREE.AnimationClip.findByName(animations, this.property['animate']);
        console.log(model, animations, mixer, rotateAnim);
        mixer.clipAction(rotateAnim).play();
        mixers.push(mixer);
      }
    }
    else if (this.type === 'terrain') {
      terrain.push(glb);
      if ('animate' in this.property) {
        console.log('Animation Found, to be implemented');
      }
    } else {
      console.log('Cannot track unknown object type:', this);
    }
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
        camera.position.y = 3;
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

        api.loadGLB('surface', GameAsset['Surface'][0],
          { 'x': 3 , 'y': 1, 'z': 5},
          { 'x': 0, 'y': 0, 'z': 0 },
          glbLoadedCallback
        );
        
        api.loadGLB('terrain', GameAsset['Terrain'][0],
          { 'x': 3, 'y': 0, 'z': 5 },
          { 'x': 0, 'y': 0, 'z': 0 },
          glbLoadedCallback
        );
        console.log(terrain, surface);
        animate();
        window.addEventListener('resize', onWindowResize, false);
      }
    },
    loadGLB: (type, property, position, rotation, callback) => {
      callback = callback.bind({
        'type': type,
        'property': property,
        'position': position,
        'rotation': rotation
      });

      loader.load(
        // propertyURL
        property['asset'],
        // called when property is loaded
        callback,
        // called when loading is in progress
        function (xhr) {
          // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
          console.error('GLB load error', error);
        }
      );
    },
    loadMap: (data) => {
      // need a function here to add a task that can span temporally to the animate function called by the requestAnimationFrame fucntion
      // rxjs queue? must be synchronous task!
      console.log(data);
      mixers.forEach(item => item.stopAllAction());
      mixers = [];
      terrain.forEach(item => scene.remove(item.scene));
      surface.forEach(item => scene.remove(item.scene));
      for (let x = 0; x < data['map']['size'][0]; x++) {
        for (let z = 0; z < data['map']['size'][1]; z++) {
          if (data['map']['Terrain'][x][z] >= 0) {
            api.loadGLB(
              'terrain',
              GameAsset['Terrain'][data['map']['Terrain'][x][z]], 
              {'x': x, 'y': 0, 'z': z },
              {'x': 0, 'y': 0, 'z': 0},
              glbLoadedCallback
            );
          }
          if (data['map']['Surface'][x][z] >= 0) {
            api.loadGLB(
              'surface',
              GameAsset['Surface'][data['map']['Surface'][x][z]],
              { 'x': x, 'y': 1, 'z': z },
              { 'x': 0, 'y': 0, 'z': 0 },
              glbLoadedCallback
            );
          }
        }
      }
      data['players'].forEach(player => {
        /* TODO:
          api.loadGLB needs some functionality to differ base on type of object (player/surface/terrain) being loaded.
          research Java design patterns e.g. (Singleton, Decorator, Factory) for a possible design solution to hanle this.
         */
        players['id'] = {'id': player['id']};
        api.loadGLB(
          'player',
          GameAsset['Players'][0],
          { 'x': player.position.x, 'y': 1, 'z': player.position.z },
          { 'x': 0, 'y': 0, 'z': 0 },
          glbLoadedCallback
        )
      });
      console.log(players);
    },
    movePlayer: (data) => {
      console.log(data, players);
    }
  }
  return Object.seal(api);
}

export default initThree;