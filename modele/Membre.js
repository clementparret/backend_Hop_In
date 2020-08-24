const mongoose = require('mongoose');
const Utilisateur = require('./Utilisateur');

const Membre = Utilisateur.discriminator('Membre', new mongoose.Schema({
        adresse: { type: String, required: true },
        codePostal: { type: String, required: true },
        ville: {
            type: mongoose.Schema.ObjectId,
            ref: 'Ville'
        },
        telephone: { type: String, required: true },
        description: { type: String, required: true },
        dateInscription: { type: Date, required: true },
        voitures: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Voiture",
            }
        ],
        trajetsCandidat: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Trajet",
            }
        ],
        trajetsParticipant: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Trajet",
            }
        ],
    }),
);

module.exports = mongoose.model('Membre');
