const sequelize = require('../middleware/database.js');
const PAGE_RECORDS_LIMIT = 10;

const { Team, TeamMember, TournamentMember } = require('../models/main.js');

const getTeamByID = async (req) => {
    if (req.user) {
        if (!req.admin || !req.user.admin) {
            return await Team.findOne({ where: { id: req.params.id, manager_id: req.user.id } });
        } else {
            return await Team.findOne({ where: { id: req.params.id } });
        }
    } else {
        return await Team.findOne(
            { where: { id: req.params.id, visible: 1 }, attributes: { exclude: ['visible'] } }
        );
    }
}

const viewTeamProfile = async (req, res) => {
    try {
        const team = await getTeamByID(req);

        if (team) {
            res.status(200).json({ team });
        } else {
            res.status(404).json({ error: 'team not found' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
};

const getAllTeams = async (req, res) => {
    const page_id = parseInt(req.params.page_id || 1);
    if (Number.isNaN(page_id) || page_id < 1) {
        res.status(400).json({ error: 'invalid page number' });
        return;
    }
    const offset = (page_id - 1) * PAGE_RECORDS_LIMIT;

    try {
        let where = {};

        if (req.user) {
            if (!req.admin || !req.user.admin) {
                where.manager_id = req.user.id;
            }

            where.visible = req.visible != undefined? req.visible : 1;
        } else {
            where.visible = 1;
            where.attributes = { exclude: ['visible'] };
        }

        const teams = await Team.findAll({ where, offset, limit: PAGE_RECORDS_LIMIT });

        if (teams) {
            res.status(200).json({ teams });
        } else {
            res.status(404).json({ error: 'page is empty' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
};

const getTeamMembers = async (req, res) => {
    try {
        const team = await getTeamByID(req);

        if (!team) {
            res.status(404).json({ error: 'team not found' });
            return;
        }

        const team_members = await team.getMembers({ attributes: ['user_id'] });

        if (team_members) {
            res.status(200).json({ team_members });
        } else {
            res.status(404).json({ error: 'team don\'t have members' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
};

const createTeam = async (req, res) => {
    const { team_name, member_ids } = req.body;

    if (!team_name || !member_ids) {
        res.status(400).json({ error: 'team_name, member_ids fields are requiered' });
        return;
    }

    const transaction = await sequelize.transaction();

    try {
        const existing_team = await Team.findOne({ where: { team_name } });

        if (existing_team) {
            res.status(400).json({ error: 'name of team must be unique' });
            return await transaction.rollback();
        }

        const team = await Team.create({ team_name, manager_id: req.user.id }, { transaction });

        for (const user_id of member_ids) {
            await TeamMember.create({ team_id: team.id, user_id }, { transaction });
        }

        await transaction.commit();

        res.status(201).json({ team: { id: team.id } });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error });
    }
};

const deleteTeam = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const existing_team = await getTeamByID(req);

        if (!existing_team) {
            res.status(404).json({ error: 'team not found' });
            return await transaction.rollback();
        }

        if (!await TournamentMember.findAll({ where: { team_id: req.params.id } })) {
            res.status(400).json({ error: 'team is member of tournaments' });
            return await transaction.rollback();
        }

        await existing_team.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({ team: { id: req.params.id } });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error });
    }
};

module.exports = { viewTeamProfile, getTeamMembers, createTeam, deleteTeam, getAllTeams, getTeamByID };