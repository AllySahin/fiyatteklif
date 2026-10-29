import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database dosyası yolu
const DB_PATH = path.join(__dirname, '..', 'database', 'vefa.db');

// Database klasörünün var olduğundan emin ol
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);
export let supabase = null;

export async function getSupabaseClient() {
  if (!isSupabaseEnabled) return null;
  if (!supabase) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return supabase;
}

// SQLite veritabanı bağlantısı
let db = null;

// Promise-based wrappers
export function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('SQLite bağlantı hatası:', err);
      } else {
        console.log('SQLite veritabanı bağlantısı kuruldu:', DB_PATH);
        initializeTables();
      }
    });
    
    // Manual promise wrappers for sqlite3
    db.runAsync = function(sql, params = []) {
      return new Promise((resolve, reject) => {
        this.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    };
    
    db.getAsync = promisify(db.get.bind(db));
    db.allAsync = promisify(db.all.bind(db));
    db.execAsync = promisify(db.exec.bind(db));
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('SQLite kapatma hatası:', err);
      } else {
        console.log('SQLite veritabanı bağlantısı kapatıldı.');
      }
    });
    db = null;
  }
}

// Tabloları otomatik oluştur
async function initializeTables() {
  if (!db) return;

  try {
    // Customers tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Customers (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        CustomerId TEXT NOT NULL UNIQUE,
        CompanyName TEXT NOT NULL,
        AuthorizedPerson TEXT,
        Email TEXT,
        Phone TEXT,
        Address TEXT,
        TaxOffice TEXT,
        TaxNo TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        CreatedBy TEXT,
        UpdatedAt DATETIME,
        UpdatedBy TEXT,
        IsDeleted INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS IX_Customers_CompanyName ON Customers(CompanyName);
      CREATE INDEX IF NOT EXISTS IX_Customers_Email ON Customers(Email);
    `);

    // Quotes tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Quotes (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        QuoteId TEXT NOT NULL UNIQUE,
        Date TEXT NOT NULL,
        ValidUntil TEXT,
        Category TEXT,
        CustomerCompanyName TEXT,
        CustomerAuthorizedPerson TEXT,
        CustomerEmail TEXT,
        CustomerPhone TEXT,
        CustomerAddress TEXT,
        ItemsJson TEXT,
        TotalAmount REAL,
        Status TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        CreatedByName TEXT,
        CreatedByPhone TEXT,
        UpdatedAt DATETIME,
        IsDeleted INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS IX_Quotes_QuoteId ON Quotes(QuoteId);
      CREATE INDEX IF NOT EXISTS IX_Quotes_CustomerCompanyName ON Quotes(CustomerCompanyName);
      CREATE INDEX IF NOT EXISTS IX_Quotes_Date ON Quotes(Date);
      CREATE INDEX IF NOT EXISTS IX_Quotes_Status ON Quotes(Status);
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS CatalogItems (
        Id TEXT PRIMARY KEY,
        ItemJson TEXT NOT NULL,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt DATETIME
      );
    `);

    // Notes tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Notes (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        NoteId TEXT NOT NULL UNIQUE,
        CustomerName TEXT NOT NULL,
        ContactPerson TEXT,
        Phone TEXT,
        Email TEXT,
        NoteText TEXT,
        Status TEXT,
        Date TEXT,
        Timestamp INTEGER,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        CreatedBy TEXT,
        UpdatedAt DATETIME,
        UpdatedBy TEXT,
        IsArchived INTEGER DEFAULT 0,
        IsDeleted INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS IX_Notes_CustomerName ON Notes(CustomerName);
      CREATE INDEX IF NOT EXISTS IX_Notes_Status ON Notes(Status);
      CREATE INDEX IF NOT EXISTS IX_Notes_IsArchived ON Notes(IsArchived);
      CREATE INDEX IF NOT EXISTS IX_Notes_Timestamp ON Notes(Timestamp);
    `);

    // Tasks tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Tasks (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        TaskId TEXT NOT NULL UNIQUE,
        Title TEXT NOT NULL,
        Description TEXT,
        AssignedToUserId TEXT,
        AssignedToUserName TEXT,
        CreatedByUserId TEXT,
        CreatedByUserName TEXT,
        Priority TEXT,
        Status TEXT DEFAULT 'Bekliyor',
        DueDate TEXT,
        CompletedDate DATETIME,
        RelatedCustomerId TEXT,
        RelatedQuoteId TEXT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt DATETIME,
        IsDeleted INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS IX_Tasks_AssignedToUserId ON Tasks(AssignedToUserId);
      CREATE INDEX IF NOT EXISTS IX_Tasks_CreatedByUserId ON Tasks(CreatedByUserId);
      CREATE INDEX IF NOT EXISTS IX_Tasks_Status ON Tasks(Status);
      CREATE INDEX IF NOT EXISTS IX_Tasks_Priority ON Tasks(Priority);
      CREATE INDEX IF NOT EXISTS IX_Tasks_DueDate ON Tasks(DueDate);
    `);
    
    const catalogRows = await db.allAsync('SELECT Id, ItemJson FROM CatalogItems');
    for (const row of catalogRows) {
      const item = JSON.parse(row.ItemJson);
      if (String(item.category || '').toLowerCase() === 'poly') {
        await db.runAsync('DELETE FROM CatalogItems WHERE Id = ?', [row.Id]);
      }
    }

    const quotes = await db.allAsync('SELECT QuoteId, Category, ItemsJson FROM Quotes');
    for (const quote of quotes) {
      const hasPolyCategory = String(quote.Category || '').toLowerCase() === 'poly';
      const items = quote.ItemsJson ? JSON.parse(quote.ItemsJson) : [];
      const hasPolyItems = Array.isArray(items) && items.some(item => String(item?.category || '').toLowerCase() === 'poly');
      if (hasPolyCategory || hasPolyItems) {
        await db.runAsync('DELETE FROM Quotes WHERE QuoteId = ?', [quote.QuoteId]);
      }
    }

    console.log('SQLite tabloları kontrol edildi/oluşturuldu');
  } catch (err) {
    console.error('Tablo oluşturma hatası:', err);
  }
}
