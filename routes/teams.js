const router = require('express').Router();

const { getAllTeams } = require('../controllers/team.js');

router.get('/', getAllTeams);
router.get('/:page_id', getAllTeams);

module.exports = router;