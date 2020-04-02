const cluster = require("cluster");
const formidableMiddleware = require("express-formidable");
const numCPUs = require("os").cpus().length;

const voiceQueueWorker = require("./utils/bull/bull");

const dtmf = require("./routes/voice/dtmf");
const nQ = require("./routes/voice/enqueue");
const dQ = require("./routes/voice/dequeue");
const inbound = require("./routes/voice/inbound");

const formidableOpts = {
  keepExtensions: true
};

const formidableEvts = [
  {
    event: "error",
    action: function(error) {
      console.log(`An error ocurred ${error} `);
    }
  },
  {
    event: "aborted",
    action: function() {
      console.log(`Upload aborted`);
    }
  }
];

if (cluster.isMaster) {
  console.info(`Master is running as ${process.pid} `);
  console.info(`Creating ${numCPUs} workers`);
  for (let index = 0; index < numCPUs; index++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.id} died due to ${signal} with exit code ${code}`
    );
    console.info("Creating a new worker after death");
    cluster.fork();
  });
  cluster.on("listening", (worker, address) => {
    console.info(
      `Worker ${worker.id} is gossiping on ${address.address}:${address.port}`
    );
  });
  cluster.on("fork", worker => {
    console.info(`Started a new Worker with ID: ${worker.id}`);
  });
  cluster.on("online", worker => {
    console.info(`Worker ${worker.id} is online and ready to process requests`);
  });
  cluster.on("message", (worker, message, handle) => {
    console.info(
      `Message from worker ${worker.id}. Message data ${JSON.stringify(
        message
      )}`
    );
  });

  voiceQueueWorker.on("global:completed", function(jobId, result) {
    console.info(`Job ${jobId} completed! Status: ${result}.`);
    voiceQueueWorker.getJob(jobId).then(function(job){
      job.remove();
    });
  });
  voiceQueueWorker.on("global:failed", function(jobId, error) {
    console.error(`Job ${jobId} Failed! Result: ${error}`);
    voiceQueueWorker.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  voiceQueueWorker.on("global:stalled", function(jobId) {
    console.warn(`Job ${jobId} Crashed`);
    voiceQueueWorker.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  voiceQueueWorker.on("global:removed", function(job) {
    console.info(`Job ${jobId} Removed`);
  });
} else {
  const express = require("express");

  const app = express();


  app.use(
    formidableMiddleware(formidableOpts, formidableEvts)
  );
  app.use('/voice/inbound', inbound);
  app.use('/voice/dequeue', dQ);
  app.use('/voice/enqueue', nQ);
  app.use('/voice/dtmf', dtmf);

  const appPort = 40000;

  voiceQueueWorker.process(async (job, done) => {
    console.info(`Session Handler worker ${job.id} is running`);
    redisClient.del(job.data.sessionID.toString());
    done();
  });

  app.listen(process.env.PORT || appPort, () => {
    console.info("We are up!");
  });
}
