import * as THREE from 'three';

const fileLoader = new THREE.FileLoader();

// Create awaitable version of file loader
function loadJsonFile(location) {
  return new Promise((resolve, reject) => {
    fileLoader.load(
        location,
        (data) => {
          resolve(JSON.parse(data));
        },
        null,
        (event) => {
          reject(event);
        })
  })
}

export {
    loadJsonFile
}
