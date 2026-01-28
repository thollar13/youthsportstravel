// Venue routes
const getVenues = require("./venues/getVenues");
const getVenue = require("./venues/getVenue");
const addVenue = require("./venues/addVenue");
const updateVenue = require("./venues/updateVenue");
const generateVenueContent = require("./venues/generateContent");
const getRestaurantsByVenue = require("./venues/getRestaurantsByVenue");
const getTipsByVenue = require("./venues/getTipsByVenue");
const getFaqsByVenue = require("./venues/getFaqsByVenue");

// Hotel routes
const getHotels = require("./hotels/getHotels");
const getHotel = require("./hotels/getHotel");
const getHotelsByVenue = require("./hotels/getHotelsByVenue");
const addHotel = require("./hotels/addHotel");
const updateHotel = require("./hotels/updateHotel");
const deleteHotel = require("./hotels/deleteHotel");
const searchNearbyHotels = require("./hotels/searchNearby");

// Tournament routes
const getTournaments = require("./tournaments/getTournaments");
const getTournament = require("./tournaments/getTournament");
const getTournamentsByVenue = require("./tournaments/getTournamentsByVenue");
const addTournament = require("./tournaments/addTournament");
const updateTournament = require("./tournaments/updateTournament");
const deleteTournament = require("./tournaments/deleteTournament");
const scrapeAll = require("./tournaments/scrape");
const scrapePerfectGame = require("./tournaments/scrapePerfectGame");

module.exports = (app) => {
    // Venue routes
    app.get("/api/venues", getVenues);
    app.get("/api/venues/:id", getVenue);
    app.post("/api/venues", addVenue);
    app.put("/api/venues/:id", updateVenue);

    // Venue content generation
    app.post("/api/venues/:venueId/generate-content", generateVenueContent);
    app.post("/api/venues/generate-content", generateVenueContent);

    // Venue sub-resources
    app.get("/api/venues/:venueId/hotels", getHotelsByVenue);
    app.get("/api/venues/:venueId/restaurants", getRestaurantsByVenue);
    app.get("/api/venues/:venueId/tips", getTipsByVenue);
    app.get("/api/venues/:venueId/faqs", getFaqsByVenue);
    app.get("/api/venues/:venueId/tournaments", getTournamentsByVenue);

    // Hotel routes
    app.get("/api/hotels/search-nearby", searchNearbyHotels);
    app.get("/api/hotels", getHotels);
    app.get("/api/hotels/:id", getHotel);
    app.post("/api/hotels", addHotel);
    app.put("/api/hotels/:id", updateHotel);
    app.delete("/api/hotels/:id", deleteHotel);

    // Tournament routes
    app.get("/api/tournaments", getTournaments);
    app.get("/api/tournaments/:id", getTournament);
    app.post("/api/tournaments", addTournament);
    app.put("/api/tournaments/:id", updateTournament);
    app.delete("/api/tournaments/:id", deleteTournament);
    app.post("/api/tournaments/scrape", scrapeAll);
    app.post("/api/tournaments/scrape-perfect-game", scrapePerfectGame);
};