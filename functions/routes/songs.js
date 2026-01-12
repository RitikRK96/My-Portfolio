const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

// Public: Get Songs
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('songs').orderBy('createdAt', 'desc').get();
        const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Add Song
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        console.log('Songs POST headers:', req.headers);
        console.log('Songs POST body:', req.body);
        const { title, url, type } = req.body;
        const newSong = {
            title,
            url, // Frontend sends 'url'
            type: type || 'song',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('songs').add(newSong);
        res.status(201).json({ id: docRef.id, ...newSong });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete Song
router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('songs').doc(id).delete();
        res.status(200).json({ message: 'Song deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
