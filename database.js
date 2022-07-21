const {
    MongoClient,
    ServerApiVersion
} = require('mongodb')
const dotenv = require('dotenv')

dotenv.config()


const url = process.env.MONGODB_URL


const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
client.connect(err => {

    console.log("Connected to database!")
});
const refreshDatabase = client.db("CalendarIntegration").collection("refreshTokens");
const eventsDatabase = client.db("CalendarIntegration").collection("events");
const prefDatabase = client.db("CalendarIntegration").collection("preferences");


const doesUserExist = async (user) => {
    
    const result = await refreshDatabase.findOne({
        user: user
    })
    
    
    if(result != null){
        
        return result
    } else if (result == null){
        
        return false
    }

 
    
}


const getAllUserEvents = async (user, callback) => {
    console.log(user,2)
    const events = []
    const result = eventsDatabase.find({
        user: user
    })
    result.forEach(async (doc) => {
        events.push(doc)
    }).then(() => {callback(events)})
}





const createEvent = async (details) => {

    details.event.url = "https://primary-record.com/events/" + details.primaryId
    const result = await eventsDatabase.insertOne(details)
}   


const editEvent = async(eventDetails, primaryId) => {


    const result = await eventsDatabase.updateOne({
        primaryId: primaryId
    }, {
        $set: {
            event: eventDetails
        }
    })
}


const deleteEvent = async(primaryId) => {
    
    const result = await eventsDatabase.deleteOne({
        primaryId: primaryId
    })
}


const whichService = async(user) => {
    
    const result = await refreshDatabase.findOne({
        user: user
    })
    
    if(result == null){
        return "none"
    } else {

        if(result.google_calendarId != null){
            return "google"
        } else if (result.iCalID != null){
            return "ical"
        } else {
            return "none"
        }
    }
}


const getPreferences = async(user) => {
    const result = await prefDatabase.findOne({
        user: user
    })
    return result
}



module.exports = {
    client,
    refreshDatabase,
    eventsDatabase,
    doesUserExist,
    createEvent,
    getAllUserEvents,
    editEvent,
    deleteEvent,
    whichService,
    getPreferences
};