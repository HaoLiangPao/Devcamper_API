const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load evn vars
dotenv.config({ path: "./config/config.env" });

// Load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");
const Review = require("./models/Review");

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log("Bootcamp data Imported...".green.inverse);
    await Course.create(courses);
    console.log("Courses data Imported...".green.inverse);
    await User.create(users);
    console.log("Users data Imported...".green.inverse);
    await Review.create(reviews);
    console.log("Reviews data Imported...".green.inverse);

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete from DB
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log("Bootcamp data destroyed...".red.inverse);
    await Course.deleteMany();
    console.log("Courses data destroyed...".red.inverse);
    await User.deleteMany();
    console.log("Users data destroyed...".red.inverse);
    await Review.deleteMany();
    console.log("Reviews data destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node  seeder  -i
//  [0]   [1]   [2]
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
