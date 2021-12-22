const router = require('express').Router();

const { signin, signup, getUserFullName } = require('../controllers/user.js');
const { createTournament, deleteTournament } = require('../controllers/tournaments.js');
const { createTeam, deleteTeam } = require('../controllers/team.js');

const authenticate = require('../middleware/authentication.js');

const tournamentRoutes = require('./tournaments.js');
const teamRoutes = require('./team.js');
const teamsRoutes = require('./teams.js');
const requestsRoutes = require('./requests.js');

router.post('/signin', signin);
router.post('/signup', signup);

router.get('/id/:id', getUserFullName);

router.use('/tournaments', authenticate, tournamentRoutes);
router.post('/tournaments/create', authenticate, createTournament);
router.delete('/tournaments/delete/:tournament_id', authenticate, deleteTournament);

router.use('/team', authenticate, teamRoutes);
router.post('/team/create', authenticate, createTeam);
router.delete('/team/delete/:id', authenticate, deleteTeam);

router.use('/teams', authenticate, teamsRoutes);

router.use('/requests', (req, res, next) => { req.visible = 0; next(); }, requestsRoutes);

module.exports = router;