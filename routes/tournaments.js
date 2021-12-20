const router = require('express').Router();

const { 
    getAllTournaments, getTournamentInfo, getTournamentMembers, getTournamentMatchups, createTournament, deleteTournament
} = require('../controllers/tournaments.js');
const authenticate = require('../middleware/authentication.js');

router.get('/', getAllTournaments);
router.get('/:page_id', getAllTournaments);
router.get('/id/:tournament_id', getTournamentInfo);
router.get('/id/:tournament_id/members', getTournamentMembers);
router.get('/id/:tournament_id/matchups', getTournamentMatchups);

router.post('/create', authenticate, createTournament);
router.delete('/delete/:tournament_id', authenticate, deleteTournament);

module.exports = router;