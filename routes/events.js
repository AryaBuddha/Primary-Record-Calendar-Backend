const {
    saveGoogleRefresh,
    addGoogleEvent,
    editGoogleEvent,
    deleteGoogleEvent
} = require('../functions/google.js')

const {
    doesUserExist,
    createEvent,
    getAllUserEvents,
    editEvent,
    deleteEvent,
    whichService
} = require('../database.js');


exports.add = async (req, res) => {
    

    const userObj = await doesUserExist(req.body.user)
    

    if(userObj){



        switch (await whichService(req.body.user)) {
            case "google":
        
                addGoogleEvent(req.body.event, userObj, 
                (googleCalID, primaryId) => {
                    createEvent({event: req.body.event, user: req.body.user, googleEventId: googleCalID, primaryId: primaryId})
                })
                break
            case "ical":
                
                createEvent({event: req.body.event, user: req.body.user, primaryId: Math.floor(Math.random() * (100000000 - 1) + 1)})
                break
                
            default:
                
                createEvent({event: req.body.event, user: req.body.user, primaryId: Math.floor(Math.random() * (100000000 - 1) + 1)})
                break
        }


        res.send({
            message: "Event added successfully!",
            status: 200
        })
    } else {
        res.send({
            message: "User does not exist!",
            status: 403
        })
    }

}


exports.getAll = async (req, res) => {
    const refreshTok = await doesUserExist(req.body.user)
    
    if(refreshTok){
        await getAllUserEvents(req.body.user, (events) => {
            res.send({
                events: events,
                status: 200
            })
        })
    } else {
        res.send({
            message: "User does not exist!",
            status: 404
        })
    }


}


exports.edit = async(req, res) => {

    const userObj = await doesUserExist(req.body.user)
    if(userObj){
        await editEvent(req.body.event, req.body.primaryId)
        switch(await whichService(req.body.user)){
            case "google":
                await editGoogleEvent(req.body.event, userObj, req.body.googleEventId)
                break
            case "ical":
                break



        }    
        res.send({
            message: "Event edited successfully!",
            status: 200
            })
    } else {
        res.send({
            message: "Event does not exist!",
            status: 404
        })
    }
    

    

}


exports.delete = async(req, res) => {
    
    const userObj = await doesUserExist(req.body.user)
    if(userObj){
        await deleteEvent(req.body.primaryId)
        
        switch(await whichService(req.body.user)){
            case "google":
                await deleteGoogleEvent(req.body.googleEventId, userObj)
                break

            case "ical":
                break
        }
        res.send({
            message: "Event deleted successfully!",
            status: 200
        })
    }
    else {
        res.send({
            message: "Event does not exist!",
            status: 404
        })
    }
}