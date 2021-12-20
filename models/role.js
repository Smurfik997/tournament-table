const { DataTypes } = require('sequelize');
const sequelize = require('../middleware/database.js');

const Role = sequelize.define('roles', {
  	id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
  	}, role_name: {
		type: DataTypes.STRING(255),
		allowNull: false,
		unique: true,
		validate: {
			isAlpha: true
		}
  	}
}, {
	timestamps: false
});

module.exports = Role;