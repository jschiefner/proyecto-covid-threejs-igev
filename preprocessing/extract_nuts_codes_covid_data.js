/*
 * Get current data from: https://www.ecdc.europa.eu/en/publications-data/weekly-subnational-14-day-notification-rate-covid-19
 * choose the JSON format
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
