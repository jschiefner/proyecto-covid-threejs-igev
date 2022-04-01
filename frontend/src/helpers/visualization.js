import { Color } from "three";

const mediumIncidence = 2500;
const maxIncidence = 10000;

const mediumProportion = 0.03;
const maxProportion = 0.1;

const mediumValue = 0.7;
const bestHue = 138;
const insulation = 0.8;

const minExtrusion = 3;

const extrusion = function (incidence) {
  incidence = parseFloat(incidence)
  const extrusion = incidence / mediumIncidence * 5
  return extrusion < minExtrusion ? minExtrusion : extrusion
}

function HSVtoRGB(h, s, v) {
  let r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex({r, g, b}) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const colorByIncidence = function (incidence) {
  incidence = parseFloat(incidence)
  let rgb;
  if (incidence < mediumIncidence) {
    const hue = ((1 - (incidence / mediumIncidence)) * bestHue) / 360
    rgb = HSVtoRGB(hue, insulation, mediumValue)
  } else {
    if (incidence >= maxIncidence) incidence = maxIncidence;
    incidence -= mediumIncidence;
    const value = 1 - ((incidence / (maxIncidence - mediumIncidence)) * insulation);
    rgb = HSVtoRGB(0, insulation, value);
  }
  return rgbToHex(rgb);
}

const colorByProportion = function (proportion) {
  let rgb;
  if (proportion <= mediumProportion) {
    const hue = ((1 - (proportion / mediumProportion)) * bestHue) / 360
    rgb = HSVtoRGB(hue, insulation, mediumValue)
  }
  else {
    const value = 1 - ((proportion / (maxProportion - mediumProportion)) * insulation);
    rgb = HSVtoRGB(0, insulation, value);
  }
  return rgbToHex(rgb);
}

export default {
  extrusion,
  colorByIncidence,
  colorByProportion,
  maxIncidence,
}
