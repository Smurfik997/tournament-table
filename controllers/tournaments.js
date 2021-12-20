const sequelize = require('../middleware/database.js');

const Tournament = require('../models/tournament.js');
const TournamentMember = require('../models/tournament_member.js');
const TournamentMatchup = require('../models/tournament_matchup.js');
const { getTeamByID } = require('./team.js');
const PAGE_RECORDS_LIMIT = 10;

const getTournamentByID = async (req) => {
    if (req.user) {
        return await Tournament.findOne({ where: { manager_id: req.user.id, id: req.params.tournament_id } });
    } else {
        return await Tournament.findOne(
            { where: { visible: 1, id: req.params.tournament_id }, attributes: { exclude: ['visible'] } }
        );
    }
};

const getTournamentInfo = async (req, res) => {
    try {
        const tournament = await getTournamentByID(req);

        if (tournament) {
            res.status(200).json({ tournament });
        } else {
            res.status(404).json({ error: 'tournament not found' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
}

const getAllTournaments = async (req, res) => {
    const page_id = parseInt(req.params.page_id || 1);
    if (Number.isNaN(page_id) || page_id < 1) {
        res.status(400).json({ error: 'invalid page number' });
        return;
    }
    const offset = (page_id - 1) * PAGE_RECORDS_LIMIT;

    try {
        const tournaments = req.user? await Tournament.findAll(
            { where: { manager_id: req.user.id }, offset, limit: PAGE_RECORDS_LIMIT }
        ) : await Tournament.findAll(
            { where: { visible: 1 }, offset, limit: PAGE_RECORDS_LIMIT, attributes: { exclude: ['visible'] } }
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

const getTournamentMembers = async (req, res) => {
    try {
        const tournament = await getTournamentByID(req);

        if (!tournament) {
            res.status(404).json({ error: 'tournament not found' });
            return;
        }

        const tournament_members = await TournamentMember.findAll({ 
            where: { tournament_id: req.params.tournament_id }, attributes: ['team_id'] }
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
        const tournament = await getTournamentByID(req);

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

const createTournament = async (req, res) => {
    const { name, date_start, date_end, member_ids } = req.body;

    if (!name || !date_start || !date_end || !member_ids) {
        res.status(400).json({ error: 'name, date_start, date_end, member_ids fields are requiered' });
        return await transaction.rollback();
    }

    const transaction = await sequelize.transaction();

    try {
        const existing_tournament = await Tournament.findOne({ where: { name } });

        if (existing_tournament) {
            res.status(400).json({ error: 'name of tournament must be unique' });
            return await transaction.rollback();
        }

        const tournament = await Tournament.create(
            { name, date_start, date_end, manager_id: req.user.id }, { transaction }
        );

        for (const team_id of member_ids) {
            const team = await getTeamByID({ params: { id: team_id } });

            if (!team) {
                res.status(400).json({ error: 'invalid member_ids'});
                return await transaction.rollback();
            }

            await TournamentMember.create({ tournament_id: tournament.id, team_id }, { transaction });
        }

        await transaction.commit();

        res.status(201).json({ tournament });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error });
    }
};

const deleteTournament = async (req, res) => {
    const tournament_id = req.params.tournament_id;
    const transaction = await sequelize.transaction();

    try {
        const existing_tournament = await getTournamentByID(req);

        if (!existing_tournament) {
            res.status(404).json({ error: 'tournament not found' });
            return await transaction.rollback();
        }

        await TournamentMember.destroy({ where: { tournament_id }, transaction });
        await TournamentMatchup.destroy({ where: { tournament_id }, transaction });
        await existing_tournament.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ team: { id: tournament_id } });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error });
    }
};

module.exports = { 
    getAllTournaments, getTournamentInfo, getTournamentMembers, getTournamentMatchups,
    createTournament, deleteTournament
 };