const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

const PAGE_LIMIT = 20;

// Public: Submit Contact Message (No Auth)
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'name, email, and message are required' });
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        const newContact = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            status: 'unread',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('contacts').add(newContact);
        res.status(201).json({ id: docRef.id, ...newContact, createdAt: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get Paginated Contacts (Protected)
// ?limit=20&startAfter=<lastDocId>
router.get('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || PAGE_LIMIT;
        const startAfter = req.query.startAfter;

        let query = db.collection('contacts').orderBy('createdAt', 'desc').limit(limit);

        if (startAfter) {
            const lastDoc = await db.collection('contacts').doc(startAfter).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const contacts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        res.status(200).json({
            data: contacts,
            nextCursor: snapshot.docs.length === limit ? lastVisible.id : null,
            hasMore: snapshot.docs.length === limit,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete Contact (Protected)
router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('contacts').doc(id).delete();
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
