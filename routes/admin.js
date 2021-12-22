const router = require('express').Router();

const { acceptTournamentRequest, deleteTournament } = require('../controllers/tournaments.js');
const { acceptTeamRequest, deleteTeam } = require('../controllers/team.js');

const authenticate = require('../middleware/authentication.js');

const tournamentRoutes = require('./tournaments.js');
const teamRoutes = require('./team.js');
const teamsRoutes = require('./teams.js');

router.use('/tournaments', authenticate, tournamentRoutes);
router.post('/tournaments/accept/:tournament_id', authenticate, acceptTournamentRequest);
router.delete('/tournaments/delete/:tournament_id', authenticate, deleteTournament);

router.use('/team', authenticate, teamRoutes);
router.post('/team/accept/:id', authenticate, acceptTeamRequest);
router.delete('/team/delete/:id', authenticate, deleteTeam);

router.use('/teams', authenticate, teamsRoutes);

module.exports = router;