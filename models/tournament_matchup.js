const { DataTypes } = require('sequelize');
const sequelize = require('../middleware/database.js');

const Tournament = require('./tournament.js');
const Team = require('./team.js');

const TournamentMatchup = sequelize.define('tournament_matchups', {
  	id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
  	}, tournament_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		allowNull: false,
		references: {
			model: Tournament,
			key: 'id'
		}
  	}, team1_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		references: {
			model: Team,
			key: 'team_id'
		}
  	}, team2_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		references: {
			model: Team,
			key: 'team_id'
		}
  	}, stage: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false
    }, order_position: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false
    }, date: {
        type: DataTypes.DATE,
		validate: {
			isDate: true
		}
    }, team1_score: {
        type: DataTypes.INTEGER(10).UNSIGNED,
		validate: {
			isInt: true
		}
    }, team2_score: {
        type: DataTypes.INTEGER(10).UNSIGNED,
		validate: {
			isInt: true
		}
    }, winner: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		references: {
			model: Team,
			key: 'team_id'
		}
  	}
}, {
	timestamps: false
});

module.exports = TournamentMatchup;