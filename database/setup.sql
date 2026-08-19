-- VEFA Teklif Sistemi - MS SQL Server Veritabanı Kurulumu
-- Tarih: 2026-08-14

USE SiteDB;
GO

-- Customers (Müşteriler) Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        Id INT PRIMARY KEY IDENTITY(1,1),
        CustomerId NVARCHAR(50) NOT NULL UNIQUE,
        CompanyName NVARCHAR(200) NOT NULL,
        AuthorizedPerson NVARCHAR(100),
        Email NVARCHAR(100),
        Phone NVARCHAR(50),
        Address NVARCHAR(500),
        TaxOffice NVARCHAR(100),
        TaxNo NVARCHAR(50),
        CreatedAt DATETIME DEFAULT GETDATE(),
        CreatedBy NVARCHAR(100),
        UpdatedAt DATETIME,
        UpdatedBy NVARCHAR(100),
        IsDeleted BIT DEFAULT 0
    );
    
    CREATE INDEX IX_Customers_CompanyName ON Customers(CompanyName);
    CREATE INDEX IX_Customers_Email ON Customers(Email);
    PRINT 'Customers tablosu oluşturuldu.';
END
ELSE
BEGIN
    PRINT 'Customers tablosu zaten mevcut.';
END
GO

-- Quotes (Teklifler) Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Quotes')
BEGIN
    CREATE TABLE Quotes (
        Id INT PRIMARY KEY IDENTITY(1,1),
        QuoteId NVARCHAR(50) NOT NULL UNIQUE,
        Date DATE NOT NULL,
        ValidUntil DATE,
        Category NVARCHAR(50),
        CustomerCompanyName NVARCHAR(200),
        CustomerAuthorizedPerson NVARCHAR(100),
        CustomerEmail NVARCHAR(100),
        CustomerPhone NVARCHAR(50),
        CustomerAddress NVARCHAR(500),
        ItemsJson NVARCHAR(MAX), -- JSON formatında items dizisi
        TotalAmount DECIMAL(18,2),
        Status NVARCHAR(50), -- 'Gönderildi', 'Onaylandı', 'Bekliyor'
        CreatedAt DATETIME DEFAULT GETDATE(),
        CreatedByName NVARCHAR(100),
        CreatedByPhone NVARCHAR(50),
        UpdatedAt DATETIME,
        IsDeleted BIT DEFAULT 0
    );
    
    CREATE INDEX IX_Quotes_QuoteId ON Quotes(QuoteId);
    CREATE INDEX IX_Quotes_CustomerCompanyName ON Quotes(CustomerCompanyName);
    CREATE INDEX IX_Quotes_Date ON Quotes(Date);
    CREATE INDEX IX_Quotes_Status ON Quotes(Status);
    PRINT 'Quotes tablosu oluşturuldu.';
END
ELSE
BEGIN
    PRINT 'Quotes tablosu zaten mevcut.';
END
GO

-- Notes (Müşteri Notları) Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notes')
BEGIN
    CREATE TABLE Notes (
        Id INT PRIMARY KEY IDENTITY(1,1),
        NoteId NVARCHAR(50) NOT NULL UNIQUE,
        CustomerName NVARCHAR(200) NOT NULL,
        ContactPerson NVARCHAR(100),
        Phone NVARCHAR(50),
        Email NVARCHAR(100),
        NoteText NVARCHAR(MAX),
        Status NVARCHAR(50), -- 'Teklif Gönderildi', 'Geri Aranacak', 'Fiyat Bekliyor', 'Anlaşıldı'
        Date NVARCHAR(50), -- Formatlanmış tarih string
        Timestamp BIGINT, -- Unix timestamp
        CreatedAt DATETIME DEFAULT GETDATE(),
        CreatedBy NVARCHAR(100),
        UpdatedAt DATETIME,
        UpdatedBy NVARCHAR(100),
        IsArchived BIT DEFAULT 0,
        IsDeleted BIT DEFAULT 0
    );
    
    CREATE INDEX IX_Notes_CustomerName ON Notes(CustomerName);
    CREATE INDEX IX_Notes_Status ON Notes(Status);
    CREATE INDEX IX_Notes_IsArchived ON Notes(IsArchived);
    CREATE INDEX IX_Notes_Timestamp ON Notes(Timestamp);
    PRINT 'Notes tablosu oluşturuldu.';
END
ELSE
BEGIN
    PRINT 'Notes tablosu zaten mevcut.';
END
GO

-- Tasks (Görevler) Tablosu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tasks')
BEGIN
    CREATE TABLE Tasks (
        Id INT PRIMARY KEY IDENTITY(1,1),
        TaskId NVARCHAR(50) NOT NULL UNIQUE,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        AssignedToUserId NVARCHAR(50), -- PRESET_USERS'dan id
        AssignedToUserName NVARCHAR(100),
        CreatedByUserId NVARCHAR(50),
        CreatedByUserName NVARCHAR(100),
        Priority NVARCHAR(20), -- 'Düşük', 'Orta', 'Yüksek', 'Acil'
        Status NVARCHAR(50) DEFAULT 'Bekliyor', -- 'Bekliyor', 'Devam Ediyor', 'Tamamlandı', 'İptal'
        DueDate DATE,
        CompletedDate DATETIME,
        RelatedCustomerId NVARCHAR(50), -- İlişkili müşteri (opsiyonel)
        RelatedQuoteId NVARCHAR(50), -- İlişkili teklif (opsiyonel)
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        IsDeleted BIT DEFAULT 0
    );
    
    CREATE INDEX IX_Tasks_AssignedToUserId ON Tasks(AssignedToUserId);
    CREATE INDEX IX_Tasks_CreatedByUserId ON Tasks(CreatedByUserId);
    CREATE INDEX IX_Tasks_Status ON Tasks(Status);
    CREATE INDEX IX_Tasks_Priority ON Tasks(Priority);
    CREATE INDEX IX_Tasks_DueDate ON Tasks(DueDate);
    PRINT 'Tasks tablosu oluşturuldu.';
END
ELSE
BEGIN
    PRINT 'Tasks tablosu zaten mevcut.';
END
GO

PRINT '';
PRINT '==============================================';
PRINT 'Veritabanı kurulumu tamamlandı!';
PRINT '==============================================';
PRINT 'Oluşturulan tablolar:';
PRINT '  - Customers (Müşteriler)';
PRINT '  - Quotes (Teklifler)';
PRINT '  - Notes (Notlar)';
PRINT '  - Tasks (Görevler)';
PRINT '';
