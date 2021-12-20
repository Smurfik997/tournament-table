const { DataTypes, Deferrable } = require('sequelize');
const sequelize = require('../middleware/database.js');

const User = require('./user.js');
const Team = require('./team.js');

const TeamMember = sequelize.define('team_members', {
  	user_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		allowNull: false,
		references: {
			model: User,
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

module.exports = TeamMember;