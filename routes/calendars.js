const { doesUserExist, getAllUserEvents, refreshDatabase } = require("../database")

const ical = require("ical-generator")

exports.getCal = async (req, res) => {
    const uid = req.params.calUid
    
 
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
                timezone: "America/Indiana/Indianapolis",
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


}

exports.getUid = async (req, res) => {
    const user = await doesUserExist(req.body.user)
    
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