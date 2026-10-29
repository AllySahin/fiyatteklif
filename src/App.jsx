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

const getApiUrl = (endpoint) => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost ? `http://localhost:8787/api${endpoint}` : `/api${endpoint}`;
};

export default function App() {
  const getCategoryCode = (cat) => (cat === 'myk' ? 'M' : 'I');

  const sanitizeQuotes = (quotesInput) => {
    const list = Array.isArray(quotesInput) ? quotesInput : [];
    const seen = new Set();

    return list.filter((quote) => {
      if (String(quote?.category || quote?.Category || '').toLowerCase() === 'poly') return false;
      if (Array.isArray(quote?.items) && quote.items.some(item => String(item?.category || '').toLowerCase() === 'poly')) return false;
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

  const [customers, setCustomers] = useState([]);

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('teklifpro_notes');
    return saved ? JSON.parse(saved) : MOCK_NOTES;
  });

  const [catalog, setCatalog] = useState(INITIAL_CATALOG);

  // Active Quote Wizard State
  const [wizardCategory, setWizardCategory] = useState('ismakineleri'); // 'ismakineleri' | 'myk'
  const [wizardCustomer, setWizardCustomer] = useState(null);
  const [wizardSelectedItems, setWizardSelectedItems] = useState([]);
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState(null);
  const [editingQuoteId, setEditingQuoteId] = useState(null);

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

  // Backend'den müşterileri yükle
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocalhost ? 'http://localhost:8787/api/customers' : '/api/customers';
        
        const response = await fetch(apiUrl);
        if (response.ok) {
          const result = await response.json();
          if (result.ok && Array.isArray(result.data)) {
            setCustomers(result.data.map(c => ({
              id: c.CustomerId,
              companyName: c.CompanyName,
              authorizedPerson: c.AuthorizedPerson,
              email: c.Email,
              phone: c.Phone,
              address: c.Address,
              taxOffice: c.TaxOffice,
              taxNo: c.TaxNo
            })));
          }
        }
      } catch (error) {
        console.error('Müşteriler yüklenemedi:', error);
        // Hata durumunda mock data kullan
        setCustomers(MOCK_CUSTOMERS);
      }
    };
    
    if (currentUser) {
      loadCustomers();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('teklifpro_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (!currentUser) return;

    const loadCatalog = async () => {
      try {
        const response = await fetch(getApiUrl('/catalog'));
        const result = await response.json();
        if (!response.ok || !result.ok || !Array.isArray(result.data)) {
          throw new Error(result.error || 'Katalog sunucudan yüklenemedi.');
        }
        setCatalog(result.data);
      } catch (error) {
        console.error('Katalog yüklenemedi:', error);
        alert(`Katalog sunucudan yüklenemedi.\n\n${error.message || 'Bağlantı hatası'}`);
      }
    };

    loadCatalog();
  }, [currentUser]);


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
    setEditingQuoteId(null);
    setActiveTab('wizard_category');
  };

  const handleSelectCategory = (catId) => {
    setWizardCategory(catId);
    setActiveTab('wizard_customer');
  };

  const handleCustomerFormSubmit = async (custData) => {
    setWizardCustomer(custData);

    // Auto add customer to saved customers if not already present
    const exists = customers.some(c => c.companyName.toLowerCase() === custData.companyName.toLowerCase());
    if (!exists) {
      const newCustomer = {
        id: `CUST-${Date.now()}`,
        ...custData
      };
      
      // Backend'e kaydet (sessiz modda - alert gösterme)
      await handleAddCustomer(newCustomer, { silent: true });
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
      handleUpdateCatalogBasePrice(itemId, newPrice);
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
    const quoteBeingEdited = editingQuoteId
      ? quotes.find((quote) => quote.id === editingQuoteId)
      : null;
    const generatedQuoteId = quoteBeingEdited?.id || getNextQuoteId(quotes, wizardCategory, now);
    
    // Default valid date 15 days later
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 15);
    const validUntilStr = futureDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const newQuote = {
      ...quoteBeingEdited,
      id: generatedQuoteId,
      date: quoteBeingEdited?.date || todayStr,
      validUntil: quoteBeingEdited?.validUntil || validUntilStr,
      category: wizardCategory,
      customer: wizardCustomer,
      items: wizardSelectedItems,
      totalAmount: calculateQuoteTotal(wizardSelectedItems, wizardCategory),
      status: quoteBeingEdited?.status || 'Gönderildi',
      createdAt: quoteBeingEdited?.createdAt || new Date().toISOString(),
      createdByName: quoteBeingEdited?.createdByName || currentUser.name,
      createdByPhone: quoteBeingEdited?.createdByPhone || currentUser.phone
    };

    setQuotes((prev) => [newQuote, ...prev.filter((quote) => quote.id !== newQuote.id)]);
    setSelectedQuoteForPreview(newQuote);
    setActiveTab('wizard_preview');
  };

  const handleSaveQuote = (savedQuoteData) => {
    if (selectedQuoteForPreview) {
      const quoteToSave = {
        ...selectedQuoteForPreview,
        totalAmount: savedQuoteData?.finalTotal ?? selectedQuoteForPreview.totalAmount,
        pdfFileName: savedQuoteData?.pdfFileName || selectedQuoteForPreview.pdfFileName || `Teklif_${selectedQuoteForPreview.id}.pdf`,
        downloadedAt: savedQuoteData?.downloadedAt || selectedQuoteForPreview.downloadedAt
      };
      setQuotes(prev => [quoteToSave, ...prev.filter((q) => q.id !== quoteToSave.id)]);
      setSelectedQuoteForPreview(quoteToSave);
    }
  };

  const handleSelectQuoteFromDashboard = (quote) => {
    setSelectedQuoteForPreview(quote);
    setEditingQuoteId(null);
    setActiveTab('wizard_preview');
  };

  const handleEditQuote = (quote) => {
    setEditingQuoteId(quote.id);
    setWizardCategory(quote.category);
    setWizardCustomer(quote.customer);
    setWizardSelectedItems(quote.items || []);
    setActiveTab('wizard_customer');
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
    setEditingQuoteId(null);
    setSelectedQuoteForPreview(null);
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
    const savePrice = async () => {
      try {
        const response = await fetch(getApiUrl(`/catalog/${encodeURIComponent(itemId)}/price`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ basePrice: newPrice })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'Katalog fiyatı kaydedilemedi.');
        }
        setCatalog(prev => prev.map(item => item.id === itemId ? result.data : item));
      } catch (error) {
        console.error('Katalog fiyatı kaydedilemedi:', error);
        alert(`Katalog fiyatı kaydedilemedi.\n\n${error.message || 'Bağlantı hatası'}`);
      }
    };
    savePrice();
  };

  const handleAddCatalogItem = async (item) => {
    const response = await fetch(getApiUrl('/catalog'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'Kalem kataloğa kaydedilemedi.');
    }
    setCatalog(prev => prev.some(existing => existing.id === result.data.id) ? prev : [...prev, result.data]);
    return result.data;
  };

  const handleResetCatalog = async () => {
    try {
      const response = await fetch(getApiUrl('/catalog/reset'), { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result.ok || !Array.isArray(result.data)) {
        throw new Error(result.error || 'Katalog sıfırlanamadı.');
      }
      setCatalog(result.data);
    } catch (error) {
      console.error('Katalog sıfırlanamadı:', error);
      alert(`Katalog sıfırlanamadı.\n\n${error.message || 'Bağlantı hatası'}`);
    }
  };

  const handleAddCustomer = async (newCust, options = {}) => {
    const { silent = false } = options;
    
    try {
      // Backend'e kaydet
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost ? 'http://localhost:8787/api/customers' : '/api/customers';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: newCust.id,
          companyName: newCust.companyName,
          authorizedPerson: newCust.authorizedPerson,
          email: newCust.email,
          phone: newCust.phone,
          address: newCust.address,
          taxOffice: newCust.taxOffice,
          taxNo: newCust.taxNo,
          createdBy: currentUser?.name
        })
      });
      
      if (!response.ok) {
        throw new Error('Backend müşteri kaydedemedi');
      }
      
      // Backend'e başarıyla kaydedildi, local state'i güncelle
      setCustomers(prev => [newCust, ...prev]);
      
      // Müşteriye tanıtım maili gönder
      if (newCust.email && !silent) {
        try {
          const mailApiUrl = isLocalhost ? 'http://localhost:8787/api/send-welcome-email' : '/api/send-welcome-email';
          
          const mailResponse = await fetch(mailApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: newCust.email,
              companyName: newCust.companyName
            })
          });
          
          if (mailResponse.ok) {
            console.log('Tanıtım maili gönderildi:', newCust.email);
            alert(`✅ Müşteri kaydedildi!\n\nTanıtım maili ${newCust.email} adresine başarıyla gönderildi.`);
          } else {
            alert(`✅ Müşteri kaydedildi!\n\n⚠️ Ancak tanıtım maili gönderilemedi.\n\nMüşteri: ${newCust.companyName}\nE-posta: ${newCust.email}`);
          }
        } catch (mailError) {
          console.error('Tanıtım maili gönderilemedi:', mailError);
          alert(`✅ Müşteri kaydedildi!\n\n⚠️ Ancak tanıtım maili gönderilemedi.\n\nHata: ${mailError.message || 'Bağlantı hatası'}`);
        }
      } else if (!silent) {
        // E-posta yoksa sadece müşteri eklendi bildirimi
        alert(`✅ Müşteri başarıyla kaydedildi!\n\n${newCust.companyName}`);
      }
    } catch (error) {
      console.error('Müşteri kaydedilemedi:', error);
      if (!silent) {
        alert(`❌ Müşteri kaydedilemedi!\n\nHata: ${error.message || 'Bağlantı hatası'}\n\nLütfen tekrar deneyin.`);
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
            onAddCatalogItem={handleAddCatalogItem}
            onConfirm={handleGenerateQuotePreview}
            onBack={() => setActiveTab('wizard_customer')}
          />
        )}

        {activeTab === 'wizard_preview' && selectedQuoteForPreview && (
          <QuotePreview
            quoteData={selectedQuoteForPreview}
            currentUser={currentUser}
            onSaveQuote={handleSaveQuote}
            onEditQuote={handleEditQuote}
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
