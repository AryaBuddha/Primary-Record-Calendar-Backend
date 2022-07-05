const { doesUserExist, getAllUserEvents } = require("../database")

const ical = require("ical-generator")

exports.get = async (req, res) => {
    const cal = ical({name: "Calendar for " + req.body.user})
    const iCalEvents = []
    const rawCalEvents = []
    if(doesUserExist(req.body.user)) {
        getAllUserEvents(req.body.user, (events) => {
            
            events.map((event) => {
                eventInfo = event.event
                cal.createEvent({
                    start: eventInfo.start.dateTime,
                    end: eventInfo.end.dateTime,
                    summary: eventInfo.summary,
                    description: eventInfo.description,
                    location: eventInfo.location
                })
            })
            res.send({
                message: "Payload recieved",
                iCalEvents: cal.toString(),
                status: 200
            })
        })
        
    }
}