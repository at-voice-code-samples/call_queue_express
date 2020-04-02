const Queue = require("bull");
const voiceServiceQueue = Queue('voice_service_queue', `${process.env.REDIS_CONN_STRING}`);

module.exports = voiceServiceQueue;