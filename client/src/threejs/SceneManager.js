import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import CameraControl from './CameraControl';
import PlayerControl from './PlayerControl';
import GameAsset from './GameAsset';
import SceneryControl from './SceneryControl';

console.log(THREE);

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
  let cameraController;
  let loader;
  let renderer;
  let lights = [];
  let terrain = [];
  let surface = [];
  let sceneryController;
  let players = {};
  let playerController;
  let mixers = [];
  let clock = new THREE.Clock();
  let cameraConstant = {
    'cameraOffset': new THREE.Vector3(0, 3, 5),
    'cameraRotate': {
      'x': 0,
      'y': 0,
      'z': 0
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    
    let delta = clock.getDelta();
    cameraController.update();
    mixers.forEach(item => {
      item.update(delta);
    });

    renderer.render(scene, cameraController.getCamera());
  }

  function optimalCameraDirection() {
    // Get the position of the end goal pillar
    let pillarGoal = surface.filter(model => model['type'] === 'Pillar').map(model => (model['glb']['scene'].position));
    if (pillarGoal.length > 0) {
      pillarGoal = pillarGoal[0].clone();
    } else {
      console.error('Cannot find pillar');
      return;
    }
    
    // initialize a vector to store the accumulated value and not affect the position of current game spawn
    let initialVec = new THREE.Vector3();
    let spawns = terrain
      .filter(model => model['type'] === 'Spawn')
      .map(model => (model['glb']['scene'].position));
    
    let count = spawns.length;
    let accumVector = spawns
      .reduce((summedVector, currentVec) => (summedVector.add(currentVec)), initialVec);
    // get the average location of all the spawn position
    let averageSpawn = accumVector.clone().multiplyScalar(1/count);
    
    let direction = new THREE.Vector3();
    direction.subVectors(averageSpawn, pillarGoal)
    direction.y = 0;
    direction.normalize();
    if (Math.abs(direction.z) >= Math.abs(direction.x)) {
      console.log('z-axis: ', direction);
      return [0, 0, direction.round().z];
    }
    else {
      console.log('x-axis: ', direction);
      return [direction.round().x, 0, 0];
    }
  }

  function glbLoadedCallback(glb) {
    if (typeof this === 'undefined') {
      console.error('Context not set:', this);
      return;
    }
    let model = glb.scene;
    let animations = glb.animations;

    const scale = WORLD_UNIT / this.property['size'];
    model.position.copy(this.position);
    model.rotation.copy(this.rotation);
    model.scale.copy(this.scale).multiplyScalar(scale);
    
    scene.add(model);
    if (this.type === 'player') {
      console.log('Adding Player:', glb);

      // players[this.id] = {'type': this.property['name'], 'glb': glb};
      playerController.addPlayer({
        'id': this.id,
        'glb': glb
      });

      if ('animate' in this.property) {
        console.log('Animation Found, to be implemented');
      }
    }
    else if (this.type === 'surface') {
      sceneryController.addObject({
        'name': this.property['name'],
        'type': this.type,
        'glb': glb
      }, this.isVisual);
      if ('animate' in this.property) {
        let mixer = new THREE.AnimationMixer(model);
        let rotateAnim = THREE.AnimationClip.findByName(animations, this.property['animate']);
        console.log(model, animations, mixer, rotateAnim);
        mixer.clipAction(rotateAnim).play();
        mixers.push(mixer);
      }
    }
    else if (this.type === 'terrain') {
      sceneryController.addObject({
        'name': this.property['name'],
        'type': this.type,
        'glb': glb
      }, this.isVisual);
      if ('animate' in this.property) {
        console.log('Animation Found, to be implemented');
      }
    } else {
      console.log('Cannot track unknown object type:', this);
    }
  }

  let api = {
    init: () => {
      console.log(CameraControl);
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

        let axis = new THREE.AxesHelper(24);
        scene.add(axis);

        let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        console.log(renderer.domElement instanceof HTMLCanvasElement);
        cameraController = CameraControl(camera, renderer, cameraConstant);

        scene.add(camera);
        console.log(camera);
        
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

        sceneryController = SceneryControl(scene);

        api.loadGLB(
          sceneryController.getCallbackContext({
            'type': 'surface',
            'assetIndex': 1,
            'position': [3, 1, 5]
          }, true),
          glbLoadedCallback
        );
        
        api.loadGLB(
          sceneryController.getCallbackContext({
            'type': 'terrain',
            'assetIndex': 1,
            'position': [3, 0, 5]
          }, true),
          glbLoadedCallback
        );
        console.log(terrain, surface);
        animate();
      }
    },
    loadGLB: (context, callback) => {
      callback = callback.bind(context);
      loader.load(
        // propertyURL
        context['property']['asset'],
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
      sceneryController.clearMap(data['map']['size']);

      mixers.forEach(item => item.stopAllAction());
      mixers = [];
      players = {};

      for (let x = 0; x < data['map']['size'][0]; x++) {
        for (let z = 0; z < data['map']['size'][1]; z++) {
          if (data['map']['terrain'][x][z] >= 0) {
            
            let callbackContext = sceneryController.getCallbackContext({
              'type': 'terrain',
              'assetIndex': data['map']['terrain'][x][z],
              'position': [x, 0, z]
            }, false);

            api.loadGLB(callbackContext, glbLoadedCallback);
          }
          if (data['map']['surface'][x][z] >= 0) {
            let callbackContext = sceneryController.getCallbackContext({
              'type': 'surface',
              'assetIndex': data['map']['surface'][x][z],
              'position': [x, 1, z]
            }, false);

            api.loadGLB(callbackContext, glbLoadedCallback);
          }
        }
      }

      playerController = PlayerControl(data['id'], scene);

      data['players'].forEach(player => {
        let callbackContext = playerController.getCallbackContext(player);

        api.loadGLB(callbackContext, glbLoadedCallback);
      });

      setTimeout(() => {
        optimalCameraDirection();
        
      }, 4000);
    },
    toggleInput: (event) => {
      console.log('Disable control:', event);
      console.log(players);
      cameraController.disableControl();
      cameraController.setRotation();
      // let { x, y, z } = playerController.getPlayer(event['id']).scene.position;
      cameraController.setPosition(playerController.getPlayer(event['id']).scene.position);
    },
    movePlayer: (data) => {
      console.log(data, players);
      if (isNaN(data['vector'].y)) {
        data['vector'].y = 1;
      }
      playerController.setPosition(data['id'], data['vector']);
      cameraController.setPosition(data['vector'])
    },
    directionVector: () => {
      let camera = cameraController.getCamera();
      if (camera) {
        // The default camera is looking down its negative z-axis, create a point looking in the same direction
        let forward = new THREE.Vector3(0, 0, -1);
        if (typeof camera.getWorldDirection === 'function') {
          camera.getWorldDirection(forward);
        } else {
          forward.applyQuaternion(camera.quaternion);
        }
        // Apply the same camera rotation to this point
        console.log('forward: ', forward.x, forward.y, forward.z);
        forward.y = 0; // Up Vector is not needed in this estimate
        forward.normalize().round();
        let up = camera.up;
        // Calculate the right vector by taking the cross product of forward vector with the global up vector
        let right = forward.clone();
        right.cross(up);

        let forwardAxis = Object.keys(forward).filter(axis => forward[axis] !== 0)[0];
        let upAxis = Object.keys(up).filter(axis => up[axis] !== 0)[0];
        let rightAxis = Object.keys(right).filter(axis => right[axis] !== 0)[0];

        let result = {
          'forward': { 'direction': forward[forwardAxis], 'axis': forwardAxis },
          'up': { 'direction': up[upAxis], 'axis': upAxis },
          'right': { 'direction': right[rightAxis], 'axis': rightAxis }
        }
        console.log('Direction:', forward, up, right, result);
        return result;
      } else {
        console.log('Camera does not exists:', camera);
      }
    }

  }
  return Object.seal(api);
}

export default initThree;