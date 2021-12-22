const Role = require('./role.js');
const TeamMember = require('./team_member.js');
const Team = require('./team.js');
const TournamentMatchup = require('./tournament_matchup.js');
const TournamentMember = require('./tournament_member.js');
const Tournament = require('./tournament.js');
const UserRole = require('./user_role.js');
const User = require('./user.js');

User.hasOne(UserRole, {
    as: 'role', sourceKey: 'id', foreignKey: 'user_id', onDelete: 'cascade'
});

Tournament.hasMany(TournamentMember, { 
    as: 'members', sourceKey: 'id', foreignKey: 'tournament_id', onDelete: 'cascade', hooks: true
});
Tournament.hasMany(TournamentMatchup, { 
    as: 'matchups', sourceKey: 'id', foreignKey: 'tournament_id', onDelete: 'cascade', hooks: true
});

Team.hasMany(TeamMember, { 
    as: 'members', sourceKey: 'id', foreignKey: 'team_id', onDelete: 'cascade', hooks: true
});

module.exports = { 
    Role, TeamMember, Team, TournamentMatchup, TournamentMember, Tournament, UserRole, User
}