const sequelize = require('../middleware/database.js');

const { ValidationError } = require('sequelize');
const { Tournament, TournamentMember, TournamentMatchup } = require('../models/main.js');

const { getTeamByID } = require('./team.js');
const PAGE_RECORDS_LIMIT = 10;

const getTournamentByID = async (req) => {
    if (req.user) {
        if (!req.admin || !req.user.admin) {
            return await Tournament.findOne(
                { where: { id: req.params.tournament_id, manager_id: req.user.id } }
            );
        } else {
            return await Tournament.findOne({ where: { id: req.params.tournament_id } });
        }
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
        let where = {};
        let attributes;

        if (req.user) {
            if (!req.admin || !req.user.admin) {
                where.manager_id = req.user.id;
            }

            where.visible = req.visible != undefined? req.visible : 1;
        } else {
            where.visible = 1;
            attributes = { exclude: ['visible'] };
        }

        const tournaments = await Tournament.findAll({ where, attributes, offset, limit: PAGE_RECORDS_LIMIT });
        
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

        const tournament_members = await tournament.getMembers({ attributes: ['team_id'] });

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
    try {
        const tournament = await getTournamentByID(req);

        if (!tournament) {
            res.status(404).json({ error: 'tournament not found' });
            return;
        }

        const tournament_matchups = await tournament.getMatchups(
            { attributes: { exclude: ['tournament_id'] } }
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
        return;
    }

    if (!(member_ids.length > 1) || !Number.isInteger(Math.log2(member_ids.length)))  {
        res.status(400).json({ error: 'member_ids count (n) must be power of 2 (2 ^ m = n)' });
        return;
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
        if (error instanceof ValidationError) {
            res.status(400).json({ error: 'invalid request data' });
        } else {
            res.status(500).json({ error });
        }
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

        await existing_tournament.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({ team: { id: tournament_id } });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error });
    }
};

const acceptTournamentRequest = async (req, res) => {
    if (!req.user.admin) {
        res.status(404).json({ error: 'page not found' });
        return;
    }
    
    try {
        const tournament = await getTournamentByID(req);

        if (!tournament) {
            res.status(404).json({ error: 'tournament not found' });
            return;
        }

        if (tournament.visible) {
            res.status(200).json({ error: 'tournament is already active' });
            return;
        }

        await tournament.update({ visible: 1 });

        res.status(200).json({ tournament });
    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = { 
    getAllTournaments, getTournamentInfo, getTournamentMembers, getTournamentMatchups,
    createTournament, deleteTournament, acceptTournamentRequest, getTournamentByID
 };