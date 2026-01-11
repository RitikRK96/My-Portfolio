const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

// Public: Get Photos (can filter by category query param ?category=Moon)
router.get('/', async (req, res) => {
    try {
        let query = db.collection('photos').orderBy('createdAt', 'desc');

        if (req.query.category && req.query.category !== 'All') {
            query = db.collection('photos').where('category', '==', req.query.category).orderBy('createdAt', 'desc');
        }

        const snapshot = await query.get();
        const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Upload/Create Photo Record
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { imageUrl, category, caption, date } = req.body;
        // Handle "Today" shortcut if passed as string, otherwise expect timestamp/ISO
        let photoDate = date ? new Date(date) : new Date();

        const newPhoto = {
            imageUrl,
            category,
            caption,
            date: admin.firestore.Timestamp.fromDate(photoDate),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('photos').add(newPhoto);
        res.status(201).json({ id: docRef.id, ...newPhoto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete Photo
router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('photos').doc(id).delete();
        res.status(200).json({ message: 'Photo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
