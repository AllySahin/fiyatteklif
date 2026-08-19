import express from 'express';
import { getDb } from './db.js';

const router = express.Router();

// ============================================
// CUSTOMERS API
// ============================================

// Tüm müşterileri getir
router.get('/customers', async (req, res) => {
  try {
    const db = getDb();
    const customers = await db.allAsync('SELECT * FROM Customers WHERE IsDeleted = 0 ORDER BY CreatedAt DESC');
    
    return res.json({ ok: true, data: customers });
  } catch (err) {
    console.error('Müşteri listesi hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Yeni müşteri ekle
router.post('/customers', async (req, res) => {
  try {
    const { customerId, companyName, authorizedPerson, email, phone, address, taxOffice, taxNo, createdBy } = req.body;
    
    if (!customerId || !companyName) {
      return res.status(400).json({ error: 'CustomerId ve CompanyName zorunlu.' });
    }
    
    const db = getDb();
    const result = await db.runAsync(`
      INSERT INTO Customers (CustomerId, CompanyName, AuthorizedPerson, Email, Phone, Address, TaxOffice, TaxNo, CreatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [customerId, companyName, authorizedPerson || null, email || null, 
        phone || null, address || null, taxOffice || null, taxNo || null, createdBy || null]);
    
    return res.json({ ok: true, id: result.lastID });
  } catch (err) {
    console.error('Müşteri ekleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Müşteri güncelle
router.put('/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { companyName, authorizedPerson, email, phone, address, taxOffice, taxNo, updatedBy } = req.body;
    
    const db = getDb();
    await db.runAsync(`
      UPDATE Customers 
      SET CompanyName = ?,
          AuthorizedPerson = ?,
          Email = ?,
          Phone = ?,
          Address = ?,
          TaxOffice = ?,
          TaxNo = ?,
          UpdatedAt = CURRENT_TIMESTAMP,
          UpdatedBy = ?
      WHERE CustomerId = ? AND IsDeleted = 0
    `, [companyName, authorizedPerson || null, email || null, phone || null, 
        address || null, taxOffice || null, taxNo || null, updatedBy || null, customerId]);
    
    return res.json({ ok: true });
  } catch (err) {
    console.error('Müşteri güncelleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// QUOTES API
// ============================================

// Tüm teklifleri getir
router.get('/quotes', async (req, res) => {
  try {
    const db = getDb();
    const quotes = await db.allAsync('SELECT * FROM Quotes WHERE IsDeleted = 0 ORDER BY Date DESC');
    
    // JSON parse items
    const quotesWithItems = quotes.map(q => ({
      ...q,
      items: q.ItemsJson ? JSON.parse(q.ItemsJson) : []
    }));
    
    return res.json({ ok: true, data: quotesWithItems });
  } catch (err) {
    console.error('Teklif listesi hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Yeni teklif ekle
router.post('/quotes', async (req, res) => {
  try {
    const { quoteId, date, validUntil, category, customer, items, totalAmount, status, createdByName, createdByPhone } = req.body;
    
    if (!quoteId || !date) {
      return res.status(400).json({ error: 'QuoteId ve Date zorunlu.' });
    }
    
    const db = getDb();
    const result = await db.runAsync(`
      INSERT INTO Quotes (QuoteId, Date, ValidUntil, Category, CustomerCompanyName, CustomerAuthorizedPerson, 
                         CustomerEmail, CustomerPhone, CustomerAddress, ItemsJson, TotalAmount, Status, 
                         CreatedByName, CreatedByPhone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      quoteId, date, validUntil || null, category || null,
      customer?.companyName || null, customer?.authorizedPerson || null,
      customer?.email || null, customer?.phone || null, customer?.address || null,
      JSON.stringify(items || []), totalAmount || 0, status || 'Bekliyor',
      createdByName || null, createdByPhone || null
    ]);
    
    return res.json({ ok: true, id: result.lastID });
  } catch (err) {
    console.error('Teklif ekleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// NOTES API
// ============================================

// Tüm notları getir
router.get('/notes', async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const db = getDb();
    
    let query = 'SELECT * FROM Notes WHERE IsDeleted = 0';
    if (includeArchived !== 'true') {
      query += ' AND IsArchived = 0';
    }
    query += ' ORDER BY Timestamp DESC';
    
    const notes = await db.allAsync(query);
    
    return res.json({ ok: true, data: notes });
  } catch (err) {
    console.error('Not listesi hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Yeni not ekle
router.post('/notes', async (req, res) => {
  try {
    const { noteId, customerName, contactPerson, phone, email, noteText, status, date, timestamp, createdBy } = req.body;
    
    if (!noteId || !customerName) {
      return res.status(400).json({ error: 'NoteId ve CustomerName zorunlu.' });
    }
    
    const db = getDb();
    const result = await db.runAsync(`
      INSERT INTO Notes (NoteId, CustomerName, ContactPerson, Phone, Email, NoteText, Status, Date, Timestamp, CreatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      noteId, customerName, contactPerson || null, phone || null, email || null,
      noteText || null, status || 'Geri Aranacak', date || null, timestamp || Date.now(), createdBy || null
    ]);
    
    return res.json({ ok: true, id: result.lastID });
  } catch (err) {
    console.error('Not ekleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Not durumunu güncelle
router.put('/notes/:noteId/status', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { status, updatedBy } = req.body;
    
    const db = getDb();
    await db.runAsync(`
      UPDATE Notes 
      SET Status = ?,
          UpdatedAt = CURRENT_TIMESTAMP,
          UpdatedBy = ?
      WHERE NoteId = ? AND IsDeleted = 0
    `, [status, updatedBy || null, noteId]);
    
    return res.json({ ok: true });
  } catch (err) {
    console.error('Not durum güncelleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Notu arşivle/arşivden çıkar
router.put('/notes/:noteId/archive', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { isArchived, updatedBy } = req.body;
    
    const db = getDb();
    await db.runAsync(`
      UPDATE Notes 
      SET IsArchived = ?,
          UpdatedAt = CURRENT_TIMESTAMP,
          UpdatedBy = ?
      WHERE NoteId = ? AND IsDeleted = 0
    `, [isArchived ? 1 : 0, updatedBy || null, noteId]);
    
    return res.json({ ok: true });
  } catch (err) {
    console.error('Not arşivleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// TASKS API
// ============================================

// Tüm görevleri getir
router.get('/tasks', async (req, res) => {
  try {
    const db = getDb();
    const tasks = await db.allAsync('SELECT * FROM Tasks WHERE IsDeleted = 0 ORDER BY CreatedAt DESC');
    
    return res.json({ ok: true, data: tasks });
  } catch (err) {
    console.error('Görev listesi hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Belirli bir kullanıcıya atanan görevleri getir
router.get('/tasks/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();
    const tasks = await db.allAsync('SELECT * FROM Tasks WHERE AssignedToUserId = ? AND IsDeleted = 0 ORDER BY DueDate ASC, Priority DESC', [userId]);
    
    return res.json({ ok: true, data: tasks });
  } catch (err) {
    console.error('Kullanıcı görev listesi hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Yeni görev ekle
router.post('/tasks', async (req, res) => {
  try {
    const { 
      taskId, title, description, assignedToUserId, assignedToUserName,
      createdByUserId, createdByUserName, priority, status, dueDate,
      relatedCustomerId, relatedQuoteId
    } = req.body;
    
    if (!taskId || !title) {
      return res.status(400).json({ error: 'TaskId ve Title zorunlu.' });
    }
    
    const db = getDb();
    const result = await db.runAsync(`
      INSERT INTO Tasks (
        TaskId, Title, Description, AssignedToUserId, AssignedToUserName,
        CreatedByUserId, CreatedByUserName, Priority, Status, DueDate,
        RelatedCustomerId, RelatedQuoteId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      taskId, title, description || null, assignedToUserId || null, assignedToUserName || null,
      createdByUserId || null, createdByUserName || null, priority || 'Orta', status || 'Bekliyor',
      dueDate || null, relatedCustomerId || null, relatedQuoteId || null
    ]);
    
    return res.json({ ok: true, id: result.lastID });
  } catch (err) {
    console.error('Görev ekleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Görev güncelle
router.put('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { 
      title, description, assignedToUserId, assignedToUserName,
      priority, status, dueDate, relatedCustomerId, relatedQuoteId
    } = req.body;
    
    const db = getDb();
    
    // Eğer durum "Tamamlandı" yapılıyorsa, CompletedDate'i set et
    if (status === 'Tamamlandı') {
      await db.runAsync(`
        UPDATE Tasks 
        SET Title = ?,
            Description = ?,
            AssignedToUserId = ?,
            AssignedToUserName = ?,
            Priority = ?,
            Status = ?,
            DueDate = ?,
            RelatedCustomerId = ?,
            RelatedQuoteId = ?,
            CompletedDate = CURRENT_TIMESTAMP,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE TaskId = ? AND IsDeleted = 0
      `, [title, description || null, assignedToUserId || null, assignedToUserName || null,
          priority, status, dueDate || null, relatedCustomerId || null, relatedQuoteId || null, taskId]);
    } else {
      await db.runAsync(`
        UPDATE Tasks 
        SET Title = ?,
            Description = ?,
            AssignedToUserId = ?,
            AssignedToUserName = ?,
            Priority = ?,
            Status = ?,
            DueDate = ?,
            RelatedCustomerId = ?,
            RelatedQuoteId = ?,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE TaskId = ? AND IsDeleted = 0
      `, [title, description || null, assignedToUserId || null, assignedToUserName || null,
          priority, status, dueDate || null, relatedCustomerId || null, relatedQuoteId || null, taskId]);
    }
    
    return res.json({ ok: true });
  } catch (err) {
    console.error('Görev güncelleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Görev durumunu güncelle
router.put('/tasks/:taskId/status', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const db = getDb();
    
    if (status === 'Tamamlandı') {
      await db.runAsync(`
        UPDATE Tasks 
        SET Status = ?,
            CompletedDate = CURRENT_TIMESTAMP,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE TaskId = ? AND IsDeleted = 0
      `, [status, taskId]);
    } else {
      await db.runAsync(`
        UPDATE Tasks 
        SET Status = ?,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE TaskId = ? AND IsDeleted = 0
      `, [status, taskId]);
    }
    
    return res.json({ ok: true });
  } catch (err) {
    console.error('Görev durum güncelleme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Görevi sil (soft delete)
router.delete('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const db = getDb();
    await db.runAsync(`
      UPDATE Tasks 
      SET IsDeleted = 1,
          UpdatedAt = CURRENT_TIMESTAMP
      WHERE TaskId = ?
    `, [taskId]);
    
    return res.json({ ok: true });
  } catch (err) {
    console.error('Görev silme hatası:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
