const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/tournaments/:id', (req, res) => {
    res.sendFile(__dirname + '/tournaments.html');
});

app.listen(PORT, async () => {
    console.log(`Client started on http://localhost:${PORT}/`);
});