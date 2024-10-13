import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import connectDB from "./utils/db.js";
import userRoute from "./routes/user_route.js"
dotenv.config({});

const PORT = process.env.PORT || 3000;

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'https://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);


//route
app.get('/', (req, res) => {  
  return res.status(200).json({
    message: "chal rha h",
  });
});

app.listen(PORT, () => {
    connectDB();
  console.log(`Server started at PORT: ${PORT}`);
});