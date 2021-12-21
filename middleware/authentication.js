const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const { Role } = require('../models/main.js');

dotenv.config();

const authentication = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            res.status(404).json({ error: 'page not found' });
            return;
        }

        let userTokenData = jwt.verify(token, process.env.SECRET_KEY);

        if (userTokenData) {
            req.user = userTokenData;
            
            const adminRole = await Role.findOne({ where: { role_name: 'admin' } });

            if (userTokenData.role_id == adminRole?.id) {
                req.user.admin = true;
            }
        } else {
            res.status(404).json({ error: 'page not found' });
            return;
        }

        next();
    } catch(error){
        res.status(500).json({ error });
    }
}

module.exports = authentication;