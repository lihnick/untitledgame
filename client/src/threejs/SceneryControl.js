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
    getTerrain: () => {
      return terrain;
    },
    getSurface: () => {
      return surface;
    },
    getVisuals: () => {
      return visuals;
    },
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
        'scale': new THREE.Vector3(1, 1, 1),
        'isVisual': (isVisual)? true : false
      }
    },
    addObject: (object, isVisual) => {
      if (isVisual) {
        visuals.push(object['glb']);
      }
      else if (object['type'] === 'terrain') {
        let {x, z} = object['glb'].scene.position;
        terrain[Math.round(x)][Math.round(z)] = object['glb'];
      }
      else if (object['type'] === 'surface') {
        let {x, z} = object['glb'].scene.position;
        surface[Math.round(x)][Math.round(z)] = object['glb'];
      }
    },
    getObject: (position, type) => {
      let {x, z} = position;
      if (type === 'terrain') {
        return terrain[Math.round(x)][Math.round(z)];
      }
      else if (type === 'surface') {
        return surface[Math.round(x)][Math.round(z)];
      }
    },
    removeObject: (position, type) => {
      let { x, z } = position;
      if (type === 'terrain') {
        if (terrain[Math.round(x)][Math.round(z)] !== null) {
          let tmp = terrain[Math.round(x)][Math.round(z)];
          scene.remove(tmp.scene);
          return tmp;
        }
      }
      else if (type === 'surface') {
        if (surface[Math.round(x)][Math.round(z)] !== null) {
          let tmp = surface[Math.round(x)][Math.round(z)];
          scene.remove(tmp.scene);
          return tmp;
        }
      }
      return null;
    },
    setMapSize: (mapsize) => {
      for (let x = 0; x < mapsize[0]; x++) {
        terrain.push(Array(mapsize[1]).fill(null));
        surface.push(Array(mapsize[1]).fill(null));
      }
    },
    clearMap: (mapsize) => {
      // remove all terrain objects from the scene
      terrain.forEach(rows => {
        if (Array.isArray(rows)) {
          rows.forEach(item => {
            scene.remove(item.scene);
          });
        }
      });
      // remove all surface objects from the scene
      surface.forEach(rows => {
        if (Array.isArray(rows)) {
          rows.forEach(item => {
            scene.remove(item.scene);
          });
        }
      });
      // remove all visual effect objects from the scene
      visuals.forEach(item => scene.remove(item.scene));

      terrain = [];
      surface = [];
      visuals = [];
      if (mapsize === null) return;

      // if mapsize is provided then reinitialize data structure after clearing map
      for (let x = 0; x < mapsize[0]; x++) {
        terrain.push(Array(mapsize[1]).fill(null));
        surface.push(Array(mapsize[1]).fill(null));
      }
    }
  };
  
  return api;

});