const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

const PAGE_LIMIT = 10;

// Public: Get Paginated Projects
// ?limit=10&startAfter=<lastDocId>
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || PAGE_LIMIT;
        const startAfter = req.query.startAfter;

        let query = db.collection('projects').orderBy('createdAt', 'desc').limit(limit);

        if (startAfter) {
            const lastDoc = await db.collection('projects').doc(startAfter).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        res.status(200).json({
            data: projects,
            nextCursor: snapshot.docs.length === limit ? lastVisible.id : null,
            hasMore: snapshot.docs.length === limit,
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Create Project
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, description, techStack, liveUrl, githubUrl, imageUrl } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'title and description are required' });
        }
        const newProject = {
            title: title.trim(),
            description,
            techStack: Array.isArray(techStack) ? techStack : [],
            liveUrl: liveUrl || '',
            githubUrl: githubUrl || '',
            imageUrl: imageUrl || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('projects').add(newProject);
        res.status(201).json({ id: docRef.id, ...newProject, createdAt: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update Project
router.put('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, techStack, liveUrl, githubUrl, imageUrl } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description;
        if (techStack !== undefined) updateData.techStack = Array.isArray(techStack) ? techStack : [];
        if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
        if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('projects').doc(id).update(updateData);
        res.status(200).json({ id, ...updateData, updatedAt: new Date().toISOString() });
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
