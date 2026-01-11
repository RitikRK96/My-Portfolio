const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

// Public: Get All Blogs
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('blogs').orderBy('createdAt', 'desc').get();
        const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Optional: snippet logic could be here or frontend
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Public: Get Single Blog
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('blogs').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Create Blog
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, content, coverImage } = req.body;
        const newBlog = {
            title,
            content,
            coverImage,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('blogs').add(newBlog);
        res.status(201).json({ id: docRef.id, ...newBlog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update Blog
router.put('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        await db.collection('blogs').doc(id).update(updateData);
        res.status(200).json({ id, ...updateData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete Blog
router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('blogs').doc(id).delete();
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
