import * as THREE from 'three';

import GameAsset from './GameAsset';

export default (function PlayerControl(playerId, scene) {

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
    addPlayer: (id, player) => {
      if (!(id in playerMap)) {
        playerMap[id] = player;
      }
    },
    removePlayer: (id) => {
      if (id in playerMap) {
        let tmp = playerMap[id];
        delete playerMap[id];
        return tmp;
      }
      return null;
    }
  }

  return api;
});