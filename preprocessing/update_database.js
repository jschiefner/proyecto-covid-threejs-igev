const fs = require('fs')
const { mainModule } = require('process')
const models = require('./models')
const moment = require('moment')

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

function parseDate(dateString) {
    const date = moment(dateString, 'YYYY-W')
    date.utc(true)
    return date.toDate()
}

// example from file
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


async function main() {
    await models.caseweek.truncate()
    let counter = 0;
    file.forEach(element => {
        const caseweek = models.caseweek.build({
            country: element.country,
            region: element.region_name,
            nuts: element.nuts_code,
            date: parseDate(element.year_week),
            incidence: element.rate_14_day_per_100k,
            count: element.weekly_count,
            population: element.population,
            source: element.source,
        })

        caseweek.save()
        counter++
    })
    console.log(`Saved ${counter} new entries`)
}


main()


// * To extract a specific week into a sample file:
// const fs = require('fs')
// const models = require('./models)
// copy in parse date functions
// let m;
// models.caseweek.findAll({where: {date: parseDate('2022-10')}}).then((elems) => m = elems) // to parse
// await...
// fs.writeFileSync('data.json', JSON.stringify(m))
