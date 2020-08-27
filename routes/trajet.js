const express = require('express');
const router = express.Router();

const trajetCtrl = require('../controleurs/trajet');

router.post('/proposerDeplacement/:id', trajetCtrl.proposerDeplacement);
router.post('/rechercherTrajets', trajetCtrl.rechercherTrajets);

module.exports = router;
