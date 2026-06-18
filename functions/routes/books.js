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

        const total = chaptersSnap.docs.reduce((sum, doc) => {
            const data = doc.data();
            if (data.isDeleted) return sum;
            return sum + countWords(data.content || '');
        }, 0);

        await db.collection('books').doc(bookId).update({
            wordCount: total,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
        console.error('syncBookWordCount failed:', err.message);
    }
};

// ─── GET / — All books (excludes soft-deleted by default) ────────────────────
// Pass ?all=true to include deleted books (admin recycle bin)
router.get('/', async (req, res) => {
    try {
        const includeDeleted = req.query.all === 'true';

        const snapshot = await db
            .collection('books')
            .orderBy('createdAt', 'desc')
            .get();

        const books = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
            }))
            .filter(b => includeDeleted || !b.isDeleted);

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /:bookId/export/html — Full book as self-printing HTML (→ PDF) ───────
// NOTE: Must be defined BEFORE /:id to prevent Express wildcard shadowing.
router.get('/:bookId/export/html', async (req, res) => {
    try {
        const { bookId } = req.params;
        const bookDoc = await db.collection('books').doc(bookId).get();
        if (!bookDoc.exists) return res.status(404).json({ error: 'Book not found' });

        const book = bookDoc.data();

        const chaptersSnap = await db
            .collection('books').doc(bookId)
            .collection('chapters')
            .orderBy('order', 'asc')
            .get();

        const chapters = chaptersSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(c => !c.isDeleted);

        const chaptersHtml = chapters.map((ch, i) => `
            <div class="chapter"${i > 0 ? ' style="page-break-before:always"' : ''}>
                <h1 class="chapter-title">${ch.title || 'Untitled Chapter'}</h1>
                <div>${ch.content || '<p><em>No content yet.</em></p>'}</div>
            </div>
        `).join('\n');

        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${book.title || 'Book'}</title>
<style>
@page{size:A4;margin:25mm 20mm}*{box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;font-size:12pt;line-height:1.6;color:#1f2937;background:#fff}
.cover{text-align:center;padding:8rem 2rem;page-break-after:always}
.cover-title{font-size:32pt;font-weight:700;color:#111827;line-height:1.2}
.cover-genre{font-size:13pt;color:#6b7280;margin-top:1rem;font-style:italic}
.cover-divider{width:60px;height:3px;background:#374151;margin:2rem auto}
.chapter-title{font-size:20pt;font-weight:700;color:#111827;margin:0 0 2rem;padding-bottom:.75rem;border-bottom:1.5px solid #e5e7eb}
p{margin:0 0 .9em}h2{font-size:15pt;font-weight:600;margin:2rem 0 .5rem}
h3{font-size:13pt;font-weight:600;margin:1.5rem 0 .4rem}
blockquote{border-left:3px solid #9ca3af;padding-left:1.25rem;color:#6b7280;font-style:italic;margin:1.5rem 0}
ul{list-style:disc;padding-left:1.75rem;margin:.6rem 0}ol{list-style:decimal;padding-left:1.75rem;margin:.6rem 0}
li{margin-bottom:.3rem}code{background:#f3f4f6;padding:.1em .35em;border-radius:3px;font-size:.9em;font-family:monospace}
pre{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:1rem;margin:1.5rem 0}
table{border-collapse:collapse;width:100%;margin:1rem 0}td,th{border:1px solid #d1d5db;padding:.45rem .7rem}
th{background:#f9fafb;font-weight:600}hr{border:none;border-top:1px solid #e5e7eb;margin:2rem 0}
strong{font-weight:700}a{color:#3b82f6}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="cover">
  <div class="cover-title">${book.title || 'Untitled Book'}</div>
  <div class="cover-divider"></div>
  <div class="cover-genre">${book.genre || ''}</div>
</div>
${chaptersHtml}
<script>window.onload=function(){window.print()}</script>
</body></html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /:bookId/chapters/:chapterId/export/html — Chapter as printable HTML ─
// NOTE: Must be defined BEFORE /:id to prevent Express wildcard shadowing.
router.get('/:bookId/chapters/:chapterId/export/html', async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const chapterDoc = await db
            .collection('books').doc(bookId)
            .collection('chapters').doc(chapterId)
            .get();

        if (!chapterDoc.exists) return res.status(404).json({ error: 'Chapter not found' });

        const ch = chapterDoc.data();
        const bookDoc = await db.collection('books').doc(bookId).get();
        const book = bookDoc.exists ? bookDoc.data() : { title: 'Book' };

        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${ch.title || 'Chapter'} — ${book.title || 'Book'}</title>
<style>
@page{size:A4;margin:25mm 20mm}*{box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;font-size:12pt;line-height:1.6;color:#1f2937;background:#fff}
.chapter-title{font-size:22pt;font-weight:700;color:#111827;margin-bottom:.25rem}
.book-name{font-size:11pt;color:#9ca3af;font-style:italic;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #e5e7eb}
p{margin:0 0 .9em}h2{font-size:15pt;font-weight:600;margin:2rem 0 .5rem}
h3{font-size:13pt;font-weight:600;margin:1.5rem 0 .4rem}
blockquote{border-left:3px solid #9ca3af;padding-left:1.25rem;color:#6b7280;font-style:italic;margin:1.5rem 0}
ul{list-style:disc;padding-left:1.75rem;margin:.6rem 0}ol{list-style:decimal;padding-left:1.75rem;margin:.6rem 0}
li{margin-bottom:.3rem}code{background:#f3f4f6;padding:.1em .35em;border-radius:3px;font-size:.9em;font-family:monospace}
pre{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:1rem;margin:1.5rem 0}
table{border-collapse:collapse;width:100%;margin:1rem 0}td,th{border:1px solid #d1d5db;padding:.45rem .7rem}
th{background:#f9fafb;font-weight:600}hr{border:none;border-top:1px solid #e5e7eb;margin:2rem 0}
strong{font-weight:700}a{color:#3b82f6}
</style></head><body>
<div class="chapter-title">${ch.title || 'Untitled Chapter'}</div>
<div class="book-name">from: ${book.title || 'Book'}</div>
<div>${ch.content || '<p><em>No content yet.</em></p>'}</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /:id — Single book + all chapters ────────────────────────────────────
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
router.put('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, description, coverImage, genre, status, characters, outline, scratchpad } = req.body;

        const VALID_STATUSES = ['draft', 'in_progress', 'published', 'archived'];

        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (title !== undefined)       updateData.title       = title.trim();
        if (description !== undefined) updateData.description = description;
        if (coverImage !== undefined)  updateData.coverImage  = coverImage;
        if (genre !== undefined)       updateData.genre       = genre.trim();
        if (characters !== undefined)  updateData.characters  = characters;
        if (outline !== undefined)     updateData.outline     = outline;
        if (scratchpad !== undefined)  updateData.scratchpad  = scratchpad;

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
            const chaptersSnap = await bookRef.collection('chapters').get();

            if (!chaptersSnap.empty) {
                const BATCH_SIZE = 400;
                const docs = chaptersSnap.docs;
                for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                    const batch = db.batch();
                    docs.slice(i, i + BATCH_SIZE).forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                }
            }

            await bookRef.delete();
            return res.status(200).json({ message: 'Book and all chapters deleted permanently' });
        } else {
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
        const { title, content, order, status, synopsis, color } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newChapter = {
            title: title.trim(),
            content: content || '',
            order: order ?? 0,
            status: status || 'draft',
            synopsis: synopsis || '',
            color: color || '',
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
router.put('/:bookId/chapters/:chapterId', validateFirebaseIdToken, async (req, res) => {
    try {
        const { title, content, order, status, synopsis, color } = req.body;
        const { bookId, chapterId } = req.params;

        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (title !== undefined)    updateData.title    = title.trim();
        if (content !== undefined)  updateData.content  = content;
        if (order !== undefined)    updateData.order    = order;
        if (status !== undefined)   updateData.status   = status;
        if (synopsis !== undefined) updateData.synopsis = synopsis;
        if (color !== undefined)    updateData.color    = color;

        await db
            .collection('books')
            .doc(bookId)
            .collection('chapters')
            .doc(chapterId)
            .update(updateData);

        // Sync wordCount on the book whenever chapter content changes
        if (content !== undefined) {
            syncBookWordCount(bookId); // async, don't block response
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