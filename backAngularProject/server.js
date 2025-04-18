const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Tentative de connexion à MongoDB...');

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connecté à MongoDB'))
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
  assignedTo: String,
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

// Endpoint pour créer un assignment
app.post('/api/assignments', async (req, res) => {
  const { titre, description, dateDeCreation, createdBy, assignedTo, matiere, note, remarques } = req.body;
  try {
    // Vérifier si l'utilisateur est un admin (par exemple, "LineoL")
    if (createdBy !== 'LineoL') {
      return res.status(403).json({ success: false, message: 'Seul l\'administrateur peut créer un assignment' });
    }

    // Vérifier les champs obligatoires
    if (!titre || !description || !dateDeCreation || !assignedTo || !matiere || note === undefined) {
      return res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Vérifier si l'utilisateur assigné existe
    const user = await User.findOne({ nom: assignedTo });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur assigné non trouvé' });
    }

    const newAssignment = new Assignment({
      titre,
      description,
      dateDeCreation,
      createdBy,
      assignedTo,
      matiere,
      note,
      remarques
    });

    console.log('Nouvel assignment à enregistrer:', newAssignment);
    await newAssignment.save();
    console.log('Assignment enregistré avec succès dans Assignments');
    res.json({ success: true, assignment: newAssignment });
  } catch (error) {
    console.error('Erreur lors de la création de l\'assignment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer tous les assignments
app.get('/api/assignments', async (req, res) => {
  const { nom } = req.query;
  try {
    let assignments;
    if (nom && nom === 'LineoL') {
      assignments = await Assignment.find({ createdBy: nom });
    } else if (nom) {
      assignments = await Assignment.find({ assignedTo: nom });
    } else {
      assignments = await Assignment.find();
    }
    console.log(`Assignments trouvés pour nom=${nom}:`, assignments);
    res.json(assignments);
  } catch (error) {
    console.error('Erreur lors de la récupération des assignments:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer les assignments d’un utilisateur spécifique
app.get('/api/assignments/:nom', async (req, res) => {
  const { nom } = req.params;
  try {
    console.log(`Recherche des assignments pour assignedTo: ${nom}`);
    const assignments = await Assignment.find({ assignedTo: nom });
    console.log(`Assignments trouvés:`, assignments);
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

// Endpoint pour mettre à jour un assignment
app.put('/api/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const updatedAssignment = req.body;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment non trouvé' });
    }

    // Vérifier si l'utilisateur est un admin (par exemple, "LineoL")
    if (assignment.createdBy !== 'LineoL') {
      return res.status(403).json({ success: false, message: 'Seul l\'administrateur peut modifier un assignment' });
    }

    const result = await Assignment.findByIdAndUpdate(id, updatedAssignment, { new: true });
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'assignment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer un assignment
app.delete('/api/assignments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment non trouvé' });
    }

    // Vérifier si l'utilisateur est un admin (par exemple, "LineoL")
    if (assignment.createdBy !== 'LineoL') {
      return res.status(403).json({ success: false, message: 'Seul l\'administrateur peut supprimer un assignment' });
    }

    await Assignment.findByIdAndDelete(id);
    console.log(`Assignment avec ID ${id} supprimé avec succès`);
    res.json({ success: true, message: 'Assignment supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'assignment:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));