import { Color } from "three";

const maxIncidence = 10000;

const extrusion = function (incidence) {
  incidence = parseFloat(incidence)
  return incidence / 500
}

// black and white scheme for now
const colorByIncidence = function (incidence) {
  incidence = parseFloat(incidence)
  if (incidence > maxIncidence) incidence = maxIncidence
  let value = (255 - Math.round((incidence / maxIncidence) * 255))
    .toString(16)
    .padStart(2, "0");
  return new Color(`#${value}${value}${value}`);
}

export default {
  extrusion,
  colorByIncidence,
}
