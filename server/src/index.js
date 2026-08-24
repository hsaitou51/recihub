const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// 1. データの保存先確認（ファイルベースのSQLiteにより、サーバーを再起動してもデータは消えません）
const dbFile = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log(`SQLiteデータベースに接続しました: ${dbFile}`);
  }
});

// 2. データベースのテーブル初期化（アプリ起動時に自動作成）
db.serialize(() => {
  // ① 原材料マスタ テーブル
  db.run(`CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    unit_price REAL,
    yield_rate REAL DEFAULT 100,
    allergens TEXT,
    additives TEXT
  )`, (err) => {
    if (err) console.error('原材料テーブル作成エラー:', err.message);
  });

  // ② レシピ基本情報 テーブル (半製品・完成品共通)
  db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_code TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'SEMI_FINISHED' (半製品) または 'FINISHED' (完成品)
    yield_amount REAL DEFAULT 100 -- 製造量 (g や ml など)
  )`, (err) => {
    if (err) console.error('レシピテーブル作成エラー:', err.message);
  });

  // ③ レシピ構成（中間） テーブル (原材料や他の半製品を紐付ける)
  db.run(`CREATE TABLE IF NOT EXISTS recipe_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER,
    child_id INTEGER,
    child_type TEXT, -- 'INGREDIENT' (原材料) または 'RECIPE' (半製品)
    quantity REAL, -- 使用量 (g や ml)
    FOREIGN KEY(recipe_id) REFERENCES recipes(id)
  )`, (err) => {
    if (err) console.error('レシピ構成テーブル作成エラー:', err.message);
  });
});

// ==========================================
// API ルーティング
// ==========================================

// --- 原材料関連 API ---

// 原材料一覧取得
app.get('/api/ingredients', (req, res) => {
  db.all('SELECT * FROM ingredients ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 原材料登録
app.post('/api/ingredients', (req, res) => {
  const { item_code, name, category, unit_price, yield_rate, allergens, additives } = req.body;
  const query = `INSERT INTO ingredients (item_code, name, category, unit_price, yield_rate, allergens, additives) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [item_code, name, category, unit_price, yield_rate || 100, allergens, additives];

  db.run(query, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '原材料が正常に登録されました' });
  });
});

// --- レシピ関連 API (新機能の土台) ---

// レシピ一覧取得
app.get('/api/recipes', (req, res) => {
  db.all('SELECT * FROM recipes ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// レシピ登録（基本情報 ＋ 構成パーツを同時に登録する想定）
app.post('/api/recipes', (req, res) => {
  const { recipe_code, name, type, yield_amount, items } = req.body; 
  // items は [{ child_id, child_type, quantity }, ...] の配列を想定

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const recipeQuery = `INSERT INTO recipes (recipe_code, name, type, yield_amount) VALUES (?, ?, ?, ?)`;
    db.run(recipeQuery, [recipe_code, name, type, yield_amount || 100], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: err.message });
      }

      const recipeId = this.lastID;

      // 構成パーツ（中間テーブル）の登録
      if (items && Array.isArray(items) && items.length > 0) {
        const itemQuery = `INSERT INTO recipe_items (recipe_id, child_id, child_type, quantity) VALUES (?, ?, ?, ?)`;
        const stmt = db.prepare(itemQuery);

        items.forEach(item => {
          stmt.run(recipeId, item.child_id, item.child_type, item.quantity);
        });
        stmt.finalize();
      }

      db.run('COMMIT', (commitErr) => {
        if (commitErr) {
          return res.status(500).json({ error: commitErr.message });
        }
        res.json({ id: recipeId, message: 'レシピが正常に登録されました' });
      });
    });
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});