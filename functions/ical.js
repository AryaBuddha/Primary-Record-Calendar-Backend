const {
    doesUserExist,
    refreshDatabase
} = require('../database.js')

const uuid4 = require('uuid4');

const dotenv = require('dotenv');
dotenv.config()


const saveiCal = async (user) => {

    const uniqueCal = uuid4()

    
    if(!await doesUserExist(user)){


        await refreshDatabase.insertOne({
            user: user,
            iCalID: uniqueCal
        })
        return uniqueCal
    } else {
        return false 
    }


}


module.exports = {
    saveiCal
}