const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./middleware/database.js')
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user.js');
const adminRoutes = require('./routes/admin.js');
const tournamentsRoutes = require('./routes/tournaments.js');
const teamRoutes = require('./routes/team.js');
const teamsRoutes = require('./routes/teams.js');

const app = express();
dotenv.config();

const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/admin', (req, res, next) => { req.admin = 1; req.visible = 0; next(); }, adminRoutes);
app.use('/tournaments', tournamentsRoutes);
app.use('/team', teamRoutes);
app.use('/teams', teamsRoutes);

app.listen(PORT, async () => {
    console.log(`Server started on http://localhost:${PORT}/`);

    try {
        await sequelize.authenticate();
        console.log('Successfully connected to MySQL database');
    } catch (error) {
        console.error(`Unable to connect to the database: ${error}`);
    }
});