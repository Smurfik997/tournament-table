const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

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