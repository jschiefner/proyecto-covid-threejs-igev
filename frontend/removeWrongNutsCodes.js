const fs = require('fs');

if (process.env.FILEPATH == undefined || process.env.FILEPATH == undefined) {
    console.log("FILEPATH not defined")
    process.exit(1)
}

const path = process.env.FILEPATH

const json = fs.readFileSync(path)
const data = JSON.parse(json)

data.features = data.features.filter(feature => {
    return feature.properties.LEVL_CODE == 1
})

console.log(data.features.length)

const output = JSON.stringify(data)
fs.writeFileSync(path + "lvl1.geojson", output)
