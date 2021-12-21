const { DataTypes } = require('sequelize');
const sequelize = require('../middleware/database.js');

const User = sequelize.define('user', {
  	id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
  	}, username: {
		type: DataTypes.STRING(32),
		allowNull: false,
		unique: true,
		validate: {
			is: /^[a-z]+[a-z_]*[a-z]+$/i
		}
  	}, password_hash: {
		type: DataTypes.CHAR(60),
		allowNull: false,
  	}, first_name: {
		type: DataTypes.STRING(50),
		allowNull: false,
		validate: {
			isAlpha: true
		}
  	}, last_name: {
		type: DataTypes.STRING(50),
		allowNull: false,
		validate: {
			isAlpha: true
		}
  	}
}, {
	timestamps: false
});

module.exports = User;