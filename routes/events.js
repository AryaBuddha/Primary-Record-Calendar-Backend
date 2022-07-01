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
    deleteEvent
} = require('../database.js');


exports.add = async (req, res) => {
    console.log(req.body)

    const refreshTok = await doesUserExist(req.body.user)
    console.log(refreshTok)
    addGoogleEvent(req.body.event, refreshTok, 
    (googleCalID, primaryID) => {
        createEvent(req.body.event, req.body.user, googleCalID, primaryID)
    })
    


    res.send({
        message: "Event added successfully!",
        status: 200
    })
}


exports.getAll = async (req, res) => {
    const refreshTok = await doesUserExist(req.body.user)
    console.log(req.body.user)
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
    const refreshTok = await doesUserExist(req.body.user)
    if(refreshTok){
        await editEvent(req.body.event, req.body.primaryID)

        await editGoogleEvent(req.body.event, refreshTok, req.body.googleEventID)
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
    const refreshTok = await doesUserExist(req.body.user)
    if(refreshTok){
        await deleteEvent(req.body.primaryID)
        
        await deleteGoogleEvent(req.body.googleEventID, refreshTok)
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