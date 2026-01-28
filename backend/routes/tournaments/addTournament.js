const pool = require("../../config/db");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
    const {
        venue_id,
        name,
        start_date,
        end_date,
        age_groups,
        entry_fee,
        format,
        teams_registered,
        max_teams,
        registration_url,
        registration_deadline,
        director_name,
        director_email,
        director_phone,
        gate_admission,
        stay_to_play,
        description,
    } = req.body;

    // Validate required fields
    if (!venue_id || !name || !start_date) {
        return res.status(400).json({
            message: "Missing required fields: venue_id, name, start_date",
        });
    }

    // Validate status if provided
    const validStatuses = ["upcoming", "open", "full", "in_progress", "completed"];
    const status = req.body.status || "upcoming";
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: `status must be one of: ${validStatuses.join(", ")}`,
        });
    }

    try {
        const id = uuidv4();

        const query = `
            INSERT INTO tournaments (
                id, venue_id, name, start_date, end_date, age_groups, entry_fee,
                format, teams_registered, max_teams, registration_url,
                registration_deadline, director_name, director_email,
                director_phone, gate_admission, stay_to_play, description, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            )
            RETURNING *
        `;

        const values = [
            id,
            venue_id,
            name,
            start_date,
            end_date || null,
            age_groups || [],
            entry_fee || null,
            format || null,
            teams_registered || null,
            max_teams || null,
            registration_url || null,
            registration_deadline || null,
            director_name || null,
            director_email || null,
            director_phone || null,
            gate_admission || null,
            stay_to_play || false,
            description || null,
            status,
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Tournament created",
            tournament: result.rows[0],
        });
    } catch (error) {
        console.error("Error adding tournament:", error);

        if (error.code === "23503") {
            return res.status(400).json({ message: "Venue not found" });
        }

        res.status(500).json({ message: "Server error" });
    }
};