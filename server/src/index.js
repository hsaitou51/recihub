const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// SQLite データベース接続
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log('SQLite データベースに接続しました。');
  }
});

// テーブル初期化
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      purchase_price REAL NOT NULL,
      purchase_quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      yield_rate REAL DEFAULT 100,
      allergens TEXT
    )
  `);
});

// カテゴリプレフィックス定義
const categoryPrefixes = {
  '牛肉': 'BF',
  '豚肉': 'PK',
  '鶏肉': 'CK',
  '野菜': 'VG',
  '調味料': 'SE',
  '乳製品': 'DY',
  'その他': 'OT'
};

// 1. 自動採番API
app.get('/api/ingredients/next-code', (req, res) => {
  const { category, name } = req.query;
  const prefix = categoryPrefixes[category] || 'OT';

  const sql = `SELECT code FROM ingredients WHERE code LIKE ? ORDER BY code DESC LIMIT 1`;
  db.get(sql, [`${prefix}%`], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let nextNumber = 1;
    if (row && row.code) {
      const currentNum = parseInt(row.code.replace(prefix, ''), 10);
      if (!isNaN(currentNum)) {
        nextNumber = currentNum + 1;
      }
    }

    const nextCode = `${prefix}${String(nextNumber).padStart(4, '0')}`;
    res.json({ nextCode });
  });
});

// 2. 原材料一覧取得API
app.get('/api/ingredients', (req, res) => {
  db.all('SELECT * FROM ingredients ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 3. 原材料新規登録API
app.post('/api/ingredients', (req, res) => {
  const { code, name, category, purchase_price, purchase_quantity, unit, yield_rate, allergens } = req.body;

  const sql = `
    INSERT INTO ingredients (code, name, category, purchase_price, purchase_quantity, unit, yield_rate, allergens)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [code, name, category, purchase_price, purchase_quantity, unit, yield_rate, allergens];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, message: 'Created successfully' });
    }
  });
});

// 4. 原材料更新（修正）API
app.put('/api/ingredients/:id', (req, res) => {
  const { id } = req.params;
  const { code, name, category, purchase_price, purchase_quantity, unit, yield_rate, allergens } = req.body;

  const sql = `
    UPDATE ingredients 
    SET code = ?, name = ?, category = ?, purchase_price = ?, purchase_quantity = ?, unit = ?, yield_rate = ?, allergens = ?
    WHERE id = ?
  `;
  const params = [code, name, category, purchase_price, purchase_quantity, unit, yield_rate, allergens, id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Updated successfully' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});