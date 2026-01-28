const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;
    const {
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
        status,
        director_name,
        director_email,
        director_phone,
        gate_admission,
        stay_to_play,
        description,
    } = req.body;

    // Validate status if provided
    if (status) {
        const validStatuses = ["upcoming", "open", "full", "in_progress", "completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `status must be one of: ${validStatuses.join(", ")}`,
            });
        }
    }

    try {
        const result = await pool.query(`
            UPDATE tournaments SET
                name = COALESCE($1, name),
                start_date = COALESCE($2, start_date),
                end_date = COALESCE($3, end_date),
                age_groups = COALESCE($4, age_groups),
                entry_fee = COALESCE($5, entry_fee),
                format = COALESCE($6, format),
                teams_registered = COALESCE($7, teams_registered),
                max_teams = COALESCE($8, max_teams),
                registration_url = COALESCE($9, registration_url),
                registration_deadline = COALESCE($10, registration_deadline),
                status = COALESCE($11, status),
                director_name = COALESCE($12, director_name),
                director_email = COALESCE($13, director_email),
                director_phone = COALESCE($14, director_phone),
                gate_admission = COALESCE($15, gate_admission),
                stay_to_play = COALESCE($16, stay_to_play),
                description = COALESCE($17, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $18
            RETURNING *
        `, [
            name || null,
            start_date || null,
            end_date || null,
            age_groups || null,
            entry_fee || null,
            format || null,
            teams_registered || null,
            max_teams || null,
            registration_url || null,
            registration_deadline || null,
            status || null,
            director_name || null,
            director_email || null,
            director_phone || null,
            gate_admission || null,
            stay_to_play !== undefined ? stay_to_play : null,
            description || null,
            id,
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.json({
            message: "Tournament updated",
            tournament: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating tournament:", error);
        res.status(500).json({ message: "Server error" });
    }
};