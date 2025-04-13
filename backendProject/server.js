const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connecté à MongoDB');
    console.log('Base de données utilisée:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Schéma et modèle pour les utilisateurs
const userSchema = new mongoose.Schema({
  id: String,
  nom: String,
  password: String
});

const User = mongoose.model('User', userSchema, 'CollectionMbds');

// Schéma et modèle pour les assignments
const assignmentSchema = new mongoose.Schema({
  titre: String,
  description: String,
  dateDeCreation: String,
  createdBy: String,
  assignedTo: String, // Utilisateur auquel l'assignment est destiné
  matiere: String,
  note: Number,
  remarques: String
});

const Assignment = mongoose.model('Assignment', assignmentSchema, 'Assignments');

// Endpoint pour la connexion
app.post('/api/login', async (req, res) => {
  const { nom, password } = req.body;
  try {
    const user = await User.findOne({ nom });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Endpoint pour la création de compte
app.post('/api/signup', async (req, res) => {
  const { nom, password } = req.body;
  try {
    console.log('Tentative de création d\'utilisateur avec nom:', nom);
    const existingUser = await User.findOne({ nom });
    if (existingUser) {
      console.log('Utilisateur existant trouvé:', existingUser);
      return res.json({ success: false, message: 'Ce nom d\'utilisateur existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      id: new mongoose.Types.ObjectId().toString(),
      nom,
      password: hashedPassword
    });

    console.log('Nouvel utilisateur à enregistrer:', newUser);
    await newUser.save();
    console.log('Utilisateur enregistré avec succès dans CollectionMbds');
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Endpoint pour créer un assignment (réservé à l'admin)
app.post('/api/assignments', async (req, res) => {
  const { titre, description, dateDeCreation, matiere, note, remarques, createdBy, assignedTo } = req.body;

  try {
    // Vérifier si l'utilisateur est un admin (par exemple, "LineoL" est l'admin)
    if (createdBy !== 'LineoL') {
      return res.status(403).json({ success: false, message: 'Seul un administrateur peut créer un assignment' });
    }

    const newAssignment = new Assignment({
      titre,
      description,
      dateDeCreation,
      createdBy,
      assignedTo, // Ajout du champ assignedTo
      matiere,
      note,
      remarques
    });

    await newAssignment.save();
    res.json({ success: true, assignment: newAssignment });
  } catch (error) {
    console.error('Erreur lors de la création de l\'assignment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer les assignments d’un utilisateur spécifique
app.get('/api/assignments/:nom', async (req, res) => {
  const { nom } = req.params;
  try {
    const assignments = await Assignment.find({ assignedTo: nom }); // Filtrer par assignedTo
    res.json(assignments);
  } catch (error) {
    console.error('Erreur lors de la récupération des assignments:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));