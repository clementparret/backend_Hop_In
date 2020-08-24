const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const membreRoutes = require('./routes/membre');
const utilisateurRoutes = require('./routes/utilisateur');

mongoose.connect('mongodb://127.0.0.1:27017/HopIn',
    { useNewUrlParser: true,
              useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Erreur lors de la connexion à MongoDB'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/hopin/membre', membreRoutes);
app.use('/hopin/utilisateur', utilisateurRoutes);


module.exports = app;
