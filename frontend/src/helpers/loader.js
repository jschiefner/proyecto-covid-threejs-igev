import { FileLoader, TextureLoader, MeshBasicMaterial, BackSide } from 'three';

const fileLoader = new FileLoader();
const textureLoader = new TextureLoader();

function jsonFile(location) {
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

function asyncLoadTexture(path) {
  return new Promise((resolve, reject) => {
    textureLoader.load(path, (result) => {
      resolve(result)
    })
  });
}

const globeTexture = async function (location) {
  return await asyncLoadTexture(location);
}

function createPathStrings(filename) {
  const fileType = ".png";
  const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
  const pathStings = sides.map((side) => {
    return filename + "_" + side + fileType;
  });
  return pathStings;
}

const skyboxTexture = async function (location) {
  const loader = new TextureLoader();
  const skyboxImagepaths = createPathStrings(location);
  const materialArray = Promise.all(skyboxImagepaths.map(async (image) => {
    let texture = await asyncLoadTexture(image);
    return new MeshBasicMaterial({
      map: texture,
      side: BackSide,
      transparent: true,
      opacity: 0.5,
    });
  }));
  return materialArray;
}

export default {
  jsonFile,
  globeTexture,
  skyboxTexture,
}
