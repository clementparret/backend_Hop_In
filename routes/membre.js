const express = require('express');
const router = express.Router();

const membreCtrl = require('../controleurs/membre');

router.post('/inscrire', membreCtrl.inscrireMembre);
router.get('/:id', membreCtrl.rechercherMembreParId);
router.post('/ajouterVoiture/:id', membreCtrl.ajouterVoiture);
router.post('/modifierMembre/:id', membreCtrl.modifierMembre);

module.exports = router;
