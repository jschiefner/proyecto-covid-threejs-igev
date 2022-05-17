/*
 * get current file from: https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts
 * Download options:
 *
 * Year: NUTS 2021
 * File format: GeoJSON
 * Geometry type: Polygons (RG)
 * Scale: 60M (this is the smallest resolution which yields the best performance but other resolutions work too)
 * Coordinate reference system:	EPSG: 4326 (also used by GPS)
 *
 */

const fs = require('fs');

var file = process.env.DATA_FILE

if (file == null || file == undefined) {
    console.error("no DATA_FILE was specified, please run this program like this: \"DATA_FILE=path/to/file npm run extract-nuts\"")
    process.exit(1)
}

file = fs.readFileSync(file)
file = JSON.parse(file)

let nutsArray = []
file.forEach(element =>  {
    const nuts = element['nuts_code']
    if (!nutsArray.includes(nuts)) {
        nutsArray.push(nuts)
    }
})

console.log(JSON.stringify(nutsArray))
// => ["AT11","AT12",...,"SE331","SE332"]
