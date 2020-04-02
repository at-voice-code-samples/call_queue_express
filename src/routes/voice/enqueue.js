const express = require("express");
const enqueueHandler = express.Router();

const xmlBuilder = require("xmlbuilder");

const { hgetallAsync } = require("../../utils/redis/redis");

enqueueHandler.post('/', async (req, res, next) => {
    let sessionID   = req.fields.sessionId;
    let callResponse;
    let action = await hgetallAsync(sessionID);

    callResponse = { 
        Response : {
            Enqueue : {
                '@name': `${action['queueName']}`,
                '@holdMusic': 'https://s3.eu-west-2.amazonaws.com/at-voice-sample/play.mp3'
            }
        }
    };

    callResponse = xmlBuilder
    .create(callResponse, { encoding: "utf-8" })
    .end({ pretty: true });
    res.status(200).send(callResponse);
});

module.exports = enqueueHandler;