const mongoose = require('mongoose');

const Deplacement = mongoose.Schema({
    date: { type: Date, required: true },
    nbPlacesProposees: { type: Number, required: true },
    nbPlacesRestantes: { type: Number, required: true },
    commentaire: { type: String, required: true },
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
});

module.exports = mongoose.model('Deplacement', Deplacement);
