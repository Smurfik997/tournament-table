const router = require('express').Router();

const { viewTeamProfile, getTeamMembers } = require('../controllers/team.js');

router.get('/:id', viewTeamProfile);
router.get('/:id/members', getTeamMembers);

module.exports = router;