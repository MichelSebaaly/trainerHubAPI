const sequelize = require("./db.js");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes.js");
const programRoutes = require("./routes/programs.routes.js");
const programSalesRoutes = require("./routes/program-sales.routes.js");
const programRatingsRoutes = require("./routes/program-ratings.routes.js");
const workoutsRoutes = require("./routes/workouts.routes.js");
const workoutExercicesRoutes = require("./routes/workout-exercices.routes.js");
const workoutSetsRoutes = require("./routes/workout-sets.routes.js");
const path = require("path");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/program", programRoutes);
app.use("/api/programSales", programSalesRoutes);
app.use("/api/programRatings", programRatingsRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/workoutExercices", workoutExercicesRoutes);
app.use("/api/workoutSets", workoutSetsRoutes);

sequelize
  .authenticate()
  .then(console.log("connected to database"))
  .then(
    app.listen(PORT, () => {
      console.log(`App Running On Port: ${PORT}`);
    })
  )
  .catch((err) => {
    console.error("Unable to connect to database: ", err);
  });
