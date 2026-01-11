const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

// Public: Create Contact (No Auth)
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newContact = {
            name,
            email,
            message,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('contacts').add(newContact);
        res.status(201).json({ id: docRef.id, ...newContact });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get Contacts (Protected)
router.get('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const snapshot = await db.collection('contacts').orderBy('createdAt', 'desc').get();
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
