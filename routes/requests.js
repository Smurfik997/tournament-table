const router = require('express').Router();

const authenticate = require('../middleware/authentication.js');

const tournamentRoutes = require('./tournaments.js');
const teamsRoutes = require('./teams.js');

router.use('/tournaments', authenticate, tournamentRoutes);
router.use('/teams', authenticate, teamsRoutes);

module.exports = router;