import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import GameAsset from './GameAsset';

/*
  Keep a dictionary of functions for each object to process animation and shape key
*/

export default (function ObjectLoader(scene, sceneryController, playerController, animateController) {
  
  // WORLD_UNIT is divided by the size of the object
  let WORLD_UNIT = 1;
  let loader = new GLTFLoader();

  function glbLoadedCallback(glb) {
    if (typeof this === 'undefined') {
      console.error('Context not set: ', this);
      return;
    }

    let model = glb.scene;
    let animations = glb.animations;

    const scale = WORLD_UNIT / this.property['size'];
    model.position.copy(this.position);
    model.rotation.copy(this.rotation);
    model.scale.copy(this.scale).multiplyScalar(scale);
    if ('name' in this.property) {
      glb.userData['name'] = this.property['name'];
    }
    scene.add(model);

    if (this.type === 'terrain') {
      sceneryController.addObject({
        'name': this.property['name'],
        'type': this.type,
        'glb': glb
      });
      if ('animate' in this.property) {
        console.log('Animation Found, to be implemented');
      }
      if ('shapekey' in this.property) {
        animateController.addMorphingTarget(glb, this.property['shapekey']);
      }
    }
    else if (this.type === 'surface') {
      sceneryController.addObject({
        'name': this.property['name'],
        'type': this.type,
        'glb': glb
      });
      if ('animate' in this.property && animations.length > 0) {
        animateController.addAnimationMixer(glb, this.property['animate']);
      }
    }
    else if (this.type === 'players') {
      playerController.addPlayer({
        'id': this.id,
        'glb': glb
      })
      if ('animate' in this.property) {
        console.log('Animation Found, to be implemented');
      }
    }
    else {
      console.log('Cannot track unknown object type: ', this);
    }
  }

  function setGLBContext(context, callback) {
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
        console.error('GLB Loader error: ', error);
      }
    );
  }

  function contextMapper(data) {
    let context = {};
    if (!data['isVisual'] && data['position'].length === 2) {
      if (data['type'] === 'terrain') data['position'].splice(1, 0, [0]);
      if (data['type'] === 'surface' || data['type'] === 'player') {
        data['position'].splice(1, 0, [1]);
      }
    }
    let property;
    if ('assetIndex' in data) {
      try {
        property = GameAsset[data['type']][data['assetIndex']];
      } catch {
        console.log(data);
      }
    }
    else if ('name' in data) {
      let tmp = GameAsset[data['type']].filter(obj => obj['name'] === data['name']);
      if (tmp.length > 0) {
        property = tmp[0];
      } 
    } else if ('property' in data) {
      property = data['property'];
    }
    return Object.assign(context, data, {
      'property': property,
      'position': new THREE.Vector3(...data['position']),
      'rotation': new THREE.Euler(0, 0, 0, 'XYZ'),
      'scale': new THREE.Vector3(1, 1, 1)
    });
  }

  let api = {
    loadObject: (data) => {
      if (data.type === 'surface') {
        setGLBContext(
          contextMapper(data),
          glbLoadedCallback
        );
      }
      else if (data.type === 'terrain') {
        setGLBContext(
          contextMapper(data),
          glbLoadedCallback
        );
      }
      else if (data.type === 'players') {
        setGLBContext(
          contextMapper(data),
          glbLoadedCallback
        );
      }
    },
    loadBatchObject: (batch) => {
      console.log(batch);
      for (let x = 0; x < batch['map']['size'][0]; x++) {
        for (let z = 0; z < batch['map']['size'][1]; z++) {

          if (batch['map']['terrain'][x][z] >= 0) {
            console.log(GameAsset['terrain'][batch['map']['terrain'][x][z]]['name']);
            setGLBContext(
              contextMapper({
                'type': 'terrain',
                'name': GameAsset['terrain'][batch['map']['terrain'][x][z]]['name'],
                'assetIndex': batch['map']['terrain'][x][z],
                'position': [x, 0, z],
                'isVisual': false
              }),
              glbLoadedCallback
            );
          }

          if (batch['map']['surface'][x][z] >= 0) {
            setGLBContext(
              contextMapper({
                'type': 'surface',
                'name': GameAsset['surface'][batch['map']['surface'][x][z]]['name'],
                'assetIndex': batch['map']['surface'][x][z],
                'position': [x, 1, z],
                'isVisual': false
              }),
              glbLoadedCallback
            );
          }

        }
      }

      // load player objects into game
      batch['players'].forEach(player => {
        setGLBContext(
          contextMapper({
            'id': player['id'],
            'type': 'players',
            'username': 'placeholder',
            'assetIndex': 0,
            'position': [player.position.x, 1, player.position.z]
          }),
          glbLoadedCallback
        );
      });

    }
  };
  return api;

});