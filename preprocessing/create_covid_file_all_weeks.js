const fs = require('fs')
const models = require('./models')

async function main() {
    const [result, metadata] = await models.sequelize.query('select distinct date from caseweeks order by date')
    const dates = result.map((element) => element.date)

    let output = {}
    await Promise.all(dates.map(async (dateString) => {
        const date = new Date(dateString)
        const dateObject = {}
        const caseweeks = await models.caseweek.findAll({where: {date}, attributes: {exclude: ['createdAt', 'updatedAt']}})
        const dateRootObject = {}
        caseweeks.forEach((caseweek) => {
            dateRootObject[caseweek.nuts] = caseweek
        })
        console.log(date, date.toJSON())
        output[date.toJSON()] = dateRootObject
    }))

    const path = 'covid_file_all_weeks.json'
    console.log(`writing output to ${path}`)
    fs.writeFileSync(path, JSON.stringify(output))
}

main()
