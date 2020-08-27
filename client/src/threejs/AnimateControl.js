import * as THREE from 'three';

export default (function AnimateControl() {

  let mixers = {};
  let clock = new THREE.Clock();

  let api = {
    update: () => {
      let delta = clock.getDelta();
      Object.keys(mixers).forEach(key => {
        mixers[key].mixer.update(delta);
      });
    },
    addAnimationMixer: (glb, name) => {
      console.log('AnimateControl:', glb);
      if (glb.scene.uuid in mixers) {
        console.warn(`uuid ${glb.scene.uuid} is a duplicate or already added.`, glb);
      }
      else {
        let mixer = new THREE.AnimationMixer(glb.scene);
        let animateClip = THREE.AnimationClip.findByName(glb.animations, name);
        mixer.clipAction(animateClip).play();
        mixers[glb.scene.uuid] = {
          'mixer': mixer,
          'name': name,
          'glb': glb
        }
      }
    },
    deleteAnimation: (glb) => {
      if (glb.scene.uuid in mixers) {
        mixers[glb.scene.uuid].mixer.stopAllAction();
        delete mixers[glb.scene.uuid];
      }
    }
  }
  return api;
});