const mongoose = require('mongoose');

const Ville = mongoose.Schema({
    code: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    codesPostaux: [{ type: String, required: true }],
    codeDepartement: { type: String, required: true },
});

module.exports = mongoose.model('Ville', Ville);
