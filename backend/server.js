require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { initTournamentJobs, scrapeAllVenues } = require('./jobs/scrapeTournaments');

app.use(cors());
app.use(express.json());

// Test route directly in server.js
app.get("/test", (req, res) => {
    res.json({ message: "Server is working" });
});

app.use('/api/tournaments/scrape', (req, res, next) => {
    req.setTimeout(0);
    res.setTimeout(0);
    next();
});

// Load routes
console.log("Loading routes...");
require("./routes")(app);
console.log("Routes loaded");

initTournamentJobs();

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});