const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse the JSON and the urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Access for static files from the source directory
app.use(express.static(path.join(__dirname, 'source')));

// API route to get created notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes data' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// API route to save a new note
app.post('/api/notes', (req, res) => {
    const newNote = { id: uniqid(), ...req.body };
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes data' });
            return;
        }
        const notes = JSON.parse(data);
        notes.push(newNote);
        fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to save new note' });
                return;
            }
            res.json(newNote);
        });
    });
});

// API route to delete a note
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes data' });
            return;
        }
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);
        fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to delete note' });
                return;
            }
            res.json({ success: true });
        });
    });
});

// Route to notes.html
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'source', 'notes.html'));
});

// Route to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'source', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});