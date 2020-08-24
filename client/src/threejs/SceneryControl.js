import * as THREE from 'three';

import GameAsset from './GameAsset';

export default (function SceneryControl(scene) {

  // List of scene objects that players can stand on
  let terrain = [];
  // List of scene objects that are interactive or obstructive
  let surface = [];
  // visual effect objects to make scene look noice
  let visuals = [];

  let api = {
    getCallbackContext: (objectData, isVisual) => {
      if (!isVisual && objectData['position'].length === 2) {
        if (objectData['type'] === 'terrain') objectData['position'].splice(1, 0, [0]);
        if (objectData['type'] === 'surface') objectData['position'].splice(1, 0, [1]);
      }
      return {
        'type': objectData['type'],
        'property': GameAsset[objectData['type']][objectData['assetIndex']],
        'position': new THREE.Vector3(...objectData['position']),
        'rotation': new THREE.Euler(0, 0, 0, 'XYZ'),
        'scale': new THREE.Vector3(1, 1, 1)
      }
    },
    addObject: (object, type) => {

    },
    removeObject: (position) => {

    },
    setMapSize: (mapsize) => {
      for (let x = 0; x < mapsize[0]; x++) {
        terrain.push(Array(mapsize[1]).fill(null));
        surface.push(Array(mapsize[1]).fill(null));
      }
    },
    clearMap: () => {
      
    }
  };

  // for (let x = 0; x < mapsize[0]; x++) {
  //   terrain.push(Array(mapsize[1]).fill(null));
  //   surface.push(Array(mapsize[1]).fill(null));
  // }
  
  return api;

});