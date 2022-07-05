const { doesUserExist, getAllUserEvents, refreshDatabase } = require("../database")

const ical = require("ical-generator")

exports.getCal = async (req, res) => {
    const uid = req.params.calUid
    console.log(uid)
 
    refreshDatabase.findOne({iCalID: uid}, (err, doc) => {
        if (err) {
            res.send({
                message: "Error getting calendar",
                status: 500
            })
        }
        if (doc) {
            const cal = ical({
                name: "Calendar for " + doc.user,
                domain: "https://calendar-integration.herokuapp.com",
                prodId: { company: "Primary Record", product: "Calendar Integration" },
                timezone: "America/New_York",
                ttl: 60
            })

            getAllUserEvents(doc.user, (events) => {
                events.forEach(event => {
                    cal.createEvent({
                        start: new Date(event.event.start.dateTime),
                        end: new Date(event.event.end.dateTime),
                        summary: event.event.summary,
                        description: event.event.description,
                        location: event.event.location
                    })
                })
                res.set("Content-Type", "text/calendar")
                res.send(cal.toString())
                
            })
        }
    })


  /*   const cal = ical({name: "Calendar for " + req.body.user})
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
            res.send(
                cal.toString()
            )
        })
        
    } */
}

exports.getUid = async (req, res) => {
    const user = await doesUserExist(req.body.user)
    console.log(user)
    if(user) {
        
        res.send({
            uid: user.iCalID,
            status: 200
        })
    } else {
        res.send({
            message: "User does not exist",
            status: 404
        })
    }
}