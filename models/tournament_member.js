const { DataTypes } = require('sequelize');
const sequelize = require('../middleware/database.js');

const Team = require('./team.js');
const Tournament = require('./tournament.js');

const TournamentMember = sequelize.define('tournament_members', {
    tournament_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		allowNull: false,
		references: {
			model: Tournament,
			key: 'id'
		}
  	}, team_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		allowNull: false,
		references: {
			model: Team,
			key: 'id'
		}
  	}
}, {
	timestamps: false
});

module.exports = TournamentMember;