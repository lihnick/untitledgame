import * as THREE from 'three';

export default(function CameraControl(camera, property) {
  
  let cameraOffset = new THREE.Vector3(0, 3, 5);
  if ('cameraOffset' in property && 'x' in property.cameraOffset && 'y' in property.cameraOffset && 'z' in property.cameraOffset) {
    cameraOffset.x = property.cameraOffset.x;
    cameraOffset.y = property.cameraOffset.y;
    cameraOffset.z = property.cameraOffset.z;
  }

  let enabled = true;
  let panSpeed = 10;
  if ('panSpeed' in property) {
    panSpeed = property.panSpeed;
  }

  let KEYS = {
    'ArrowUp': 38,
    'ArrowLeft': 37,
    'ArrowDown': 40,
    'ArrowRight': 39,
    'KeyW': 87,
    'KeyA': 65,
    'KeyS': 83,
    'KeyD': 68
  }

  // direction vector are contextual depending where the camera is looking
  let forwardVector = null;
  let rightVector = null;
  let upVector = null;
  let prevTime = performance.now();
  let velocity = new THREE.Vector3();
  let isMoving = {
    'forward': 0,
    'right': 0,
    'up': 0
  }

  // Call this function everytime camera rotation is updated
  function updateDirectionVector() {
    // The default camera is looking down its negative z-axis, create a point looking in the same direction
    let forward = new THREE.Vector3(0, 0, -1);
    // Apply the same camera rotation to the forward vector
    if (typeof camera.getWorldDirection === 'function') {
      camera.getWorldDirection(forward);
    } else {
      console.warn('Did not find function getWorldDirection from given camera object');
      forward.applyQuaternion(camera.applyQuaternion);
    }
    
    forward.y = 0; 
    // reset up vector so forward movement is relative to world coordinate (not affected by camera pitch)
    forward.normalize().round();
    let up = camera.up;
    // Calculate the right vector by taking the cross product of forward vector with the global up vector
    let right = forward.clone();
    right.cross(up);
    
    forwardVector = forward;
    rightVector = right;
    upVector = up;
  }

  function handleKeyDown(event) {
    if (!enabled) return;
    switch (event.keyCode) {
      case KEYS.ArrowUp:
      case KEYS.KeyW:
        isMoving.forward = 1;
        break;
      case KEYS.ArrowLeft:
      case KEYS.KeyA:
        isMoving.right = -1;
        break;
      case KEYS.ArrowDown:
      case KEYS.KeyS:
        isMoving.forward = -1;
        break;
      case KEYS.ArrowRight:
      case KEYS.KeyD:
        isMoving.right = 1;
        break;
    }
  }

  function handleKeyUp(event) {
    if (!enabled) return;
    switch (event.keyCode) {
      case KEYS.ArrowUp:
      case KEYS.KeyW:
      case KEYS.ArrowDown:
      case KEYS.KeyS:
        isMoving.forward = 0;
        break;
      case KEYS.ArrowLeft:
      case KEYS.KeyA:
      case KEYS.ArrowRight:
      case KEYS.KeyD:
        isMoving.right = 0;
        break;
    }
  }

  console.log('initialize camera control');
  window.addEventListener('keydown', handleKeyDown, false);
  window.addEventListener('keyup', handleKeyUp, false);
  camera.position.x = cameraOffset.x;
  camera.position.y = cameraOffset.y;
  camera.position.z = cameraOffset.z;
  camera.lookAt(3, 0, 5);
  updateDirectionVector(); 

  let api = {
    update: () => {
      if (!enabled) return;
      // move camera smoothly based on user's performace
      let time = performance.now();
      let delta = (time - prevTime) / 1000;

      velocity.set(0, 0, 0);
      velocity.add(forwardVector.clone().multiplyScalar(isMoving.forward));
      velocity.add(rightVector.clone().multiplyScalar(isMoving.right));
      velocity.normalize().multiplyScalar(panSpeed * delta);

      camera.position.add(velocity);
      prevTime = time;
    },
    disableControl: (player) => {
      // disable camera panning via keyboard inputs
      enabled = false;
      window.removeEventListener('keydown', handleKeyDown, false);
      window.removeEventListener('keyup', handleKeyUp, false);
      
      // camera position jump to player plus some offset (3rd person offset)
      let position = player.position.clone();
      position.add(cameraOffset);
      camera.set(position.x, position.y, position.z);
      
      // camera rotate to look at player, position updates based on player location
      camera.lookAt(player.position);
    },
    enableControl: () => {
      enabled = true;
      window.addEventListener('keydown', handleKeyDown, false);
      window.addEventListener('keyup', handleKeyUp, false);
    }
  }

  return api;
});
