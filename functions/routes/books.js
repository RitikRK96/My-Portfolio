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
            (sum, doc) => {
                const data = doc.data();
                if (data.isDeleted) return sum;
                return sum + countWords(data.content || '');
            },
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

// ─── DELETE /:id — Delete book (Soft or Hard) ─────────────────────────────────
router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { hard } = req.query;
        const bookRef = db.collection('books').doc(req.params.id);

        if (hard === 'true') {
            // 1. Fetch all chapters
            const chaptersSnap = await bookRef.collection('chapters').get();

            // 2. Batch-delete chapters
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
            return res.status(200).json({ message: 'Book and all chapters deleted permanently' });
        } else {
            // Soft delete
            await bookRef.update({
                isDeleted: true,
                deletedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return res.status(200).json({ message: 'Book moved to recycle bin' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── PUT /:id/restore — Restore book ──────────────────────────────────────────
router.put('/:id/restore', validateFirebaseIdToken, async (req, res) => {
    try {
        await db.collection('books').doc(req.params.id).update({
            isDeleted: false,
            deletedAt: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ message: 'Book restored successfully' });
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

// ─── DELETE /:bookId/chapters/:chapterId — Delete chapter (Soft or Hard) ──────
router.delete('/:bookId/chapters/:chapterId', validateFirebaseIdToken, async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const { hard } = req.query;

        const chapterRef = db.collection('books').doc(bookId).collection('chapters').doc(chapterId);

        if (hard === 'true') {
            await chapterRef.delete();
            syncBookWordCount(bookId);
            return res.status(200).json({ message: 'Chapter deleted permanently' });
        } else {
            await chapterRef.update({
                isDeleted: true,
                deletedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            syncBookWordCount(bookId);
            return res.status(200).json({ message: 'Chapter moved to recycle bin' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── PUT /:bookId/chapters/:chapterId/restore — Restore chapter ───────────────
router.put('/:bookId/chapters/:chapterId/restore', validateFirebaseIdToken, async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        await db.collection('books').doc(bookId).collection('chapters').doc(chapterId).update({
            isDeleted: false,
            deletedAt: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        syncBookWordCount(bookId);
        res.status(200).json({ message: 'Chapter restored successfully' });
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