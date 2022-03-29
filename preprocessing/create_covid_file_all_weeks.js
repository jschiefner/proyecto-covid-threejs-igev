const fs = require('fs')
const models = require('./models')

async function main() {
    const [result, metadata] = await models.sequelize.query('select distinct date from caseweeks order by date')
    const dates = result.map((element) => element.date)
    console.log(JSON.stringify(dates))

    // const firstDate = new Date(dates[0])
    // console.log(firstDate)

    // const firstCaseWeeks = await models.caseweek.findAll({where: {date: new Date(firstDate)}});
    // console.log(firstCaseWeeks.length)

    let output = {}
    await Promise.all(dates.map(async (dateString) => {
        const date = new Date(dateString)
        const dateObject = {}
        const caseweeks = await models.caseweek.findAll({where: {date}, attributes: {exclude: ['createdAt', 'updatedAt']}})
        const dateRootObject = {}
        caseweeks.forEach((caseweek) => {
            dateRootObject[caseweek.nuts] = caseweek
        })
        output[date.toJSON()] = dateRootObject
    }))

    const path = 'covid_file_all_weeks.json'
    console.log(`writing output to ${path}`)
    fs.writeFileSync(path, JSON.stringify(output))
}

main()
