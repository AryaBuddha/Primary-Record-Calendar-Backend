const express = require('express')
const cors = require('cors')

const app = express()

const port = process.env.PORT || 4000

const {
    saveGoogleRefresh
} = require('./functions/google.js')
const {
    saveiCal
} = require('./functions/ical.js')

const events = require('./routes/events.js')
const calendars = require('./routes/calendars.js')
const { whichService } = require('./database.js')

const logger = (req, res, next) => {
    const time = Date.now()
    next()
}

app.use(cors())
app.use(logger)
app.use(express.json())

app.post('/events/add', events.add)
app.post('/events/getAll', events.getAll)
app.post('/events/edit', events.edit)
app.post('/events/delete', events.delete)


app.get('/calendars/getCal/:calUid', calendars.getCal)
app.post('/calendars/getUid', calendars.getUid)

app.post('/services', async (req, res) => {
    console.log(req.body)
    const result =  await whichService(req.body.user)

    res.send({
        service: result
    })
})


app.post('/googleauth', async (req, res) => {

    const response = await saveGoogleRefresh(req.body.code)

    res.send({
        message: "Payload recieved",
        status: 200,
        user: response
    })
})


app.post('/addcal', async (req, res) => {
    const response = await saveiCal(req.body.user)
    console.log("This is the response: " + response)
    res.send({
    message: "Payload recieved",
    iCalID: response,
    status: 200

    })
    
    
})





app.listen(port, () => {
    console.log('Listening on port ' + port)
})