const {
    google
} = require('googleapis');

const {
    doesUserExist,
    refreshDatabase
} = require('../database.js')

const dotenv = require('dotenv');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport/index.js');
dotenv.config()


const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
)

const saveGoogleRefresh = async (authCode) => {


    let {
        tokens
    } = await oauthClient.getToken(authCode)
    oauthClient.setCredentials(tokens)
    google.options({auth: oauthClient});
    


    const auth2 = google.oauth2({
        version: 'v2',
        oauthClient
    })

    
    let user = await auth2.userinfo.get()
    user = user.data.email



    const calendar = google.calendar({
        version: 'v3',
        oauthClient
    });
    const cal = await calendar.calendars.insert({
        requestBody:{

            summary: `Primary Record - ${user}`,
            timeZone: "America/Indianapolis"
        }
    })


    refreshDatabase.insertOne({
        google_refreshToken: tokens.refresh_token,
        user: user,
        google_calendarId: cal.data.id
    })

    if (await doesUserExist(user)) {
    
        await refreshDatabase.updateOne({
            user: user
        }, {
            $set: {
                google_refreshToken: tokens.refresh_token,

            }
        })
    } else {

        refreshDatabase.insertOne({
            google_refreshToken: tokens.refresh_token,
            user: user,
            google_calendarId: cal.data.id
        })
    } 

    return user

}





const addGoogleEvent =  async (eventDetails, userDataObj, callback) => {
    
    console.log(userDataObj)
    oauthClient.setCredentials({
        refresh_token: userDataObj.google_refreshToken
    });
    google.options({auth: oauthClient});

  
    const calendar = google.calendar({
        version: 'v3',
        oauthClient
    });
    
    
    const primaryId = Math.floor(Math.random() * (100000000 - 1) + 1)

    
    eventDetails.description = `Primary Record Link: https://primary-record.com/event/${primaryId} \n\nNotes:\n${eventDetails.description}`
    delete eventDetails.url

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
        callback(event.data.id, primaryId)
        
        
    })

}


const editGoogleEvent = async (eventDetails, userDataObj, googleEventId) => {
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
        eventId: googleEventId,
        sendNotifications: true,
        requestBody: eventDetails
    })    

}




const deleteGoogleEvent = async (googleEventId, userDataObj) => {

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
        eventId: googleEventId,
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
    saveGoogleRefresh,
    addGoogleEvent,
    editGoogleEvent,
    deleteGoogleEvent,
    getUserGoogleCalendarID
}