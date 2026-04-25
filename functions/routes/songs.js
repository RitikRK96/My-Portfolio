const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

const PAGE_LIMIT = 10;

// Public: Get Paginated Songs
// ?limit=10&startAfter=<lastDocId>
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || PAGE_LIMIT;
        const startAfter = req.query.startAfter;

        let query = db.collection('songs').orderBy('createdAt', 'desc').limit(limit);

        if (startAfter) {
            const lastDoc = await db.collection('songs').doc(startAfter).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const songs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        res.status(200).json({
            data: songs,
            nextCursor: snapshot.docs.length === limit ? lastVisible.id : null,
            hasMore: snapshot.docs.length === limit,
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Add Song
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, url, type } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'url is required' });
        }
        const newSong = {
            title: title || '',
            url,
            type: type === 'playlist' ? 'playlist' : 'song',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('songs').add(newSong);
        res.status(201).json({ id: docRef.id, ...newSong, createdAt: new Date().toISOString() });
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
