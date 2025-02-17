const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis({
  host: "redis-11537.c62.us-east-1-4.ec2.redns.redis-cloud.com",
  port: 11537,
  password:"VqMBtqpACPcdcCozEw7A4hTAbZOdTCms",
});

redis.on("connect", () => console.log("🔗 Connected to Redis"));
redis.on("error", (err) => console.error("Redis Error:", err));

module.exports = redis;
