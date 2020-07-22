const path = require("path");
const express = require("express");
const connectDB = require("./config/db");
const colors = require("colors");

// Load env vars (Very important! to place it before any thing that will use an environment variable)
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// Middleware files
// const logger = require("./middleware/logger"); // custom logger
const morgan = require("morgan");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

// --------- App running -----------
const app = express();
connectDB();
// --------- Calling Middleware Functions -----------
// --- 1. Functionality---
// Use body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());
// Dev logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// File uploading
app.use(fileupload());

// --- 2. API Security ---
// Sanitize user input in (req.body; req.params; req.query)
app.use(mongoSanitize());
// Set security headers
app.use(helmet());
// Prevent XSS attacks
app.use(xss()); // for example, prevent <script> to be added, by changing it to &lt;
// Rate Limit (100 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);
// Prevent http param pollution
app.use(hpp());
// Enable CORS (shared back end, crosss origin)
app.use(cors());

// --------- Route Handling -----------
// Set static folder
app.use(express.static(path.join(__dirname, "public")));
// Get routes defined
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
// Error handler
app.use(errorHandler);
// Listening to the port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${PORT}!`.yellow.bold
  );
});
// Handle unhandle promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close server and exit process
  server.close(() => process.exit(1));
});
