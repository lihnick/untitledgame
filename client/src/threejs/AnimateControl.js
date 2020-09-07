import * as THREE from 'three';

export default (function AnimateControl() {
  /* Sample mixer structure
  mixers = {
    ObjectUUID1: [
      { mixer, name1, glb },
      { mixer, name2, glb },
    ],
    ObjectUUID2: [
      { mixer, name3, glb }
    ]
  }
  morphs = {
    ObjectUUID1: [
      { mesh, name1, glb }
    ]
  }
  */
  let mixers = {};
  let morphs = {};
  let clock = new THREE.Clock();

  let api = {
    update: () => {
      let delta = clock.getDelta();
      Object.keys(mixers).forEach(objectId => {
        mixers[objectId].forEach(key => {
          key.mixer.update(delta);
        });
      });
    },
    addAnimationMixer: (glb, property) => {
      if ('onStart' in property) {
        property['onStart'].forEach(animationName => {
          let mixer = new THREE.AnimationMixer(glb.scene);
          let animateClip = THREE.AnimationClip.findByName(glb.animations, animationName);
          mixer.clipAction(animateClip).play();
          if (glb.scene.uuid in mixers) {
            mixers[glb.scene.uuid].push({
              'mixer': mixer,
              'name': animationName,
              'glb': glb
            });
          } else {
            mixers[glb.scene.uuid] = [{
              'mixer': mixer,
              'name': animationName,
              'glb': glb
            }];
          }
        });
      }
      else if ('onTrigger' in property) {
        let animateClip = THREE.AnimationClip.findByName(glb.animations, property['onTrigger']);
        console.log('on trigger animations to be implemented');
      }
    },
    deleteAnimation: (glb) => {
      if (glb.scene.uuid in mixers) {
        mixers[glb.scene.uuid].forEach(animation => {
          animation.mixer.stopAllAction();
        })
        delete mixers[glb.scene.uuid];
      }
    },
    addMorphingTarget: (glb, property) => {

    }
  }
  return api;
});