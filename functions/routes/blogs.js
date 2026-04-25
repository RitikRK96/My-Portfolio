const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

const PAGE_LIMIT = 10;

// Public: Get Paginated Blogs
// ?limit=10&startAfter=<lastDocId>
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || PAGE_LIMIT;
        const startAfter = req.query.startAfter;

        let query = db.collection('blogs').orderBy('createdAt', 'desc').limit(limit);

        if (startAfter) {
            const lastDoc = await db.collection('blogs').doc(startAfter).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const blogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Serialize Firestore Timestamp to ISO string for JSON transport
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        res.status(200).json({
            data: blogs,
            nextCursor: snapshot.docs.length === limit ? lastVisible.id : null,
            hasMore: snapshot.docs.length === limit,
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
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
        const data = doc.data();
        res.status(200).json({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Create Blog
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, content, coverImage } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'title and content are required' });
        }
        const newBlog = {
            title: title.trim(),
            content,
            coverImage: coverImage || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('blogs').add(newBlog);
        res.status(201).json({ id: docRef.id, ...newBlog, createdAt: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update Blog
router.put('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, coverImage } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('blogs').doc(id).update(updateData);
        res.status(200).json({ id, ...updateData, updatedAt: new Date().toISOString() });
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
