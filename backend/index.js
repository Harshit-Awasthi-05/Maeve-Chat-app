import express from "express";
import cors from "cors";
import connectDB from "./db/database.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import messageRouter from "./routes/message.route.js";
import userRoutes from "./routes/user.routes.js";
import { app, server } from "./socket/socket.js";
import config from "./config/config.js";
import "./config/passport.js";

const PORT = config.PORT || 3000;

connectDB();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Welcome to the chatbot");
});

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});