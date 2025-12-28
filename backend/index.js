const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'data', 'inventory.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0
    )`
  );
});

function runAsync(sql, params = []){
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){
      if(err) reject(err); else resolve(this);
    });
  });
}

function allAsync(sql, params = []){
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if(err) reject(err); else resolve(rows);
    });
  });
}

function getAsync(sql, params = []){
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if(err) reject(err); else resolve(row);
    });
  });
}

app.get('/api/items', async (req, res) => {
  try{
    const rows = await allAsync('SELECT id, name, quantity FROM items ORDER BY rowid DESC');
    res.json(rows);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try{
    const { name, quantity } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const id = uuidv4();
    const q = Number(quantity) || 0;
    await runAsync('INSERT INTO items (id, name, quantity) VALUES (?, ?, ?)', [id, name, q]);
    res.status(201).json({ id, name, quantity: q });
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try{
    const { id } = req.params;
    const { name, quantity } = req.body;
    const existing = await getAsync('SELECT id, name, quantity FROM items WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'not found' });
    const newName = name ?? existing.name;
    const newQuantity = quantity !== undefined ? Number(quantity) : existing.quantity;
    await runAsync('UPDATE items SET name = ?, quantity = ? WHERE id = ?', [newName, newQuantity, id]);
    const updated = await getAsync('SELECT id, name, quantity FROM items WHERE id = ?', [id]);
    res.json(updated);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try{
    const { id } = req.params;
    const info = await runAsync('DELETE FROM items WHERE id = ?', [id]);
    res.json({ deleted: info.changes || 0 });
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete all items
app.post('/api/admin/reset', async (req, res) => {
  try{
    const info = await runAsync('DELETE FROM items');
    res.json({ deleted: info.changes || 0 });
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

// Admin: seed database (optional body { items: [...] })
app.post('/api/admin/seed', async (req, res) => {
  try{
    const defaultItems = [
      { id: 'seed-a-' + Date.now(), name: 'Seed Item A', quantity: 10 },
      { id: 'seed-b-' + (Date.now()+1), name: 'Seed Widget', quantity: 5 },
      { id: 'seed-c-' + (Date.now()+2), name: 'Seed Gadget', quantity: 2 }
    ];
    const toInsert = Array.isArray(req.body?.items) && req.body.items.length ? req.body.items : defaultItems;
    for(const it of toInsert){
      const id = it.id || ('seed-' + Math.random().toString(36).slice(2,9));
      const name = it.name || 'Unnamed';
      const qty = Number(it.quantity) || 0;
      await runAsync('INSERT OR IGNORE INTO items (id,name,quantity) VALUES (?,?,?)', [id, name, qty]);
    }
    const rows = await allAsync('SELECT id,name,quantity FROM items ORDER BY rowid DESC');
    res.json(rows);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Inventory backend listening on ${port}`));
