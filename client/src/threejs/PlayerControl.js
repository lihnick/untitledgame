import * as THREE from 'three';

import GameAsset from './GameAsset';

export default (function PlayerControl(scene, animateController) {

  let playerMap = {};

  let api = {
    getCallbackContext: (playerData) => {
      return {
        'id': playerData['id'],
        'type': 'player',
        'username': 'placeholder',
        'property': GameAsset['players'][0],
        'position': new THREE.Vector3(playerData.position.x, 1, playerData.position.z),
        'rotation': new THREE.Euler(0,0,0, 'XYZ'),
        'scale': new THREE.Vector3(1,1,1)
      }
    },
    setRotation: () => {

    },
    setPosition: (playerId, position) => {
      if (playerId in playerMap) {
        playerMap[playerId].scene.position.setComponent(0, position.x);
        playerMap[playerId].scene.position.setComponent(2, position.z);
      }
    },
    getPlayer: (playerId) => {
      return playerMap[playerId];
    },
    addPlayer: (player) => {
      if (player.id in playerMap) {
        console.warn('Player Id already exists!');
        console.log('Current Player: ', playerMap[player.id], '\nGiven Player: ', player);
      }
      else {
        playerMap[player.id] = player.glb;
      } 
    },
    removePlayer: (id) => {
      if (id in playerMap) {
        let tmp = playerMap[id];
        scene.remove(tmp.scene);
        delete playerMap[id];
        return tmp;
      }
      return null;
    }
  }

  return api;
});