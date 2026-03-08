const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const transactionsRouter = require("./routes/transactions");
const budgetRouter = require("./routes/budget");
const dashboardRouter = require("./routes/dashboard");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    // allow credentials if needed
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// mount routers under /api
app.use("/api/transactions", transactionsRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/dashboard", dashboardRouter);
const statementRouter = require("./routes/statement");
app.use("/api/statement", statementRouter);
const uploadRouter = require("./routes/upload");
app.use("/api/upload", uploadRouter);
const chatRouter = require("./routes/chat");
app.use("/api/chat", chatRouter);
const formatterRouter = require("./routes/formatter");
app.use("/api/format-transactions", formatterRouter);

// simple health/root endpoint
app.get('/', (req, res) => {
  res.send('SmartSpend API running');
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});