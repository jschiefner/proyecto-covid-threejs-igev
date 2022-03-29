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

function firstDayOfWeek(year, week) {
    // Jan 1 of 'year'
    let date = new Date(year, 0, 1)
    let offset = date.getTimezoneOffset()

    // ISO: week 1 is the one with the year's first Thursday
    // so nearest Thursday: current date + 4 - current day number
    // Sunday is converted from 0 to 7
    date.setDate(date.getDate() + 4 - (date.getDay() || 7))

    // 7 days * (week - overlapping first week)
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000
        * (week + (year == date.getFullYear() ? -1 : 0 )))

    // daylight savings fix
    date.setTime(date.getTime()
        + (date.getTimezoneOffset() - offset) * 60 * 1000)

    // back to Monday (from Thursday)
    date.setDate(date.getDate() - 3)

    return date
}

function parseDate(dateString) {
    let [year, week] = dateString.split('-')
    year = parseInt(year)
    week = parseInt(week)

    if (year == NaN || week == NaN) {
        throw new ArgumentError(`something wrong with this datestring: ${dateString}, year: ${year}, week: ${week}`)
    }

    return firstDayOfWeek(year, week)
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

models.caseweek.findOne({order: [['date', 'DESC']]}).then((last) => {

    let lastTime
    if (last) {
        lastTime = last.date.getTime()
    } else {
        lastTime = 0;
    }

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


        if (caseweek.date.getTime() > lastTime) {
            caseweek.save()
            counter++
        }
    })
    console.log(`Saved ${counter} new entries`)
})


// * To extract a specific week into a sample file:
// const fs = require('fs')
// const models = require('./models)
// copy in parse date functions
// let m;
// models.caseweek.findAll({where: {date: parseDate('2022-10')}}).then((elems) => m = elems) // to parse
// await...
// fs.writeFileSync('data.json', JSON.stringify(m))
