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
        await Trajet.findByIdAndUpdate(
            req.body.trajetId,
            { $push: { candidats: req.body.utilisateurId } },
            { new: true, useFindAndModify: false })
            .catch(error => res.status(500).json({ error }));
        await Membre.findByIdAndUpdate(
            req.body.utilisateurId,
            { $push: { trajetsCandidat: req.body.trajetId } },
            { new: true, useFindAndModify: false })
            .catch(error => res.status(500).json({ error }));
    }
    res.status(200).json();
}

exports.annulerDeplacement = async (req, res, next) => {
    Deplacement.findByIdAndUpdate(
        req.params.id,
        { annule: true },
        { new: true, useFindAndModify: false })
        .then(docDeplacement => res.status(200).json(docDeplacement))
        .catch(error => res.status(500).json({ error }));
}

exports.accepterCandidat = async (req, res, next) => {
    let trajet = await Trajet.findByIdAndUpdate(
        req.body.trajetId,
        { $pull: { candidats: req.body.utilisateurId } },
        { new: true, useFindAndModify: false })
        .catch(error => res.status(500).json({ error }));
    let deplacement = await Deplacement.findByIdAndUpdate(
        trajet.deplacement._id,
        { $inc: { nbPlacesRestantes: -(req.body.nbPlaces) } },
        { new: true, useFindAndModify: false })
        .catch(error => res.status(500).json({ error }));
    await Membre.findByIdAndUpdate(
        req.body.utilisateurId,
        { $pull: { trajetsCandidat: req.body.trajetId } },
        { new: true, useFindAndModify: false })
        .catch(error => res.status(500).json({ error }));
    for (let i = 0; i < req.body.nbPlaces; i++) {
        await Trajet.findByIdAndUpdate(
            req.body.trajetId,
            { $push: { participants: req.body.utilisateurId } },
            { new: true, useFindAndModify: false })
            .catch(error => res.status(500).json({ error }));
        await Membre.findByIdAndUpdate(
            req.body.utilisateurId,
            { $push: { trajetsParticipant: req.body.trajetId } },
            { new: true, useFindAndModify: false })
            .catch(error => res.status(500).json({ error }));
    }
    // Refus automatique des candidats qui ont demandé plus de places qu'il n'en reste
    for (let k = 0; k < deplacement.trajets.length; k++) {
        trajet = await Trajet.findById(
            deplacement.trajets[k],
            {},
            { new: true, useFindAndModify: false })
            .catch(error => res.status(500).json({ error }));
        console.log(trajet);
        let utilisateurId
        if (trajet.candidats[0]) {
            utilisateurId = trajet.candidats[0].toString();
        } else {
            continue;
        }
        let nbPlaces = 0;
        for (let i = 0; i < trajet.candidats.length; i++) {
            if (trajet.candidats[i].toString() === utilisateurId) {
                nbPlaces++;
            } else {
                if (nbPlaces > deplacement.nbPlacesRestantes) {
                    await Trajet.findByIdAndUpdate(
                        trajet._id,
                        {$pull: {candidats: utilisateurId}},
                        {new: true, useFindAndModify: false})
                        .catch(error => res.status(500).json({error}));
                    for (let j = 0; j < nbPlaces; j++) {
                        await Trajet.findByIdAndUpdate(
                            trajet._id,
                            {$push: {refuses: utilisateurId}},
                            {new: true, useFindAndModify: false})
                            .catch(error => res.status(500).json({error}));
                    }
                }
                utilisateurId = trajet.candidats[i].toString();
                nbPlaces = 1;
            }
        }
        if (nbPlaces > deplacement.nbPlacesRestantes) {
            await Trajet.findByIdAndUpdate(
                trajet._id,
                {$pull: {candidats: utilisateurId}},
                {new: true, useFindAndModify: false})
                .catch(error => res.status(500).json({error}));
            for (let j = 0; j < nbPlaces; j++) {
                await Trajet.findByIdAndUpdate(
                    trajet._id,
                    {$push: {refuses: utilisateurId}},
                    {new: true, useFindAndModify: false})
                    .catch(error => res.status(500).json({error}));
            }
        }
    }
    res.status(200).json();
}

exports.refuserCandidat = async (req, res, next) => {
    await Trajet.findByIdAndUpdate(
        req.body.trajetId,
        { $pull: { candidats: req.body.utilisateurId } },
        { new: true, useFindAndModify: false })
        .catch(error => res.status(500).json({ error }));
    for (let i = 0; i < req.body.nbPlaces; i++) {
        await Trajet.findByIdAndUpdate(
            req.body.trajetId,
            {$push: {refuses: req.body.utilisateurId}},
            {new: true, useFindAndModify: false})
            .catch(error => res.status(500).json({error}));
    }
    res.status(200).json();
}
