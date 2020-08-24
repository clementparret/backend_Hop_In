const mongoose = require('mongoose');

const optionsUtilisateur = {
    discriminatorKey: 'typeUtilisateur',
    collection: 'utilisateurs',
};

const Utilisateur = mongoose.model('Utilisateur', new mongoose.Schema({
        nom: { type: String, required: true },
        prenom: { type: String, required: true },
        dateNaissance: { type: Date, required: true },
        motDePasse: { type: String, required: true },
        email: { type: String, required: true, unique: true },
    }, optionsUtilisateur,
));

module.exports = mongoose.model('Utilisateur');
