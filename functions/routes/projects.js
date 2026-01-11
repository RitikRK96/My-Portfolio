const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

// Public: Get All Projects
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get();
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Create Project
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, description, techStack, liveUrl, githubUrl, imageUrl } = req.body;
        const newProject = {
            title,
            description,
            techStack: techStack || [],
            liveUrl,
            githubUrl,
            imageUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('projects').add(newProject);
        res.status(201).json({ id: docRef.id, ...newProject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update Project
router.put('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        await db.collection('projects').doc(id).update(updateData);
        res.status(200).json({ id, ...updateData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete Project
router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('projects').doc(id).delete();
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
