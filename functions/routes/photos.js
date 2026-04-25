const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

const PAGE_LIMIT = 10;

// Public: Get Paginated Photos
// ?limit=10&startAfter=<lastDocId>&category=Moon
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || PAGE_LIMIT;
        const startAfter = req.query.startAfter;
        const category = req.query.category;

        let query;

        if (category && category !== 'All') {
            query = db.collection('photos')
                .where('category', '==', category)
                .orderBy('createdAt', 'desc')
                .limit(limit);
        } else {
            query = db.collection('photos').orderBy('createdAt', 'desc').limit(limit);
        }

        if (startAfter) {
            const lastDoc = await db.collection('photos').doc(startAfter).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const photos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                // Serialize date Timestamp if present
                date: data.date?.toDate?.()?.toISOString() || data.date || null,
            };
        });

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        res.status(200).json({
            data: photos,
            nextCursor: snapshot.docs.length === limit ? lastVisible.id : null,
            hasMore: snapshot.docs.length === limit,
        });
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Upload/Create Photo Record
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { imageUrl, category, caption, date } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ error: 'imageUrl is required' });
        }
        const photoDate = date ? new Date(date) : new Date();
        const newPhoto = {
            imageUrl,
            category: category || 'General',
            caption: caption || '',
            date: admin.firestore.Timestamp.fromDate(photoDate),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('photos').add(newPhoto);
        res.status(201).json({
            id: docRef.id,
            ...newPhoto,
            date: photoDate.toISOString(),
            createdAt: new Date().toISOString(),
        });
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
