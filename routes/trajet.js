const express = require('express');
const router = express.Router();

const trajetCtrl = require('../controleurs/trajet');

router.post('/proposerDeplacement/:id', trajetCtrl.proposerDeplacement);
router.post('/rechercherTrajets', trajetCtrl.rechercherTrajets);
router.post('/candidater', trajetCtrl.candidater);
router.post('/annulerDeplacement/:id', trajetCtrl.annulerDeplacement);
router.post('/accepterCandidat', trajetCtrl.accepterCandidat);
router.post('/refuserCandidat', trajetCtrl.refuserCandidat);

module.exports = router;
