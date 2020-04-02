const express = require("express");
const dtmfDigitsHandler = express.Router();

const xmlBuilder = require("xmlbuilder");

const { hgetallAsync, redisClient } = require("../../utils/redis/redis");

dtmfDigitsHandler.post("/", async (req, res, next) => {
  let sessionID = req.fields.sessionId;
  let input = req.fields.dtmfDigits;

  let queueName;
  let redirectResponse;
  let callResponse;
  let action = await hgetallAsync(sessionID);
  switch (input) {
    case "1":
      queueName = "agents";
      break;
    case "2":
      queueName = "management";
      break;
    default:
      queueName = "agents";
      break;
  }
  redirectResponse = {
    Response: {
      Redirect: {
        "#text": `${process.env.HOSTNAME}/voice/${action["callRequest"]}`
      }
    }
  };

  let sessionObject = {};
  sessionObject.queueName = queueName;

  callResponse = xmlBuilder
  .create(redirectResponse, { encoding: "utf-8" })
  .end({ pretty: true });

  redisClient.hmset(sessionID, sessionObject);
  res.status(200).send(callResponse);
});

module.exports = dtmfDigitsHandler;