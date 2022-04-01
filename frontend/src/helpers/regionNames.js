let regions = {};

const registerRegions = (geoData) => {
  geoData.value.features.forEach((region) => {
    regions[region.properties.NUTS_ID] = region.properties.NAME_LATN;
  });
}

const getRegionName = function(nuts) {
  return regions[nuts];
}

const getNutsCode = function(regionName) {
  return Object.keys(regions).find(key => regions[key] === regionName);
}

const getRegionList = function() {
  return Object.values(regions);
}

export {
  registerRegions,
  getRegionName,
  getNutsCode,
  getRegionList,
}
