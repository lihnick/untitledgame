import * as THREE from 'three';

import GameAsset from './GameAsset';

export default (function SceneryControl(scene, animateController) {

  // List of scene objects that players can stand on
  let terrain = [];
  // List of scene objects that are interactive or obstructive
  let surface = [];

  function deleteAnimation(glb) {
    if (glb.animations.length > 0) {
      animateController.deleteAnimation(glb);
    }
  }

  let api = {
    getTerrain: () => {
      return terrain;
    },
    getSurface: () => {
      return surface;
    },
    getCallbackContext: (objectData) => {
      if (objectData['position'].length === 2) {
        if (objectData['type'] === 'terrain') objectData['position'].splice(1, 0, [0]);
        if (objectData['type'] === 'surface') objectData['position'].splice(1, 0, [1]);
      }
      let property;
      if ('name' in objectData) {
        property = GameAsset
      }
      return Object.assign({}, objectData, {
        'position': new THREE.Vector3(...objectData['position']),
        'rotation': new THREE.Euler(0, 0, 0, 'XYZ'),
        'scale': new THREE.Vector3(1, 1, 1)
      });
    },
    addObject: (object) => {
      if (object['type'] === 'terrain') {
        terrain.push(object);
      }
      else if (object['type'] === 'surface') {
        surface.push(object);
      }
    },
    getObject: (position, type) => {
      let {x, z} = position;
      if (type === 'terrain') {
        return terrain.filter(item => (item.scene.position.x === x && item.scene.position.z === z));
      }
      else if (type === 'surface') {
        return surface.filter(item => (item.scene.position.x === x && item.scene.position.z === z));
      }
    },
    removeObject: (position, type) => {
      let { x, z } = position;
      let tmp = [];
      if (type === 'terrain') {
        terrain.forEach(item => {
          if (item.scene.position.x === x && item.scene.position.z === z) {
            deleteAnimation(item);
            scene.remove(item.scene);
            tmp.push(item);
          }
        });
      }
      else if (type === 'surface') {
        surface.forEach(item => {
          if (item.scene.position.x === x && item.scene.position.z === z) {
            deleteAnimation(item);
            scene.remove(item.scene);
            tmp.push(item);
          }
        });
      }
      return tmp;
    },
    clearMap: () => {
      // remove all terrain objects from the scene
      terrain.forEach(item => {
        deleteAnimation(item.glb);
        scene.remove(item.glb.scene);
      });

      // remove all surface objects from the scene
      surface.forEach(item => {
        deleteAnimation(item.glb);
        scene.remove(item.glb.scene);
      });
      
      terrain = [];
      surface = [];
    }
  };
  
  return api;

});