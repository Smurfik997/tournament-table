const router = require('express').Router();

const { 
    getAllTournaments, getTournamentInfo, getTournamentMembers, getTournamentMatchups
} = require('../controllers/tournaments.js');
const { addMatchupOnFirstStage, setWinner, updateMatchupDate } = require('../controllers/matchups.js');

router.get('/', getAllTournaments);
router.get('/:page_id', getAllTournaments);
router.get('/id/:tournament_id', getTournamentInfo);
router.get('/id/:tournament_id/members', getTournamentMembers);
router.get('/id/:tournament_id/matchups', getTournamentMatchups);
router.post('/id/:tournament_id/matchups/addToFirstStage', addMatchupOnFirstStage);
router.put('/id/:tournament_id/matchups/setWinner', setWinner);
router.put('/id/:tournament_id/matchups/updateDate', updateMatchupDate);

module.exports = router;