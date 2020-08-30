const bcrypt = require('bcrypt');
const Utilisateur = require('../modele/Utilisateur');

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

exports.rechercherUtilisateurParId = (req, res, next) => {
    Utilisateur.findById(req.params.id)
        .populate('voitures').populate('ville')
        .populate({path: 'trajetsCandidat',
            populate: {path: 'deplacement candidats',
                populate: {path: 'conducteur voiture', select: '_id prenom modele marque couleur'}}})
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
