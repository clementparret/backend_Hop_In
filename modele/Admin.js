const mongoose = require('mongoose');
const Utilisateur = require('./Utilisateur');

const Admin = Utilisateur.discriminator('Admin', new mongoose.Schema({

    }),
);

module.exports = mongoose.model('Admin');