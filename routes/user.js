const router = require('express').Router();

const { signin, signup } = require('../controllers/user.js');
const authenticate = require('../middleware/authentication.js');

const tournamentRoutes = require('./tournaments.js');
const teamRoutes = require('./team.js');
const teamsRoutes = require('./teams.js');

router.post('/signin', signin);
router.post('/signup', signup);
router.use('/tournaments', authenticate, tournamentRoutes);
router.use('/team', authenticate, teamRoutes);
router.use('/teams', authenticate, teamsRoutes);

module.exports = router;