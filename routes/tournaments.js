const router = require('express').Router();

const { 
    getAllTournaments, getTournamentInfo, getTournamentMembers, getTournamentMatchups
} = require('../controllers/tournaments.js');

router.get('/', getAllTournaments);
router.get('/:page_id', getAllTournaments);
router.get('/id/:tournament_id', getTournamentInfo);
router.get('/id/:tournament_id/members', getTournamentMembers);
router.get('/id/:tournament_id/matchups', getTournamentMatchups);

module.exports = router;