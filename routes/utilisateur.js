const express = require('express');
const router = express.Router();

const utilisateurCtrl = require('../controleurs/utilisateur');

router.post('/authentifier', utilisateurCtrl.authentifierUtilisateur);
router.get('/rechercherParId/:id', utilisateurCtrl.rechercherUtilisateurParId);
router.post('/changerMotDePasse/:id', utilisateurCtrl.changerMotDePasse);
router.post('/verifierMotDePasse/:id', utilisateurCtrl.verifierMotDePasse);


module.exports = router;
