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



const doesUserExist = async (user) => {

    const result = await refreshDatabase.findOne({
        user: user
    })
    console.log(result)
    if(result != null){
        
        return result
    } else {
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





const createEvent = async (eventDetails, user, googleEventID, primaryID) => {

    const result = await eventsDatabase.insertOne({
        event: eventDetails,
        user: user,
        googleEventID: googleEventID,
        primaryID: primaryID
    })
}   


const editEvent = async(eventDetails, primaryID) => {


    const result = await eventsDatabase.updateOne({
        primaryID: primaryID
    }, {
        $set: {
            event: eventDetails
        }
    })
}


const deleteEvent = async(primaryID) => {
    console.log(primaryID)
    const result = await eventsDatabase.deleteOne({
        primaryID: primaryID
    })
}







module.exports = {
    client,
    refreshDatabase,
    eventsDatabase,
    doesUserExist,
    createEvent,
    getAllUserEvents,
    editEvent,
    deleteEvent
};