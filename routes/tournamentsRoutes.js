const router = require('express').Router();

const { 
    getAllTournaments, getTournamentByID, getTournamentMembers, getTournamentMatchups
} = require('../controllers/tournaments.js');

router.get('/', getAllTournaments);
router.get('/:page_id', getAllTournaments);
router.get('/id/:tournament_id', getTournamentByID);
router.get('/id/:tournament_id/members', getTournamentMembers);
router.get('/id/:tournament_id/matchups', getTournamentMatchups);

module.exports = router;