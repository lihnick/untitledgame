import * as THREE from 'three';

export default(function CameraControl(camera, domElement, property) {
  
  let cameraOffset = new THREE.Vector3(
    property.CameraOffset.x || 0,
    property.CameraOffset.y || 3,
    property.CameraOffset.z || 5
  );

  let enabled = true;
  let panSpeed = 1.0;

  let isTrackingPlayer = false;
  let trackingObj = null;

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
    let needUpdate = false;
    switch (event.keyCode) {
      case KEYS.ArrowUp:
      case KEYS.KeyW:
        panCamera(forwardVector, 1);
        needUpdate = true;
        break;
      case KEYS.ArrowLeft:
      case KEYS.KeyA:
        panCamera(rightVector, -1);
        needUpdate = true;
        break;
      case KEYS.ArrowDown:
      case KEYS.KeyS:
        panCamera(forwardVector, -1);
        needUpdate = true;
        break;
      case KEYS.ArrowRight:
      case KEYS.KeyD:
        panCamera(rightVector, 1);
        needUpdate = true;
        break;
    }
    if (needUpdate) {

    }
  }

  function panCamera(deltaVector, directionUnit) {
    let offset = deltaVector.clone();
    if (camera.isPerspectiveCamera) {
      offset.multiplyScalar(directionUnit * panSpeed);
      camera.position.add(offset);
    } else {
      console.log('Camera is not a perspective camera:', camera);
    }
  }

  updateDirectionVector();
  domElement.addEventListener('keydown', handleKeyDown, false);

  let api = {
    update: () => {

    },
    lookAtOnce: (target) => {

    },
    clearListener: () => {
      domElement.removeEventListener('keydown', handleKeyDown, false);
    }
  }

  return api;
});

// module.exports = CameraControl;