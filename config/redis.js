import { createClient } from "redis";

const redisClient = createClient({
  username:"default",
  password:process.env.REDIS_PASSWORD,
  socket:{
    host:process.env.REDIS_URL,
    port: 11727
    
  }

});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;
