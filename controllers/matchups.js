const TournamentMatchup = require('../models/tournament_matchup.js');
const { getTournamentByID } = require('./tournaments.js');
const { Op, ValidationError } = require('sequelize');
const sequelize = require('../middleware/database.js');

const updateMatchupDate = async (req, res) => {
    const { matchup_id, date } = req.body;

    if (!matchup_id || !date) {
        res.status(400).json({ error: 'matchup_id, date fields are requiered' });
        return;
    }

    try {
        const tournament = await getTournamentByID(req);

        if (!tournament || (tournament.visible == 0)) {
            res.status(404).json({ error: 'tournament not found' });
            return;
        }

        const matchup = (await tournament.getMatchups({ where: { id: matchup_id } }))[0];

        if (!matchup) {
            res.status(404).json({ error: 'matchup not found' });
            return;
        }

        await matchup.update({ date });

        res.status(200).json({ matchup });
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: 'invalid request data' });
        } else {
            res.status(500).json({ error });
        }
    }
};

const setWinner = async (req, res) => {
    const { team1_score, team2_score, matchup_id } = req.body;

    if (!team1_score || !team2_score || !matchup_id) {
        res.status(400).json({ error: 'team1_score, team2_score, matchup_id fields are requiered' });
        return;
    }

    const transaction = await sequelize.transaction();

    try {
        const tournament = await getTournamentByID(req);

        if (!tournament || (tournament.visible == 0)) {
            res.status(404).json({ error: 'tournament not found' });
            return await transaction.rollback();
        }

        const matchup = (await tournament.getMatchups({ where: { id: matchup_id } }))[0];
        
        if (!matchup) {
            res.status(404).json({ error: 'matchup not found' });
            return await transaction.rollback();
        }
        
        const matchupsCount = (await tournament.getMatchups({ where: { stage: matchup.stage } })).length;

        if (!matchup.team1_id || !matchup.team2_id) {
            res.status(400).json({ error: 'matchup team1_id or team2_id is undefined' });
            return await transaction.rollback();
        }

        if (matchup.winner) {
            res.status(400).json({ error: 'matchup has already a winner' });
            return await transaction.rollback();
        }

        const winner = team1_score > team2_score? matchup.team1_id : matchup.team2_id;
        const new_matchup = await matchup.update({ team1_score, team2_score, winner }, { transaction });
        
        if (matchupsCount == 1) {
            await transaction.commit();
            return res.status(200).json({ matchup: new_matchup });
        }

        const order_position = Math.floor((matchup.order_position - 1) / 2) + 1;
        const team_index = (matchup.order_position - 1) % 2 + 1;
        const next_matchup = (await tournament.getMatchups(
            { where: { stage: matchup.stage + 1, order_position } }
        ))[0];

        if (next_matchup) {
            const winner_team = {};
            winner_team[`team${team_index}_id`] = winner;
            console.log(winner_team);
            const new_matchup = await next_matchup.update(winner_team, { transaction });
            await transaction.commit();
            return res.status(200).json({ matchup: new_matchup });
        } else {
            const winner_team = { tournament_id: tournament.id, stage: matchup.stage + 1, order_position };
            winner_team[`team${team_index}_id`] = winner;
            const new_matchup = await TournamentMatchup.create(winner_team, { transaction });
            await transaction.commit();
            return res.status(201).json({ matchup: new_matchup });
        }
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            res.status(400).json({ error: 'invalid request data' });
        } else {
            res.status(500).json({ error });
        }
    }
}

const addMatchupOnFirstStage = async (req, res) => {
    const { team1_id, team2_id, date, order_position } = req.body;

    if (!team1_id || !team2_id || !date || !order_position) {
        res.status(400).json({ error: 'team1_id, team2_id, date, order_position fields are requiered' });
        return;
    }

    try {
        const tournament = await getTournamentByID(req);

        if (!tournament || (tournament.visible == 0)) {
            res.status(404).json({ error: 'tournament not found' });
            return;
        }

        const membersCount = (await tournament.getMembers()).length;

        if (order_position > membersCount / 2 || 0 >= order_position) {
            res.status(400).json(
                { error: `order position must be between 1 and ${membersCount / 2}` });
            return;
        };

        const members = await tournament.getMembers({ where: { team_id: [team1_id, team2_id] } });

        if (members.length != 2) {
            res.status(404).json({ error: 'team1_id or/and team2_id is not a member of tournament' });
            return;
        }

        const existing_matchups = await tournament.getMatchups(
            { where: { [Op.or]: [
                { [Op.or]: [ { team1_id: [team1_id, team2_id] } , { order_position } ], stage: 1 },
                { [Op.or]: [ { team2_id: [team1_id, team2_id] } , { order_position } ], stage: 1 },
            ] } }
        );

        if (existing_matchups?.length > 0) {
            res.status(400).json(
                { error: 'team1_id or/and team2_id is already at this stage or/and order position' }
            );
            return;
        }

        const matchup = await TournamentMatchup.create(
            { tournament_id: tournament.id, team1_id, team2_id, stage: 1, order_position, date }
        );

        res.json({ matchup });
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: 'invalid request data' });
        } else {
            res.status(500).json({ error });
        }
    }
};

module.exports = { addMatchupOnFirstStage, setWinner, updateMatchupDate };