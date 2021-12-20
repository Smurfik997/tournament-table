const { DataTypes } = require('sequelize');
const sequelize = require('../middleware/database.js');

const Tournament = sequelize.define('tournaments', {
  	id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
  	}, name: {
		type: DataTypes.STRING(255),
		allowNull: false,
		unique: true
  	}, date_start: {
		type: DataTypes.DATE,
		allowNull: false
  	}, date_end: {
		type: DataTypes.DATE,
		allowNull: false
  	}, visible: {
		type: DataTypes.TINYINT(1),
		allowNull: false,
        defaultValue: 0
  	}
}, {
	timestamps: false
});

module.exports = Tournament;