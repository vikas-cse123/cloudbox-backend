import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import { spawn } from "child_process";
import crypto from "crypto"

await connectDB();

const PORT = process.env.PORT || 4000;
const app = express()


app.set("trust proxy", 1);
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const whitelist = [process.env.CLIENT_URL1,process.env.CLIENT_URL2]
app.use(
  cors({
    origin: function(origin,callback){
      if(whitelist.indexOf(origin) !== -1 || !origin){
        callback(null,true)
      }else{
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
);

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/subscriptions", checkAuth, subscriptionRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);





app.get("/",(req,res) => {
  res.end("vikas sahni 1")

})

app.get("/vikas",(req,res) => {
  res.end("I am Vikas.")
})
app.get("/error",() =>{
  console.log("process exit with error ");
  process.exit(1)
})


app.post("/github-webhook",(req,res) => {
  console.log("github webhook started");
  const signature = req.headers["x-hub-signature-256"]
  console.log({signature});
  const hmac = crypto.createHmac("sha256",process.env.GITHUB_WEBHOOK_SECRET)
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex")
  console.log({signature,digest});
  if(signature !== digest){
    return res.status(401).send("Invalid Signature")
  }
  res.json({message:"ok"})
  console.log(req.body.repository.name);
  const script = req.body.repository.name === "cloudbox-frontend" ? "deploy-frontend.sh" : "deploy-backend.sh"
  console.log({script});
  const bashChildProcess = spawn("bash", [`/home/ubuntu/${script}`]);


bashChildProcess.stdout.on("data", (data) => {
  process.stdout.write(data);
});

bashChildProcess.stderr.on("data", (data) => {
  process.stderr.write(data);
});

bashChildProcess.on("close", (code) => {
  if (code === 0) {
    console.log("Script executed successfully");
  } else {
    console.log("Script failed");
  }
});

bashChildProcess.on("error", (err) => {
    res.json({message:"ok"})
  console.log("Error in spawning the process");
  console.log(err);
});
})
app.use((err, req, res, next) => {
  res.status(err.status||500).json({error:"Something went wrong!"})
});

app.listen(PORT, () => {
  console.log(`Server Started`);
});

