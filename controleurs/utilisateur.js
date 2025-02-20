const bcrypt = require('bcrypt');
const Utilisateur = require('../modele/Utilisateur');

/**
 * Vérifie qu'un couple identifiant/mot de passe existe dans la base de donnée pour identifier l'utilisateur
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.authentifierUtilisateur = (req, res, next) => {
    Utilisateur.findOne({ email: req.body.email })
        .then(utilisateur => {
            if (!utilisateur) {
                return res.status(401).json({ error: 'Utilisateur non trouvé' });
            }
            bcrypt.compare(req.body.motDePasse, utilisateur.motDePasse)
                .then(match => {
                    if (!match) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    let isAdmin = false;
                    if (utilisateur.discriminatorKey === 'Admin') {
                        isAdmin = true;
                    }
                    res.status(200).json({
                        utilisateurId: utilisateur._id,
                        isAdmin: isAdmin,
                        //token: 'TOKEN'
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

}

/**
 * Renvoie les informations sur un utilisateur à partir de son identifiant
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.rechercherUtilisateurParId = (req, res, next) => {
    Utilisateur.findById(req.params.id)
        .populate('voitures').populate('ville')
        .populate({path: 'trajetsCandidat',
            populate: {path: 'deplacement villeDepart villeArrivee participants',
                populate: {path: 'conducteur voiture trajets', select: '_id prenom modele marque couleur',
                    populate: {path: 'participants villeDepart villeArrivee', select: '_id prenom nom'}}}})
        .populate({path: 'trajetsParticipant',
            populate: {path: 'deplacement villeDepart villeArrivee participants',
                populate: {path: 'conducteur voiture trajets', select: '_id prenom modele marque couleur',
                    populate: {path: 'participants villeDepart villeArrivee', select: '_id prenom nom'}}}})
        .populate({path: 'deplacements',
            populate: {path: 'trajets voiture',
                populate: {path: 'candidats participants refuses villeDepart villeArrivee', select: '_id prenom nom'}}})
        .then(utilisateur => {
            if (!utilisateur) {
                return res.status(401).json({ error: 'Utilisateur non trouvé' });
            } else {
                res.status(200).json({
                    utilisateur: utilisateur,
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
}

/**
 * Permet de remplacer le mot de passe actuel par un nouveau
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.changerMotDePasse = (req, res, next) => {
    bcrypt.hash(req.body.motDePasse, 10)
        .then(hash => {
            req.body.motDePasse = hash;
            Utilisateur.findByIdAndUpdate(req.params.id, req.body, { new: true, useFindAndModify: false })
                .then(membre => res.status(200).json(membre))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

/**
 * Vérifie que le mot de passe correspond bien à l'utilisateur connecté
 * @param req requête HTTP reçue
 * @param res réponse HTTP à émettre
 * @param next
 */
exports.verifierMotDePasse = (req, res, next) => {
    Utilisateur.findById(req.params.id)
        .then(utilisateur => {
            if (!utilisateur) {
                return res.status(401).json({ error: 'Utilisateur non trouvé' });
            }
            bcrypt.compare(req.body.motDePasse, utilisateur.motDePasse)
                .then(match => {
                    if (!match) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    } else {
                        return res.status(200).json({ message: 'Mot de passe vérifié' });
                    }
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}
