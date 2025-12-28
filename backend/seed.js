const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'inventory.db');
const db = new sqlite3.Database(dbPath);

const items = [
  { id: 'a' + Date.now() + Math.floor(Math.random()*1000), name: 'Sample Item A', quantity: 10 },
  { id: 'b' + (Date.now()+1), name: 'Widget', quantity: 5 },
  { id: 'c' + (Date.now()+2), name: 'Gadget', quantity: 2 }
];

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

(async ()=>{
  try{
    for(const it of items){
      await runAsync('INSERT OR IGNORE INTO items (id,name,quantity) VALUES (?,?,?)', [it.id, it.name, it.quantity]);
    }
    const rows = await allAsync("SELECT id,name,quantity FROM items ORDER BY rowid DESC");
    console.log(JSON.stringify(rows, null, 2));
    db.close();
  }catch(e){
    console.error(e);
    db.close();
    process.exit(1);
  }
})();
