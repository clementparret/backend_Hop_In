const mongoose = require('mongoose');

const Trajet = mongoose.Schema({
    lieuDepart: { type: String },
    lieuArrivee: { type: String },
    villeDepart: {
        type: mongoose.Schema.ObjectId,
        ref: 'Ville'
    },
    villeArrivee: {
        type: mongoose.Schema.ObjectId,
        ref: 'Ville'
    },
    dateDepart: { type: Date, required: true },
    dateArrivee: { type: Date, required: true },
    prix: { type: Number, required: true },
    deplacement: {
        type: mongoose.Schema.ObjectId,
        ref: 'Deplacement'
    },
    candidats: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Membre",
        }
    ],
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Membre",
        }
    ],
    refuses: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Membre",
        }
    ],
});

module.exports = mongoose.model('Trajet', Trajet);
