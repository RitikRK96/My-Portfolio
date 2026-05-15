const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const validateFirebaseIdToken = require('../middleware/auth');

// ─── Helper: strip HTML and count words ──────────────────────────────────────
const countWords = (html = '') => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').filter(Boolean).length : 0;
};

// ─── Helper: recalculate and update book wordCount from all chapters ──────────
const syncBookWordCount = async (bookId) => {
    try {
        const chaptersSnap = await db
            .collection('books')
            .doc(bookId)
            .collection('chapters')
            .get();

        const total = chaptersSnap.docs.reduce(
            (sum, doc) => sum + countWords(doc.data().content || ''),
            0
        );

        await db.collection('books').doc(bookId).update({
            wordCount: total,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
        console.error('syncBookWordCount failed:', err.message);
    }
};

// ─── GET / — All books ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const snapshot = await db
            .collection('books')
            .orderBy('createdAt', 'desc')
            .get();

        const books = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /:id — Single book + all chapters (optimised, one round-trip) ────────
router.get('/:id', async (req, res) => {
    try {
        const bookRef = db.collection('books').doc(req.params.id);
        const bookDoc = await bookRef.get();

        if (!bookDoc.exists) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const chaptersSnapshot = await bookRef
            .collection('chapters')
            .orderBy('order', 'asc')
            .get();

        const chapters = chaptersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));

        res.status(200).json({
            id: bookDoc.id,
            ...bookDoc.data(),
            createdAt: bookDoc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: bookDoc.data().updatedAt?.toDate?.()?.toISOString() || null,
            chapters,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── POST / — Create book ─────────────────────────────────────────────────────
router.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, description, coverImage, genre } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newBook = {
            title: title.trim(),
            description: description || '',
            coverImage: coverImage || '',
            genre: genre || '',
            status: 'draft',
            wordCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('books').add(newBook);

        res.status(201).json({
            id: docRef.id,
            ...newBook,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── PUT /:id — Update book ───────────────────────────────────────────────────
// FIX: added genre and status — previously these were silently ignored,
// so the library page could never update them.
router.put('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, description, coverImage, genre, status } = req.body;

        const VALID_STATUSES = ['draft', 'in_progress', 'published', 'archived'];

        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (title !== undefined)       updateData.title       = title.trim();
        if (description !== undefined) updateData.description = description;
        if (coverImage !== undefined)  updateData.coverImage  = coverImage;
        if (genre !== undefined)       updateData.genre       = genre.trim();

        // Validate status before accepting it
        if (status !== undefined) {
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
                });
            }
            updateData.status = status;
        }

        await db.collection('books').doc(req.params.id).update(updateData);
        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── DELETE /:id — Delete book + all its chapters ─────────────────────────────
// FIX: the original left all chapters as orphaned documents in Firestore.
// We now batch-delete every chapter before removing the book document.
router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const bookRef = db.collection('books').doc(req.params.id);

        // 1. Fetch all chapters
        const chaptersSnap = await bookRef.collection('chapters').get();

        // 2. Batch-delete chapters (Firestore max 500 per batch)
        if (!chaptersSnap.empty) {
            const BATCH_SIZE = 400;
            const docs = chaptersSnap.docs;

            for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                const batch = db.batch();
                docs.slice(i, i + BATCH_SIZE).forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        }

        // 3. Delete the book document itself
        await bookRef.delete();

        res.status(200).json({ message: 'Book and all chapters deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── POST /:bookId/chapters — Create chapter ──────────────────────────────────
router.post('/:bookId/chapters', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, content, order } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newChapter = {
            title: title.trim(),
            content: content || '',
            order: order ?? 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const chapterRef = await db
            .collection('books')
            .doc(req.params.bookId)
            .collection('chapters')
            .add(newChapter);

        res.status(201).json({
            id: chapterRef.id,
            ...newChapter,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── PUT /:bookId/chapters/:chapterId — Update chapter ────────────────────────
// FIX: after saving content, recalculate and sync wordCount on the parent book.
router.put('/:bookId/chapters/:chapterId', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, content, order } = req.body;
        const { bookId, chapterId } = req.params;

        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (title !== undefined)   updateData.title   = title.trim();
        if (content !== undefined) updateData.content = content;
        if (order !== undefined)   updateData.order   = order;

        await db
            .collection('books')
            .doc(bookId)
            .collection('chapters')
            .doc(chapterId)
            .update(updateData);

        // Sync wordCount on the book whenever chapter content changes
        if (content !== undefined) {
            // Run async — don't block the response
            syncBookWordCount(bookId);
        }

        res.status(200).json({ message: 'Chapter updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── DELETE /:bookId/chapters/:chapterId — Delete chapter ─────────────────────
router.delete('/:bookId/chapters/:chapterId', validateFirebaseIdToken, async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;

        await db
            .collection('books')
            .doc(bookId)
            .collection('chapters')
            .doc(chapterId)
            .delete();

        // Re-sync wordCount after a chapter is removed
        syncBookWordCount(bookId);

        res.status(200).json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── POST /:bookId/chapters/reorder — Batch reorder ──────────────────────────
router.post('/:bookId/chapters/reorder', validateFirebaseIdToken, async (req, res) => {
    try {
        const { chapters } = req.body;

        if (!Array.isArray(chapters)) {
            return res.status(400).json({ error: 'chapters must be an array' });
        }

        const batch = db.batch();
        const chaptersRef = db
            .collection('books')
            .doc(req.params.bookId)
            .collection('chapters');

        chapters.forEach(chapter => {
            if (chapter.id && chapter.order !== undefined) {
                batch.update(chaptersRef.doc(chapter.id), {
                    order: chapter.order,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        });

        await batch.commit();
        res.status(200).json({ message: 'Chapters reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;