const { DataTypes, Deferrable } = require('sequelize');
const sequelize = require('../middleware/database.js');

const User = require('./user.js');
const Role = require('./role.js');

const UserRole = sequelize.define('user_roles', {
  	user_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		allowNull: false,
		references: {
			model: User,
			key: 'id'
		}
  	}, role_id: {
		type: DataTypes.INTEGER(10).UNSIGNED,
		primaryKey: true,
		allowNull: false,
		references: {
			model: Role,
			key: 'id'
		}
  	}
}, {
	timestamps: false
});

module.exports = UserRole;