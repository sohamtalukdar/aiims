// queue.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({
  host: 'localhost',
  port: 6379
});

// Create separate queues for audio and video
const audioPreprocessingQueue = new Queue('audioPreprocessing', { connection });
const videoPreprocessingQueue = new Queue('videoPreprocessing', { connection });

module.exports = { audioPreprocessingQueue, videoPreprocessingQueue };

