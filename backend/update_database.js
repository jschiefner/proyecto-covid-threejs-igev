const fs = require('fs')
const models = require('./models')

var file = process.env.DATA_FILE

if (file == null || file == undefined) {
    console.error("no DATA_FILE was specified, please run this program like this: \"DATA_FILE=path/to/file npm run update\"")
    process.exit(1)
}

file = fs.readFileSync(file)
file = JSON.parse(file)

let counter = {}
file.forEach(element => {
    for (const key in element) {
        if (key in counter) {
            counter[key]++;
        } else {
            counter[key] = 1;
        }
    }
});

console.log("Total Objects: ", file.length)
console.log("Distribution of present data:", counter)


// {
//     country: 'Sweden',
//     region_name: 'Norrbottens Lan',
//     nuts_code: 'SE332',
//     year_week: '2022-10',
//     rate_14_day_per_100k: 265.901084796456,
//     weekly_count: 290,
//     population: 250093,
//     source: 'Epidemic intelligence subnational data'
// }

let element = file[[file.length-1]];

const caseweek = models.caseweek.build({
    country: element.country,
    region: element.region_name,
    nuts: element.nuts_code,
    date: element.year_week,
    incidence: element.rate_14_day_per_100k,
    count: element.weekly_count,
    population: element.population,
    source: element.source,
})

caseweek.save()
