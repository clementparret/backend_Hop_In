const Ville = require('../modele/Ville');
const Trajet = require('../modele/Trajet');
const Deplacement = require('../modele/Deplacement');
const Membre = require("../modele/Membre");

exports.proposerDeplacement = async (req, res, next) => {
    let formulaire = req.body.formulaire;
    console.log(formulaire);
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
        date: new Date(formulaire.date),
        nbPlacesProposees: formulaire.nbPlaces,
        nbPlacesRestantes: formulaire.nbPlaces,
        commentaire: formulaire.commentaire,
        conducteur: req.params.id,
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
