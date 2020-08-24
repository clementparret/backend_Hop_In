const mongoose = require('mongoose');

const Voiture = mongoose.Schema({
    marque: { type: String, required: true },
    modele: { type: String, required: true },
    couleur: { type: String, required: true },
    active: { type: Boolean, required: true },
});

module.exports = mongoose.model('Voiture', Voiture);
