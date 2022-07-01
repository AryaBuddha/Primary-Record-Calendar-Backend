const axios = require('axios');
const querystring = require('querystring');
const {
    google
} = require('googleapis');

const {
    doesUserExist,
    database,
    refreshDatabase
} = require('../database.js')

const dotenv = require('dotenv');
const { callbackify } = require('util');
dotenv.config()


const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
)

const saveGoogleRefresh = async (authCode, user) => {


    let {
        tokens
    } = await oauthClient.getToken(authCode)
    oauthClient.setCredentials(tokens)
    google.options({auth: oauthClient});
    console.log("thehokreok", tokens)



    const calendar = google.calendar({
        version: 'v3',
        oauthClient
    });
    const cal = await calendar.calendars.insert({
        requestBody:{

            summary: "Primary Record",
            timeZone: "America/Indianapolis"
        }
    })
    
    console.log(doesUserExist(user))


    database.insertOne({
        google_refreshToken: tokens.refresh_token,
        user: user,
        google_calendarId: cal.data.id
    })

if (await doesUserExist(user)) {
    
        await database.updateOne({
            user: user
        }, {
            $set: {
                google_refreshToken: tokens.refresh_token,

            }
        })
    } else {

        database.insertOne({
            google_refreshToken: tokens.refresh_token,
            user: user,
            google_calendarId: cal.data.id
        })
    } 

}





const addGoogleEvent =  async (eventDetails, userDataObj, callback) => {
    //Geneate access token using google oauth library
    console.log(userDataObj)
    oauthClient.setCredentials({
        refresh_token: userDataObj.google_refreshToken
    });
    google.options({auth: oauthClient});

  
    const calendar = google.calendar({
        version: 'v3',
        oauthClient
    });
    
    
    const primaryID = Math.floor(Math.random() * (100000000 - 1) + 1)

    
    eventDetails.description = `Primary Record ID: ${primaryID} \n\n${eventDetails.description}`

    calendar.events.insert({
        auth: oauthClient,
        calendarId: userDataObj.google_calendarId,
        resource: eventDetails,
    }, async (err, event) => {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log('Event created: %s', event.htmlLink);
        //console.log(event)
        console.log(event.data.id)
        callback(event.data.id, primaryID)
        
        
    })
 

    

}


const editGoogleEvent = async (eventDetails, userDataObj, googleEventID) => {
    oauthClient.setCredentials({
        refresh_token: userDataObj.google_refreshToken
    });
    google.options({auth: oauthClient});

    const calendar = google.calendar({
        version: 'v3',
        oauthClient
    });

    const res = await calendar.events.update({
        calendarId: userDataObj.google_calendarId,
        eventId: googleEventID,
        sendNotifications: true,
        requestBody: eventDetails
    })    

}




const deleteGoogleEvent = async (eventID, userDataObj) => {

    oauthClient.setCredentials({
        refresh_token: userDataObj.google_refreshToken
    });
    google.options({auth: oauthClient});

    const calendar = google.calendar({
        version: 'v3',
        oauthClient
    });

    await calendar.events.delete({
        calendarId: userDataObj.google_calendarId,
        eventId: eventID,
        sendNotifications: true,
    })
}


const getUserGoogleCalendarID = async (user) => {
    const result = await refreshDatabase.findOne({
        user: user
    })
    return result.google_calendarId
}


module.exports = {
    saveGoogleRefresh: saveGoogleRefresh,
    addGoogleEvent: addGoogleEvent,
    editGoogleEvent: editGoogleEvent,
    deleteGoogleEvent: deleteGoogleEvent,
    getUserGoogleCalendarID: getUserGoogleCalendarID
}