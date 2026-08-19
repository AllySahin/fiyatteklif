import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CategorySelect from './components/CategorySelect';
import CustomerForm from './components/CustomerForm';
import ItemSelect from './components/ItemSelect';
import QuotePreview from './components/QuotePreview';
import CustomerNotes from './components/CustomerNotes';
import CustomersList from './components/CustomersList';
import CatalogManagement from './components/CatalogManagement';
import ProfileView from './components/ProfileView';
import LoginScreen from './components/LoginScreen';
import BottomNav from './components/BottomNav';
import QuickNoteModal from './components/QuickNoteModal';
import QuotesArchive from './components/QuotesArchive';
import TaskManagement from './components/TaskManagement';

import { INITIAL_CATALOG } from './data/catalogData';
import { MOCK_QUOTES, MOCK_CUSTOMERS, MOCK_NOTES } from './data/mockData';
import { PRESET_USERS } from './data/usersData';

export default function App() {
  const getCategoryCode = (cat) => (cat === 'myk' ? 'M' : 'I');

  const sanitizeQuotes = (quotesInput) => {
    const list = Array.isArray(quotesInput) ? quotesInput : [];
    const seen = new Set();

    return list.filter((quote) => {
      const id = String(quote?.id || '').trim();
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).map((quote) => {
      // Remove PDF data to save localStorage space (PDFs can be regenerated)
      const { pdfBase64, ...quoteWithoutPdf } = quote;
      return quoteWithoutPdf;
    });
  };

  const getNextQuoteId = (existingQuotes, category, now = new Date()) => {
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const categoryCode = getCategoryCode(category);
    const rx = new RegExp(`^VEFA-${categoryCode}${yyyymm}(\\d{3})$`);

    let maxSeq = 0;
    for (const quote of existingQuotes) {
      const match = String(quote?.id || '').match(rx);
      if (!match) continue;
      const seq = Number(match[1]);
      if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
    }

    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `VEFA-${categoryCode}${yyyymm}${nextSeq}`;
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // User Authentication State (Persistent in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('teklifpro_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persistence State
  const [quotes, setQuotes] = useState(() => {
    const saved = localStorage.getItem('teklifpro_quotes');
    const initial = saved ? JSON.parse(saved) : MOCK_QUOTES;
    return sanitizeQuotes(initial);
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('teklifpro_customers');
    return saved ? JSON.parse(saved) : MOCK_CUSTOMERS;
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('teklifpro_notes');
    return saved ? JSON.parse(saved) : MOCK_NOTES;
  });

  // CATALOG: versioned key — eski önbellekler otomatik atılır
  const CATALOG_VERSION = 'v11';
  const CATALOG_KEY = `teklifpro_catalog_${CATALOG_VERSION}`;
  const [catalog, setCatalog] = useState(() => {
    ['teklifpro_catalog', 'teklifpro_catalog_v1', 'teklifpro_catalog_v2', 'teklifpro_catalog_v3', 'teklifpro_catalog_v4', 'teklifpro_catalog_v5', 'teklifpro_catalog_v6', 'teklifpro_catalog_v7', 'teklifpro_catalog_v8', 'teklifpro_catalog_v9', 'teklifpro_catalog_v10'].forEach(k => localStorage.removeItem(k));
    const saved = localStorage.getItem(CATALOG_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });

  // Active Quote Wizard State
  const [wizardCategory, setWizardCategory] = useState('ismakineleri'); // 'ismakineleri' | 'myk'
  const [wizardCustomer, setWizardCustomer] = useState(null);
  const [wizardSelectedItems, setWizardSelectedItems] = useState([]);
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState(null);

  // Quick Note Modal State
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('teklifpro_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('teklifpro_user');
    }
  }, [currentUser]);

  useEffect(() => {
    // Remove PDF data before saving to prevent localStorage quota issues
    const quotesWithoutPdf = quotes.map(({ pdfBase64, ...quote }) => quote);
    try {
      localStorage.setItem('teklifpro_quotes', JSON.stringify(quotesWithoutPdf));
    } catch (err) {
      console.error('localStorage quota exceeded:', err);
      // If still fails, keep only last 50 quotes
      const recentQuotes = quotesWithoutPdf.slice(0, 50);
      try {
        localStorage.setItem('teklifpro_quotes', JSON.stringify(recentQuotes));
        alert('Eski teklifler otomatik temizlendi (son 50 teklif saklandı).');
      } catch (err2) {
        console.error('localStorage still full after cleanup:', err2);
        alert('localStorage dolu! Lütfen tarayıcı ayarlarından önbelleği temizleyin.');
      }
    }
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('teklifpro_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('teklifpro_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
  }, [catalog]);


  // Auth Handlers
  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('teklifpro_user');
  };

  const handleUpdateCurrentUserProfile = (updates) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  // If not logged in, render LoginScreen!
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Wizard Handlers
  const handleStartNewQuote = () => {
    setWizardCategory('ismakineleri');
    setWizardCustomer(null);
    setWizardSelectedItems([]);
    setSelectedQuoteForPreview(null);
    setActiveTab('wizard_category');
  };

  const handleSelectCategory = (catId) => {
    setWizardCategory(catId);
    setActiveTab('wizard_customer');
  };

  const handleCustomerFormSubmit = (custData) => {
    setWizardCustomer(custData);

    // Auto add customer to saved customers if not already present
    const exists = customers.some(c => c.companyName.toLowerCase() === custData.companyName.toLowerCase());
    if (!exists) {
      setCustomers(prev => [{
        id: `CUST-${Date.now()}`,
        ...custData
      }, ...prev]);
    }

    setActiveTab('wizard_items');
  };

  const handleToggleItem = (item) => {
    setWizardSelectedItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        // Item already exists
        const existing = prev[existingIndex];
        
        // If qty parameter is provided, update quantity
        if (item.qty !== undefined) {
          if (item.qty <= 0) {
            // Remove item if quantity is 0 or less
            return prev.filter(i => i.id !== item.id);
          }
          // Update quantity
          return prev.map((i, idx) => 
            idx === existingIndex ? { ...i, quantity: item.qty } : i
          );
        }
        
        // No qty parameter, toggle off (remove)
        return prev.filter(i => i.id !== item.id);
      } else {
        // Item doesn't exist, add it
        return [...prev, {
          ...item,
          customPrice: item.basePrice,
          quantity: item.qty ?? 1
        }];
      }
    });
  };

  const handleUpdateItemPrice = (itemId, newPrice) => {
    setWizardSelectedItems(prev => prev.map(i => i.id === itemId ? { ...i, customPrice: newPrice } : i));

    // Is makineleri kalemlerinde son girilen fiyat kalici olsun.
    if (wizardCategory === 'ismakineleri') {
      setCatalog(prev => prev.map(i => i.id === itemId ? { ...i, basePrice: newPrice } : i));
    }
  };

  const handleUpdateItemQuantity = (itemId, newQty) => {
    setWizardSelectedItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
  };

  const calculateQuoteTotal = (quoteItems, category) => {
    if (category !== 'myk') {
      return quoteItems.reduce((a, b) => a + ((b.customPrice ?? b.basePrice) * (b.quantity || 1)), 0);
    }

    const selectedParentCodes = new Set(
      quoteItems.filter((it) => it.isParent).map((it) => it.code)
    );

    return quoteItems.reduce((acc, item) => {
      if (item.isChild && selectedParentCodes.has(item.parentCode || item.code)) {
        return acc;
      }
      return acc + ((item.customPrice ?? item.basePrice) * (item.quantity || 1));
    }, 0);
  };

  const handleGenerateQuotePreview = () => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const generatedQuoteId = getNextQuoteId(quotes, wizardCategory, now);
    
    // Default valid date 15 days later
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 15);
    const validUntilStr = futureDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const newQuote = {
      id: generatedQuoteId,
      date: todayStr,
      validUntil: validUntilStr,
      category: wizardCategory,
      customer: wizardCustomer,
      items: wizardSelectedItems,
      totalAmount: calculateQuoteTotal(wizardSelectedItems, wizardCategory),
      status: 'Gönderildi',
      createdAt: new Date().toISOString(),
      createdByName: currentUser.name,
      createdByPhone: currentUser.phone
    };

    setSelectedQuoteForPreview(newQuote);
    setActiveTab('wizard_preview');
  };

  const handleSaveQuoteAndFinish = (savedQuoteData) => {
    if (selectedQuoteForPreview) {
      const finalTotal = typeof savedQuoteData === 'object' && savedQuoteData !== null
        ? savedQuoteData.finalTotal
        : savedQuoteData;

      const quoteToSave = {
        ...selectedQuoteForPreview,
        totalAmount: finalTotal,
        // Don't save PDF to localStorage (can be regenerated, saves storage space)
        pdfFileName: savedQuoteData?.pdfFileName || selectedQuoteForPreview.pdfFileName || `Teklif_${selectedQuoteForPreview.id}.pdf`
      };
      setQuotes(prev => [quoteToSave, ...prev.filter((q) => q.id !== quoteToSave.id)]);
    }
    setActiveTab('dashboard');
  };

  const handleSelectQuoteFromDashboard = (quote) => {
    setSelectedQuoteForPreview(quote);
    setActiveTab('wizard_preview');
  };

  const handleStartQuoteForCustomer = (cust) => {
    setWizardCustomer({
      companyName: cust.companyName || cust.customerName || '',
      authorizedPerson: cust.authorizedPerson || cust.contactPerson || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      taxInfo: ''
    });
    setWizardSelectedItems([]);
    setWizardCategory('ismakineleri');
    setActiveTab('wizard_category');
  };

  // Note Handlers
  const handleSaveNote = (newNote) => {
    setNotes(prev => [{ id: `NOTE-${Date.now()}`, ...newNote }, ...prev]);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleUpdateNoteStatus = (noteId, newStatus) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, status: newStatus } : n));
  };

  const handleArchiveNote = (noteId) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, status: 'Anlaşıldı', isArchived: true } : n));
  };

  // Catalog Price Update
  const handleUpdateCatalogBasePrice = (itemId, newPrice) => {
    setCatalog(prev => prev.map(i => i.id === itemId ? { ...i, basePrice: newPrice } : i));
  };

  // Reset catalog to fresh defaults
  const handleResetCatalog = () => {
    ['teklifpro_catalog', 'teklifpro_catalog_v1', 'teklifpro_catalog_v2', 'teklifpro_catalog_v3', 'teklifpro_catalog_v4', 'teklifpro_catalog_v5', 'teklifpro_catalog_v6', 'teklifpro_catalog_v7', 'teklifpro_catalog_v8', CATALOG_KEY].forEach(k => localStorage.removeItem(k));
    setCatalog(INITIAL_CATALOG);
  };

  const handleAddCustomer = async (newCust) => {
    setCustomers(prev => [newCust, ...prev]);
    
    // Müşteriye tanıtım maili gönder
    if (newCust.email) {
      try {
        // Production: use Nginx proxy (/api/), Development: use port 8787
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocalhost ? 'http://localhost:8787/api/send-welcome-email' : '/api/send-welcome-email';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: newCust.email,
            companyName: newCust.companyName
          })
        });
        
        if (response.ok) {
          console.log('Tanıtım maili gönderildi:', newCust.email);
        }
      } catch (error) {
        console.error('Tanıtım maili gönderilemedi:', error);
        // Hata olsa bile müşteri ekleme devam eder
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-orange-200">
      {/* Active Screen Container */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            quotes={quotes}
            notes={notes}
            currentUser={currentUser}
            onStartNewQuote={handleStartNewQuote}
            onSelectQuote={handleSelectQuoteFromDashboard}
            onViewAllQuotes={() => setActiveTab('quotes')}
            onOpenQuickNote={() => setShowQuickNoteModal(true)}
            onOpenProfile={() => setActiveTab('profile')}
            onUpdateNoteStatus={handleUpdateNoteStatus}
            onArchiveNote={handleArchiveNote}
          />
        )}

        {activeTab === 'wizard_category' && (
          <CategorySelect
            onSelectCategory={handleSelectCategory}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'wizard_customer' && (
          <CustomerForm
            customerData={wizardCustomer}
            savedCustomers={customers}
            onSubmit={handleCustomerFormSubmit}
            onBack={() => setActiveTab('wizard_category')}
          />
        )}

        {activeTab === 'wizard_items' && (
          <ItemSelect
            catalog={catalog}
            selectedItems={wizardSelectedItems}
            category={wizardCategory}
            onToggleItem={handleToggleItem}
            onUpdateItemPrice={handleUpdateItemPrice}
            onUpdateItemQuantity={handleUpdateItemQuantity}
            onConfirm={handleGenerateQuotePreview}
            onBack={() => setActiveTab('wizard_customer')}
          />
        )}

        {activeTab === 'wizard_preview' && selectedQuoteForPreview && (
          <QuotePreview
            quoteData={selectedQuoteForPreview}
            currentUser={currentUser}
            onSaveQuote={handleSaveQuoteAndFinish}
            onBack={() => {
              if (wizardSelectedItems.length > 0) {
                setActiveTab('wizard_items');
              } else {
                setActiveTab('dashboard');
              }
            }}
          />
        )}

        {activeTab === 'notes' && (
          <CustomerNotes
            notes={notes}
            onDeleteNote={handleDeleteNote}
            onUpdateNoteStatus={handleUpdateNoteStatus}
            onArchiveNote={handleArchiveNote}
            onOpenNewNoteModal={() => setShowQuickNoteModal(true)}
            onStartQuoteForCustomer={handleStartQuoteForCustomer}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManagement
            currentUser={currentUser}
            allUsers={PRESET_USERS}
            customers={customers}
            quotes={quotes}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersList
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onStartQuoteForCustomer={handleStartQuoteForCustomer}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotesArchive
            quotes={quotes}
            onBack={() => setActiveTab('dashboard')}
            onSelectQuote={handleSelectQuoteFromDashboard}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogManagement
            catalog={catalog}
            onUpdateBasePrice={handleUpdateCatalogBasePrice}
            onResetCatalog={handleResetCatalog}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateProfile={handleUpdateCurrentUserProfile}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Global Quick Note Modal */}
      {showQuickNoteModal && (
        <QuickNoteModal
          savedCustomers={customers}
          onSaveNote={handleSaveNote}
          onClose={() => setShowQuickNoteModal(false)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartNewQuote={handleStartNewQuote}
      />
    </div>
  );
}
