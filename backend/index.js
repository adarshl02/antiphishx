import express from "express";
import morgan from "morgan";
import cors from "cors";
import logger from "./libs/logger.js";
import textRoutes from "./routes/text.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

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

app.use("/", (req, res) => {
  res.status(200).json("Welcome To AntiPhishX");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/text", textRoutes);


app.use((req, res, next) => {
  logger.warn(`Unhandled route: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});





process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGUSR2", () => shutdown("SIGUSR2"));

// local run
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
  logger.info("Welcome To Auth Service");
  logger.info(`AntiPhishX Listening On Port ${PORT}`);
  logger.info("MORGAN ENABLED");
});
}
export default app;

