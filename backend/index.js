import express from "express";
import morgan from "morgan";
import cors from "cors";
import logger from "./libs/logger.js";
import textRoutes from "./routes/text.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cookieParser());
const PORT = 8000

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
"https://main.d23ozx05n2u2dk.amplifyapp.com",
"https://www.antiphishx.site"
];


app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));



app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/text", textRoutes);


app.use((req, res, next) => {
  logger.warn(`Unhandled route: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});

app.use("/", (req, res) => {
  res.status(200).json("Welcome To AntiPhishX");
});



process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGUSR2", () => shutdown("SIGUSR2"));

const server = app.listen(PORT, () => {
  logger.info("Welcome To Auth Service");
  logger.info(`AntiPhishX Listening On Port ${PORT}`);
  logger.info("MORGAN ENABLED");
});


async function predictUrl(url) {
  const res = await fetch("http://localhost:8080/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  const data = await res.json();
  return data;
}

const result = await predictUrl("http://www.raci.it/component/user/reset.html");
console.log(result);



function shutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
}

