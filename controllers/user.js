const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sequelize = require('../middleware/database.js');

const { ValidationError } = require('sequelize');
const { User, UserRole, Role } = require('../models/main.js');

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const signin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'username, password fields are requiered' });
        return;
    }

    try {
        const existing_user = await User.findOne({ where: { username } });

        if (!existing_user || !await bcrypt.compare(password, existing_user.password_hash)) {
            res.status(400).json({ error: 'username or password is invalid' });
            return;
        }

        const role = await existing_user.getRole();

        const token = jwt.sign(
            { username, id: existing_user.id, role_id: role.role_id }, SECRET_KEY, { expiresIn: '24h' }
        );

        res.status(200).json({ token });
    } catch(error) {
        res.status(500).json({ error });
    }
};

const signup = async (req, res) => {
    const { username, password, first_name, last_name } = req.body;

    if (!username || !password || !first_name || !last_name) {
        res.status(400).json({ error: 'username, password, first_name, last_name fields are requiered' });
        return;
    }

    const transaction = await sequelize.transaction();

    try {
        const existing_user = await User.findOne({ where: { username } });

        if (existing_user) {
            res.status(400).json({ error: 'username must be unique' });
            return await transaction.rollback();
        }

        const password_hash = await bcrypt.hash(password, 12);
        const user = await User.create({ username, password_hash, first_name, last_name }, { transaction });
        const defaultRole = await Role.findOne({ where: { role_name: 'user' } }, { transaction });
        
        await UserRole.create({ user_id: user.id, role_id: defaultRole.id }, { transaction });
        await transaction.commit();

        const token = jwt.sign(
            { username, id: user.id, role_id: defaultRole.id }, SECRET_KEY, { expiresIn: '1h' }
        );

        res.status(201).json({ user: { id: user.id }, token });
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: 'invalid request data' });
        } else {
            res.status(500).json({ error });
        }
        await transaction.rollback();
    }
};

const getUserFullName = async (req, res) => {
    try {
        const user = await User.findOne(
            { where: { id: req.params.id }, attributes: ['first_name', 'last_name'] }
        );

        if (user) {
            res.status(200).json({ user });
        } else {
            res.status(404).json({ error: 'user doesn\'t exists' })
        }
    } catch(error) {
        res.status(500).json({ error });
    }
}

module.exports = { signin, signup, getUserFullName };