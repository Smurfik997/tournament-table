const { DataTypes } = require('sequelize');
const sequelize = require('../middleware/database.js');

const User = require('./user.js');

const Team = sequelize.define('teams', {
  	id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
  	}, team_name: {
		type: DataTypes.STRING(255),
		allowNull: false,
		unique: true
  	}, manager_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		allowNull: false,
		references: {
			model: User,
			key: 'id'
		}
  	}, visible: {
		type: DataTypes.TINYINT(1),
		allowNull: false,
        defaultValue: 0
  	}
}, {
	timestamps: false
});

module.exports = Team;