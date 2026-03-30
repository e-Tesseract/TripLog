const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ========================================
// ✅ POST /api/users/register
// Inscription d'un nouvel utilisateur
// ========================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Nom, email et mot de passe obligatoires' 
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Chiffrer le mot de passe
    // 10 = le "sel" — plus c'est élevé, plus c'est sécurisé mais lent
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({ 
      message: 'Compte créé !', 
      userId: user.id 
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ========================================
// ✅ POST /api/users/login
// Connexion + génération du token JWT
// ========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Chercher l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    // Ce token prouve que l'utilisateur est connecté
    const token = jwt.sign(
      { id: user.id, email: user.email },  // Données dans le token
      process.env.JWT_SECRET,               // Clé secrète
      { expiresIn: '7d' }                   // Expire dans 7 jours
    );

    res.json({ 
      message: 'Connecté !', 
      token,          // Le token à envoyer dans chaque requête
      userId: user.id 
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ========================================
// ✅ GET /api/users/:id
// Voir un profil utilisateur
// ========================================
const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'createdAt'] // On n'envoie pas le mot de passe !
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ========================================
// ✅ PUT /api/users/:id
// Modifier son profil
// ========================================
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    
    if (user.id !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { name, email } = req.body;
    await user.update({ 
      name: name || user.name, 
      email: email || user.email 
    });

    res.json({ message: 'Profil mis à jour !', user });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ========================================
// ✅ DELETE /api/users/:id
// Supprimer son compte
// ========================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Vérifier que c'est bien TON compte
    if (user.id !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await user.destroy();
    res.json({ message: 'Compte supprimé !' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { register, login, getUser, updateUser, deleteUser };