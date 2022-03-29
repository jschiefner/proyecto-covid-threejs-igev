const express = require('express')
const app = express()
const models = require('./models')

models.caseweek.findOne().then(function(caseweek) {
    console.log(caseweek)
})

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.listen(3000, function() {
    console.log('Example App listening on port 3000')
})
