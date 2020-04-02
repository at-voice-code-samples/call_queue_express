const express = require("express");
const dequeueHandler = express.Router();

const appCreds = require("../../config/credentials");

dequeueHandler.post('/', async (req, res, next) => {
    let sessionID   = req.fields.sessionId;
    let callResponse;
    let action = await hgetallAsync(sessionID);

    callResponse = { 
        Response : {
            Dequeue : {
                '@name': `${action['queueName']}`,
                '@phoneNumber': `${appCreds.nQNumber}`
            }
        }
    };

    callResponse = xmlBuilder
    .create(redirectResponse, { encoding: "utf-8" })
    .end({ pretty: true });
    res.status(200).send(callResponse);
});

module.exports = dequeueHandler;