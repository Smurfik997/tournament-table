const sequelize = require('../middleware/database.js');

const Tournament = require('../models/tournament.js');
const TournamentMember = require('../models/tournament_member.js');
const TournamentMatchup = require('../models/tournament_matchup.js');
const PAGE_RECORDS_LIMIT = 10;

const getAllTournaments = async (req, res) => {
    const page_id = parseInt(req.params.page_id || 1);
    if (Number.isNaN(page_id) || page_id < 1) {
        res.status(400).json({ error: 'invalid page number' });
        return;
    }
    const offset = (page_id - 1) * PAGE_RECORDS_LIMIT;

    try {
        const tournaments = await Tournament.findAll(
            { where: { visible: 1 }, offset, limit: PAGE_RECORDS_LIMIT }
        );
        
        if (tournaments) {
            res.status(200).json({ tournaments });
        } else {
            res.status(404).json({ error: 'page is empty' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
};

const getTournamentByID = async (req, res) => {
    try {
        const tournament = await Tournament.findOne({ where: { visible: 1, id: req.params.tournament_id } });

        if (tournament) {
            res.status(200).json({ tournament });
        } else {
            res.status(404).json({ error: 'tournament not found' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
};

const getTournamentMembers = async (req, res) => {
    const tournament_id = req.params.tournament_id;

    try {
        const tournament = await Tournament.findOne({ where: { visible: 1, id: tournament_id } });

        if (!tournament) {
            res.status(404).json({ error: 'tournament not found' });
            return;
        }

        const tournament_members = await TournamentMember.findAll({ 
            where: { tournament_id }, attributes: ['team_id'] }
        );
        if (tournament_members) {
            res.status(200).json({ tournament_members });
        } else {
            res.status(404).json({ error: 'tournament don\'t have members' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
}

const getTournamentMatchups = async (req, res) => {
    const tournament_id = req.params.tournament_id;

    try {
        const tournament = await Tournament.findOne({ where: { visible: 1, id: tournament_id } });

        if (!tournament) {
            res.status(404).json({ error: 'tournament not found' });
            return;
        }

        const tournament_matchups = await TournamentMatchup.findAll({ 
            where: { tournament_id }, attributes: { exclude: ['tournament_id'] } }
        );
        if (tournament_matchups) {
            res.status(200).json({ tournament_matchups });
        } else {
            res.status(404).json({ error: 'tournament don\'t have matchups' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
}

module.exports = { getAllTournaments, getTournamentByID, getTournamentMembers, getTournamentMatchups };