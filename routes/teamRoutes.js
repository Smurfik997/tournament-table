const router = require('express').Router();

const { viewTeamProfile, getTeamMembers, createTeam } = require('../controllers/team.js');
const authenticate = require('../middleware/authentication.js');

router.get('/:id', viewTeamProfile);
router.get('/:id/members', getTeamMembers);
router.post('/create', authenticate, createTeam);

module.exports = router;