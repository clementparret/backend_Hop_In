const Ville = require('../modele/Ville');
const Trajet = require('../modele/Trajet');
const Deplacement = require('../modele/Deplacement');
const Membre = require("../modele/Membre");

exports.proposerDeplacement = async (req, res, next) => {
    let formulaire = req.body.formulaire;
    for (let i = 0; i < formulaire.etapes.length; i++) {
        await Ville.findOneAndUpdate(
            {code: formulaire.etapes[i].ville.code},
            formulaire.etapes[i].ville,
            {new: true, upsert: true, useFindAndModify: false})
            .catch((error) => {
                res.status(500).json({error: error})
            });
    }
    const deplacement = new Deplacement({
        annule: false,
        date: new Date(formulaire.date),
        nbPlacesProposees: formulaire.nbPlaces,
        nbPlacesRestantes: formulaire.nbPlaces,
        commentaire: formulaire.commentaire,
        conducteur: req.params.id,
        voiture: formulaire.voiture,
    });
    deplacement.save().catch((error) => {
        res.status(500).json({error: error})
    });
    let index = 0;
    for (let i = 0; i < formulaire.etapes.length - 1; i++) {
        for (let j = i + 1; j < formulaire.etapes.length; j++) {
            const depart = formulaire.etapes[i];
            const arrivee = formulaire.etapes[j];
            const villeDepart = await Ville.findOne({code: depart.ville.code});
            const villeArrivee = await Ville.findOne({code: arrivee.ville.code});
            const trajet = new Trajet({
                lieuDepart: depart.lieu,
                lieuArrivee: arrivee.lieu,
                villeDepart: villeDepart._id,
                villeArrivee: villeArrivee._id,
                dateDepart: depart.heure,
                dateArrivee: arrivee.heure,
                prix: formulaire.prix[index],
                deplacement: deplacement._id,
            });
            trajet.save().catch((error) => {
                res.status(500).json({error: error})
            });
            Deplacement.findByIdAndUpdate(
                deplacement._id,
                {$push: {trajets: trajet._id}},
                {new: true, useFindAndModify: false})
                .catch((error) => {
                    res.status(500).json({error: error})
                });
            index++;
        }
    }
    Membre.findByIdAndUpdate(
        req.params.id,
        { $push: { deplacements: deplacement._id } },
        { new: true, useFindAndModify: false })
        .catch(error => res.status(500).json({ error }));
    res.status(200).json();
}

exports.rechercherTrajets = async (req, res, next) => {
    let formulaire = req.body.formulaire;
    const villeDepart = await Ville.findOne({code: formulaire.villeDepart.code});
    const villeArrivee = await Ville.findOne({code: formulaire.villeArrivee.code});
    let dateBis = new Date(formulaire.date);
    dateBis.setDate(dateBis.getDate()+1);
    const date = new Date(formulaire.date);
    let trajets = [];
    if (villeArrivee && villeDepart) {
        trajets = await Trajet.find(
            {
                //nbPlacesRestantes: {$gte: formulaire.nbPlaces},
                villeDepart: villeDepart._id,
                villeArrivee: villeArrivee._id,
                dateDepart: {$gte: date, $lt: dateBis},
            },
            'lieuDepart lieuArrivee villeDepart villeArrivee dateDepart dateArrivee prix deplacement'
        )
            .populate('villeDepart').populate('villeArrivee')
            .populate({path: 'deplacement',
                populate: {path: 'conducteur voiture', select: '_id nom prenom modele marque couleur'}})
            .populate('participants')
            .catch(error => res.status(500).json({error}));
    }
    trajets = trajets.filter(trajet => trajet.deplacement.nbPlacesRestantes >= formulaire.nbPlaces);
    trajets = trajets.filter(trajet => trajet.deplacement.annule === false);
    res.status(200).json(trajets);
}

exports.candidater = async (req, res, next) => {
    for (let i = 0; i < req.body.nbPlaces; i++) {
        Trajet.findByIdAndUpdate(
            req.body.trajetId,
            { $push: { candidats: req.body.utilisateurId } },
            { new: true, useFindAndModify: false })
            .catch(error => res.status(500).json({ error }));
        Membre.findByIdAndUpdate(
            req.body.utilisateurId,
            { $push: { trajetsCandidat: req.body.trajetId } },
            { new: true, useFindAndModify: false })
            .catch(error => res.status(500).json({ error }));
    }
    res.status(200).json();
}
