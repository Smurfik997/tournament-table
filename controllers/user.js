const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/user.js');
const UserRole = require('../models/user_role.js');
const sequelize = require('../middleware/database.js');
const Role = require('../models/role.js');

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const signin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existing_user = await User.findOne({ where: { username } });

        if (!existing_user || !await bcrypt.compare(password, existing_user.password_hash)) {
            res.status(404).json({ error: 'username or password is invalid' });
            return;
        }

        const role = await UserRole.findOne({ where: { user_id: existing_user.id } });

        const token = jwt.sign(
            { username, id: existing_user.id, role_id: role.role_id }, SECRET_KEY, { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch(error) {
        res.status(500).json({ error });
    }
};

const signup = async (req, res) => {
    const { username, password, first_name, last_name } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const existing_user = await User.findOne({ where: { username } });

        if (existing_user) {
            res.status(400).json({ error: 'username must be unique' });
            return;
        }

        const password_hash = await bcrypt.hash(password, 12);
        const user = await User.create({ username, password_hash, first_name, last_name }, { transaction });
        const defaultRole = await Role.findOne({ where: { role_name: 'user' } }, { transaction });
        await UserRole.create({ user_id: user.id, role_id: defaultRole.id }, { transaction });

        await transaction.commit();

        const token = jwt.sign(
            { username, id: user.id, role_id: defaultRole.id }, SECRET_KEY, { expiresIn: '1h' }
        );

        res.status(201).json({ user, token });
    } catch(error) {
        await transaction.rollback();
        res.status(500).json({ error });
    }
};

module.exports = { signin, signup };