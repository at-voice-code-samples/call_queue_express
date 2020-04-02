const express = require("express");
const inboundCallHandler = express.Router();

const xmlBuilder = require("xmlbuilder");
const voiceQueue = require("../../utils/bull/bull");

const appCreds = require("../../config/credentials");
const { redisClient } = require("../../utils/redis/redis");

inboundCallHandler.post("/", async (req, res, next) => {
  let phoneNumber = req.fields.callerNumber;
  let sessionID = req.fields.sessionId;
  let destinationNumber = req.fields.destinationNumber;

  let callRequest;
  let introPrompt;
  let callResponse;
  switch (destinationNumber) {
    case appCreds.dQNumber:
      //DeQueue Action
      introPrompt = {
        Response: {
          GetDigits: {
            "@numDigits": "1",
            "@finishOnKey": "#",
            "@timeout": "15",
            "@callbackUrl": `${process.env.HOSTNAME}/voice/dtmf`,
            Say: {
              "@voice": "woman",
              "#text":
                "Please select a session to dequeue. Press 1 for agents queue. Press 2 for management queue."
            }
          },
          Say: {
            "@voice": "woman",
            "#text":
              "Sorry we did not catch that. Please callback and try again"
          }
        }
      };
      callResponse = xmlBuilder
        .create(introPrompt, { encoding: "utf-8" })
        .end({ pretty: true });
        callRequest = "dequeue";
      break;
    case appCreds.nQNumber:
      // Enqueue Action
      introPrompt = {
        Response: {
          GetDigits: {
            "@numDigits": "1",
            "@finishOnKey": "#",
            "@timeout": "15",
            "@callbackUrl": `${process.env.HOSTNAME}/voice/dtmf`,
            Say: {
              "@voice": "woman",
              "#text":
                "Welcome to the coolest call center. Press 1 to speak to an agent. Press 2 to speak to the management."
            }
          },
          Say: {
            "@voice": "woman",
            "#text":
              "Sorry we did not catch that. Please callback and try again"
          }
        }
      };
      callResponse = xmlBuilder
        .create(introPrompt, { encoding: "utf-8" })
        .end({ pretty: true });
        callRequest = "enqueue";
      break;
    default:
      // Enqueue by default
      introPrompt = {
        Response: {
          GetDigits: {
            "@numDigits": "1",
            "@finishOnKey": "#",
            "@timeout": "15",
            "@callbackUrl": `${process.env.HOSTNAME}/voice/dtmf`,
            Say: {
              "@voice": "woman",
              "#text":
                "Welcome to the coolest call center. Press 1 to speak to an agent. Press 2 to speak to the management."
            }
          },
          Say: {
            "@voice": "woman",
            "#text":
              "Sorry we did not catch that. Please callback and try again"
          }
        }
      };
      callResponse = xmlBuilder
        .create(introPrompt, { encoding: "utf-8" })
        .end({ pretty: true });
        callRequest = "enqueue";
      break;
  }
  let sessionObject = {};
  sessionObject.phoneNumber = phoneNumber;
  sessionObject.callRequest = callRequest;

  console.log(callResponse);

  console.log(sessionObject);
  redisClient.hmset(sessionID, sessionObject);
  voiceQueue.add(
    { sessionID: sessionID },
    {
      delay: 5 * 60 * 1000,
      removeOnComplete: true
    }
  );
  res.status(200).send(callResponse);
});

module.exports = inboundCallHandler;