const sequelize = require('../middleware/database.js');
const Team = require('../models/team.js');
const TeamMember = require('../models/team_member.js');

const viewTeamProfile = async (req, res) => {
    const id = req.params.id;

    try {
        const team = await Team.findOne({ where: { id, visible: 1 } });

        if (team) {
            res.status(200).json({ team });
        } else {
            res.status(404).json({ error: 'team not found' });
        }
    } catch(error) {
        res.status(500).json({ error });
    }
};

const getTeamMembers = async (req, res) => {
    const id = req.params.id;

    try {
        const team = await Team.findOne({ where: { id, visible: 1 } });

        if (!team) {
            res.status(404).json({ error: 'team not found' });
            return;
        }

        const team_members = await TeamMember.findAll({ where: { team_id: id }, attributes: ['user_id'] });

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
    const transaction = await sequelize.transaction();

    try {
        const existing_team = await Team.findOne({ where: { team_name } });

        if (existing_team) {
            res.status(400).json({ error: 'name of team must be unique' });
            return;
        }

        const team = await Team.create({ team_name, manager_id: req.user.id }, { transaction });

        for (const user_id of member_ids) {
            await TeamMember.create({ team_id: team.id, user_id }, { transaction });
        }

        await transaction.commit();

        res.status(201).json({ team });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error });
    }
};

module.exports = { viewTeamProfile, getTeamMembers, createTeam };