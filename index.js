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

app.get('/calendars/get/:calUid', calendars.get)



app.post('/googleauth', (req, res) => {

    const response = saveGoogleRefresh(req.body.code, req.body.user)

    res.send({
        message: "Payload recieved",
        status: 200
    })
})


app.post('/addcal', async (req, res) => {
    const response = await saveiCal(req.body.user)
    if(!response) {
        res.send({
            message: "User already exists!",
            status: 403
        })
    } else {
        res.send({
        message: "Payload recieved",
        iCalID: response,
        status: 200

        })
    }

    
})


app.listen(port, () => {
    console.log('Listening on port ' + port)
})