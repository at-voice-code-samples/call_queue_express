const redis = require("redis");

const getRedisHost = () => {
  return process.env.NODE_ENV == "production"
    ? process.env.REDIS_HOST
    : "127.0.0.1";
};

const redisOptions = {
  host: getRedisHost(),
  db: 0,
  port: 6379
};

const {promisify} = require('util');
let localRedisClient = redis.createClient(redisOptions);
const hgetallAsync = promisify(localRedisClient.hgetall).bind(localRedisClient);



const redisClient = redis.createClient(redisOptions);

module.exports = {
    redisClient,
    hgetallAsync
};