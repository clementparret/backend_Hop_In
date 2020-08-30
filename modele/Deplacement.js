const mongoose = require('mongoose');

const Deplacement = mongoose.Schema({
    annule: { type: Boolean, required: true },
    date: { type: Date, required: true },
    nbPlacesProposees: { type: Number, required: true },
    nbPlacesRestantes: { type: Number, required: true },
    commentaire: { type: String },
    conducteur: {
        type: mongoose.Schema.ObjectId,
        ref: 'Membre'
    },
    trajets: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Trajet",
        }
    ],
    voiture: {
        type: mongoose.Schema.ObjectId,
        ref: "Voiture",
    },
});

module.exports = mongoose.model('Deplacement', Deplacement);
