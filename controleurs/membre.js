const bcrypt = require('bcrypt');
const Membre = require('../modele/Membre');
const Voiture = require('../modele/Voiture');
const Ville = require('../modele/Ville');

/**
 * Ajoute un membre à la base de données
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.inscrireMembre = (req, res, next) => {
    const ville = {
        code: req.body.ville.code,
        nom: req.body.ville.nom,
        codesPostaux: req.body.ville.codePostal,
        codeDepartement: req.body.ville.codeDepartement,
    };
    Ville.findOneAndUpdate( {code: req.body.ville.code}, ville, {new: true, upsert: true, useFindAndModify: false})
        .then(
            (docVille) => {
                bcrypt.hash(req.body.membre.motDePasse, 10)
                    .then(hash => {
                        const membre = new Membre({
                            nom: req.body.membre.nom,
                            prenom: req.body.membre.prenom,
                            dateNaissance: req.body.membre.dateNaissance,
                            motDePasse: hash,
                            email: req.body.membre.email,
                            adresse: req.body.membre.adresse,
                            codePostal: req.body.membre.codePostal,
                            ville: docVille._id,
                            telephone: req.body.membre.telephone,
                            description: ' ',
                            dateInscription: new Date(),
                        });
                        membre.save()
                            .then(
                                () => {
                                    res.status(201).json({
                                        message: 'Membre enregistré avec succès !'
                                    });
                                })
                            .catch(
                                (error) => {
                                    res.status(400).json({
                                        error: error
                                    });
                                });
                    })
                    .catch(error => res.status(500).json({ error }));
            })
        .catch(
            (error) => {
                console.log(error);
                res.status(400).json({
                    error: error
                });
            });
};

/**
 * Renvoie les informations sur le membre dont l'id est passé en paramètre de la requête HTTP
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.rechercherMembreParId = (req, res, next) => {
    Membre.findOne({_id: req.params.id})
        .then(membre => res.status(200).json(membre))
        .catch(error => res.status(404).json({ error }));
}

/**
 * Crée une voiture et l'associe à un membre
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.ajouterVoiture = (req, res, next) => {
    const voiture = new Voiture({
        modele: req.body.voiture.modele,
        marque: req.body.voiture.marque,
        couleur: req.body.voiture.couleur,
        active: true,
    });
    voiture.save()
        .then(
            (docVoiture) => {
                Membre.findByIdAndUpdate(
                    req.params.id,
                    { $push: { voitures: docVoiture._id } },
                    { new: true, useFindAndModify: false })
                    .then(res.status(200).json(docVoiture))
                    .catch(error => res.status(500).json({ error }));
        })
        .catch((error) => {res.status(400).json({error: error})});
}

/**
 * Rend une voiture inactive, elle n'apparaitra plus dans la liste de véhicules du membre
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.desactiverVoiture = (req, res, next) => {
    Voiture.findByIdAndUpdate(req.params.id, { active: false }, { new: true, useFindAndModify: false })
        .then(voiture => res.status(200).json(voiture))
        .catch(error => res.status(500).json({ error }));
}

/**
 * Modifie les informations d'un membre
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 * @returns {Promise<void>}
 */
exports.modifierMembre = async (req, res, next) => {
    if (req.body.membre.hasOwnProperty('dateNaissance')) {
        req.body.membre.dateNaissance = new Date(req.body.membre.dateNaissance);
    }
    if (req.body.hasOwnProperty('ville')) {
        await Ville.findOneAndUpdate(
            {code: req.body.ville.code},
            req.body.ville,
            {new: true, upsert: true, useFindAndModify: false})
            .then( docVille => {
                req.body.membre.ville = docVille._id;
            })
            .catch((error) => {
                res.status(500).json({error: error})
            });
    }
    await Membre.findByIdAndUpdate(req.params.id, req.body.membre, { new: true, useFindAndModify: false })
        .then(membre => res.status(200).json(membre))
        .catch(error => res.status(400).json({ error }));
}


