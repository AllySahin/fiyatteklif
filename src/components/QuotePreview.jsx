import React, { useState, useRef, useMemo } from 'react';
import { ArrowLeft, Download, Mail, Share2, CheckCircle, Edit3, Send, X, Copy, FileText, Plus, Trash2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function QuotePreview({ quoteData, currentUser, onSaveQuote, onBack }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const pdfContainerRef = useRef(null);

  const { customer, items, date, validUntil, id: quoteId, category, createdByName, createdByPhone } = quoteData;
  const isIsMakinesi = category === 'ismakineleri';
  const isMyk = category === 'myk';

  const mykImportantNotes = [
    'MYK Belgesi, 5544 sayılı Mesleki Yeterlilik Kurumu Kanunu kapsamında düzenlenmektedir.',
    'Belge geçerlilik süresi 5 yıldır.',
    '6331 sayılı İş Sağlığı ve Güvenliği Kanunu kapsamında birçok iş makinesinin operasyonu için MYK belgesi zorunludur.',
    'Sınav tarihi, başvuruların tamamlanmasının ardından tarafınıza bildirilecektir.',
    `Teklif fiyatlarımız ${validUntil} tarihine kadar geçerlidir.`,
    'Teklif revize talebinizi 2 gün içerisinde bildirmenizi rica ederiz.'
  ];

  const mykTermsNotes = [
    'MYK Sınav ve Belgelendirme Ücretlerine sınav hakkı (teorik ve performans) dahildir.',
    'Belgelendirme süreçleri MYK ve TURKAK rehberlerine uygun olarak yürütülür.',
    'Fiyatlarımıza KDV dahildir.',
    'Belge basım ücreti her belge için 1.500 TL dir.',
    `Teklifimiz ${validUntil} tarihine kadar geçerlidir.`,
    'Teklif revize talebinizi 2 gün içerisinde bildirmenizi rica ederiz.'
  ];

  const issuerName = createdByName || currentUser?.name || 'Alparslan Kavuştu';
  const issuerPhone = createdByPhone || currentUser?.phone || '+90 505 251 17 36';
  const [mykTermsText, setMykTermsText] = useState(mykTermsNotes.join('\n'));
  const mykTermsLines = mykTermsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // Editable Terms & Conditions State
  const [paymentTermNote, setPaymentTermNote] = useState('NOT: TEKLİF ONAYLANDIKTAN SONRA 15 İŞ GÜNÜ İÇERİSİNDE ÖDEME TAHSİL EDİLİR.');
  const [examPlanNote, setExamPlanNote] = useState(
    category === 'myk'
      ? 'MYK BELGELENDİRME TEKLİFİNİN KABULÜNDEN SONRAKİ AY İÇERİSİNDE SINAV PLANLANIR.'
      : 'İŞ MAKİNELERİ OPERATÖRLÜK BELGELENDİRME TEKLİFİNİN KABULÜNDEN SONRAKİ AY İÇERİSİNDE SINAV PLANLANIR.'
  );
  const [documentsHeader, setDocumentsHeader] = useState(
    category === 'myk' ? 'MYK BELGELENDİRME KAYIT EVRAKLARI:' : 'İŞ MAKİNELERİ OPERATÖRLÜK KAYIT EVRAKLARI:'
  );
  const [registrationDocuments, setRegistrationDocuments] = useState([
    'KİMLİK FOTOKOPİSİ, KURSİYER TELEFON NUMARASI, ADRESİ',
    '1 ADET BİYOMETRİK FOTOĞRAF',
    'SÜRÜCÜ OLUR SAĞLIK RAPORU ( E-DEVLETTEN ALINACAK )',
    'ÖĞRENİM BELGESİ ( E-DEVLETTEN ALINACAK )',
    'ADLİ SİCİL KAYDI ( E-DEVLETTEN ALINACAK )'
  ]);
  const [examFeeNote, setExamFeeNote] = useState(
    category === 'myk'
      ? 'MYK SINAV VE BELGE ÜCRETİ BELGE DAHİL TOPLAMA EKLENMİŞTİR.'
      : 'İŞ MAKİNELERİ OPERATÖRLÜK SINAV HARCI KİŞİ BAŞI 1500 TL DİR. SINAVA YAKIN BİR TARİHTE İL MİLLİ EĞİTİM MÜDÜRLÜĞÜ İBANINA FİRMANIZ / ŞAHIS TARAFINDAN YATIRILACAKTIR.'
  );
  const [validityNote, setValidityNote] = useState(`TEKLİF FİYATLARIMIZ ${validUntil} TARİHİNE KADAR GEÇERLİDİR. TEKLİF REVİZE TALEBİNİZİ 2 GÜN İÇERİSİNDE BİLDİRMENİZİ RİCA EDERİZ.`);

  const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  // Total calculation (MYK: parent selected ise child fiyatlari ayrica toplanmaz)
  const grandTotalWithTax = useMemo(() => {
    if (!isMyk) {
      return items.reduce((acc, item) => {
        const unitP = toNumber(item.customPrice ?? item.basePrice);
        const qty = toNumber(item.quantity, 1) || 1;
        return acc + (unitP * qty);
      }, 0);
    }

    const selectedParentCodes = new Set(
      items.filter((it) => it.isParent).map((it) => it.code)
    );

    return items.reduce((acc, item) => {
      if (item.isChild && selectedParentCodes.has(item.parentCode || item.code)) {
        return acc;
      }

      const unitP = toNumber(item.customPrice ?? item.basePrice);
      const qty = toNumber(item.quantity, 1) || 1;
      return acc + (unitP * qty);
    }, 0);
  }, [items, isMyk]);

  const mykDisplayRows = useMemo(() => {
    if (!isMyk) return [];

    const childrenByCode = new Map();
    items.filter((it) => it.isChild).forEach((child) => {
      const key = child.parentCode || child.code;
      if (!childrenByCode.has(key)) childrenByCode.set(key, []);
      childrenByCode.get(key).push(child);
    });

    const consumedChildIds = new Set();
    const rows = [];

    items.forEach((it) => {
      if (it.isParent) {
        const infoChildren = childrenByCode.get(it.code) || [];
        infoChildren.forEach((child) => consumedChildIds.add(child.id));
        rows.push({ ...it, infoChildren });
        return;
      }

      if (it.isChild) {
        if (consumedChildIds.has(it.id)) return;
        rows.push({ ...it, infoChildren: [] });
        return;
      }

      rows.push({ ...it, infoChildren: [] });
    });

    return rows;
  }, [items, isMyk]);

  const formatTL = (val) => {
    return Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
  };

  const defaultMailSubject = `Fiyat Teklifi - ${quoteId} - ${customer.companyName}`;
  const defaultMailBody = `Sayın Yetkili (${customer.authorizedPerson || customer.companyName}),\n\nİhtiyaç duyduğunuz belgelere ait ${quoteId} numaralı fiyat teklifimiz hazırlanmıştır.\n\nGENEL TOPLAM (KDV DAHİL): ${formatTL(grandTotalWithTax)}\nGeçerlilik Tarihi: ${validUntil}\nTeklifi Düzenleyen: ${issuerName} - ${issuerPhone}\n\nDetaylı teklif formu ve evrak listesi belgede yer almaktadır.\n\nSaygılarımızla,\nVefa İş Makineleri & Lonca Belgelendirme`;
  const [mailTo, setMailTo] = useState(customer.email || '');
  const [mailSubjectInput, setMailSubjectInput] = useState(defaultMailSubject);
  const [mailBodyInput, setMailBodyInput] = useState(defaultMailBody);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const buildPdfBlob = async () => {
    const element = pdfContainerRef.current;
    if (!element) throw new Error('PDF container bulunamadı');

    const exportRoot = element.cloneNode(true);
    
    // Keep Tailwind classes and CSS - just override with inline styles
    exportRoot.style.width = '210mm';
    exportRoot.style.minWidth = '210mm';
    exportRoot.style.maxWidth = '210mm';
    exportRoot.style.padding = '0';
    exportRoot.style.margin = '0';
    exportRoot.style.backgroundColor = '#ffffff';

    const hiddenHost = document.createElement('div');
    hiddenHost.style.position = 'fixed';
    hiddenHost.style.left = '-999999px';
    hiddenHost.style.top = '0';
    hiddenHost.style.width = '210mm';
    hiddenHost.style.backgroundColor = '#ffffff';
    hiddenHost.appendChild(exportRoot);
    document.body.appendChild(hiddenHost);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await htmlToImage.toCanvas(exportRoot, {
      cacheBust: true,
      pixelRatio: 2,
      width: exportRoot.scrollWidth,
      height: exportRoot.scrollHeight,
      backgroundColor: '#ffffff',
      skipFonts: true,
      filter: (node) => {
        // Skip external stylesheets to avoid CORS issues
        if (node.tagName === 'LINK' && node.rel === 'stylesheet' && node.href && node.href.includes('googleapis')) {
          return false;
        }
        return true;
      }
    });

    document.body.removeChild(hiddenHost);

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const fitToOnePage = imgHeight <= pageHeight;

    if (fitToOnePage) {
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      return doc.output('blob');
    }

    const pageHeightPx = (canvas.width * pageHeight) / pageWidth;
    let remainingHeight = canvas.height;
    let position = 0;

    while (remainingHeight > 0) {
      const sliceHeight = Math.min(remainingHeight, pageHeightPx);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;

      const ctx = sliceCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, position, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      const sliceData = sliceCanvas.toDataURL('image/png');
      const sliceImgHeight = (sliceCanvas.height * imgWidth) / sliceCanvas.width;

      if (position > 0) doc.addPage();
      doc.addImage(sliceData, 'PNG', 0, 0, imgWidth, sliceImgHeight);

      remainingHeight -= sliceHeight;
      position += sliceHeight;
    }

    return doc.output('blob');
  };

  const generatePdfBlobForMail = async () => await buildPdfBlob();

  const generatePdfBase64ForCurrentQuote = async () => {
    const pdfBlob = await buildPdfBlob();
    return await blobToBase64(pdfBlob);
  };

  // Document array handlers
  const handleAddDocument = () => {
    setRegistrationDocuments(prev => [...prev, 'YENİ EVRAK TANIMI']);
  };

  const handleUpdateDocument = (index, value) => {
    setRegistrationDocuments(prev => prev.map((doc, idx) => idx === index ? value : doc));
  };

  const handleRemoveDocument = (index) => {
    setRegistrationDocuments(prev => prev.filter((_, idx) => idx !== index));
  };

  const getCompanySlug = () => {
    const companyRaw = String(customer?.companyName || 'musteri');
    return companyRaw.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'musteri';
  };

  // PDF Export using html2pdf.js
  const handleDownloadPDF = async () => {
    setIsExporting(true);

    try {
      const company = getCompanySlug();
      const pdfBlob = await buildPdfBlob();
      const fileName = `Teklif_${quoteId}_${company}.pdf`;
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('PDF indirme hatası:', err);
      const errorDetail = err?.message || err?.toString() || 'Detay yok';
      alert(`PDF oluşturulamadı.\n\nHata: ${errorDetail}\n\nKonsolda daha fazla detay var (F12)`);
    } finally {
      setIsExporting(false);
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = `Sayın ${customer.authorizedPerson || customer.companyName},\n\n${category === 'myk' ? 'Lonca MYK Belgelendirme' : 'İş Makineleri Operatörlük'} fiyat teklifimiz ekte hazırlanmıştır.\nTeklif No: ${quoteId}\nToplam Tutar: ${formatTL(grandTotalWithTax)}\nGeçerlilik Tarihi: ${validUntil}\nİlgili Yetkili: ${issuerName} (${issuerPhone})\n\nDetaylı bilgi için bizimle iletişime geçebilirsiniz.`;
    const cleanPhone = (customer.phone || '').replace(/\D/g, '');
    const url = cleanPhone ? `https://wa.me/90${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendMailWithAttachment = async () => {
    if (!mailTo.trim()) {
      alert('Lutfen alici mail adresini girin.');
      return;
    }

    setIsSendingMail(true);

    try {
      const fileName = quoteData?.pdfFileName || `Teklif_${quoteId}_${getCompanySlug()}.pdf`;
      const pdfBase64 = quoteData?.pdfBase64 || await generatePdfBase64ForCurrentQuote();
      
      // Production: use Nginx proxy (/api/), Development: use port 8787
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiBase = String(
        currentUser?.smtpApiBaseUrl || 
        (isLocalhost ? `${window.location.protocol}//${window.location.hostname}:8787` : window.location.origin)
      ).replace(/\/$/, '');

      const payload = {
        to: mailTo.trim(),
        subject: mailSubjectInput,
        text: mailBodyInput,
        attachment: {
          filename: fileName,
          contentBase64: pdfBase64,
          contentType: 'application/pdf'
        }
      };

      const apiBases = [apiBase];
      if (!currentUser?.smtpApiBaseUrl) {
        const proto = window.location.protocol;
        if (window.location.hostname === 'localhost') {
          apiBases.push(`${proto}//127.0.0.1:8787`);
        } else if (window.location.hostname === '127.0.0.1') {
          apiBases.push(`${proto}//localhost:8787`);
        }
      }

      let resp;
      let lastFetchError;
      for (const base of apiBases) {
        try {
          resp = await fetch(`${base}/api/send-quote-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          break;
        } catch (fetchErr) {
          lastFetchError = fetchErr;
        }
      }

      if (!resp) {
        throw new Error(`Mail API baglantisi kurulamadı (8787). Mail server'i calistirin: npm run mail-server. ${lastFetchError?.message || ''}`.trim());
      }

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        throw new Error(data?.error || 'Mail gonderilemedi.');
      }

      alert('Mail basariyla gonderildi.');
      setShowMailModal(false);
    } catch (err) {
      console.error('SMTP mail gonderim hatasi:', err);
      const errorDetail = err?.message || err?.toString() || JSON.stringify(err);
      alert(`Mail gönderilemedi.\n\nHata: ${errorDetail}\n\nMail server çalışıyor mu? Konsolu kontrol edin (F12)`);
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleSaveQuoteWithPdf = async () => {
    setIsSavingQuote(true);

    try {
      const pdfBase64 = await generatePdfBase64ForCurrentQuote();
      const fileName = `Teklif_${quoteId}_${getCompanySlug()}.pdf`;
      await onSaveQuote({
        finalTotal: grandTotalWithTax,
        pdfBase64,
        pdfFileName: fileName
      });
    } catch (err) {
      console.error('Teklif kaydetme hatasi:', err);
      const errorDetail = err?.message || err?.toString() || JSON.stringify(err);
      alert(`Teklif kaydedilemedi.\n\nHata: ${errorDetail}\n\nKonsolda daha fazla detay var (F12)`);
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleCopyMailText = () => {
    navigator.clipboard.writeText(`Konu: ${mailSubjectInput}\n\n${mailBodyInput}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 max-w-6xl mx-auto pb-32">
      {/* Top Action Header */}
      <div className="bg-[#1b365d] text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-md sticky top-0 z-30 no-print">
        <div className="flex justify-between items-center mb-3">
          <button 
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white active-tap"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTermsModal(true)}
              className="bg-amber-400 hover:bg-amber-500 text-[#1b365d] font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow active-tap"
            >
              <Edit3 size={13} />
              <span>Açıklamaları Düzenle</span>
            </button>
          </div>
        </div>
        
        <h1 className="text-xl font-bold">Teklif Belgesi Hazır</h1>
        <p className="text-xs text-blue-200 mt-0.5">İster PDF indirin, ister metinleri düzenleyin.</p>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="px-5 pt-4 grid grid-cols-4 gap-1.5 no-print">
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 font-bold text-[11px] shadow-sm hover:border-[#1b365d] active-tap"
        >
          <Download size={18} className="text-[#ff6b00] mb-1" />
          <span>{isExporting ? 'Bekleyin...' : 'PDF İndir'}</span>
        </button>
        <button
          onClick={() => setShowMailModal(true)}
          className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 font-bold text-[11px] shadow-sm hover:border-[#1b365d] active-tap"
        >
          <Mail size={18} className="text-[#ff6b00] mb-1" />
          <span>Mail Gönder</span>
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 font-bold text-[11px] shadow-sm hover:border-[#1b365d] active-tap"
        >
          <Share2 size={18} className="text-[#ff6b00] mb-1" />
          <span>WhatsApp</span>
        </button>
        <button
          onClick={handleSaveQuoteWithPdf}
          disabled={isSavingQuote}
          className="flex flex-col items-center justify-center p-2.5 bg-[#1b365d] text-white rounded-2xl font-bold text-[11px] shadow-sm active-tap"
        >
          <CheckCircle size={18} className="mb-1" />
          <span>{isSavingQuote ? 'Kaydediliyor...' : 'Kaydet'}</span>
        </button>
      </div>

      {/* Official PDF Document Container (Matches Reference Vefa PDF Layout) */}
      <div className="p-3 overflow-x-auto">
        <div 
          ref={pdfContainerRef}
          id="pdf-quote-content"
          className="bg-white rounded-xl shadow-lg border border-slate-200 text-slate-900 text-[11px] leading-tight font-sans mx-auto"
          style={{ width: '210mm', maxWidth: '100%', boxSizing: 'border-box' }}
        >
          {isMyk ? (
            <>
              {/* SAYFA 1 */}
              <div style={{ minHeight: '297mm', boxSizing: 'border-box' }}>
                <div className="border-b border-slate-200 pb-2">
                  <img
                    src="/teklif/fiyat-teklif-header.png"
                    alt="Vefa Fiyat Teklif Header"
                    crossOrigin="anonymous"
                    className="w-full h-auto"
                  />
                </div>

                <div className="px-6 space-y-2 text-[10px]">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 pt-1">
                  <div><span className="font-bold">TEKLİF NO:</span> {quoteId}</div>
                  <div><span className="font-bold">TARİH:</span> {date}</div>
                  <div><span className="font-bold">KONU:</span> MYK Belgelendirme Hizmetleri</div>
                  <div><span className="font-bold">TELEFON:</span> {issuerPhone}</div>
                  <div><span className="font-bold">İLGİLİ FİRMA:</span> {customer.companyName}</div>
                  <div><span className="font-bold">İLGİLİ:</span> {issuerName}</div>
                  <div><span className="font-bold">İLGİLİ KİŞİ:</span> {customer.authorizedPerson || 'Sayın Yetkili'}</div>
                  <div></div>
                  <div className="col-span-2"><span className="font-bold">E MAİL:</span> {customer.email || '-'}</div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="font-bold">Sayın Yetkili;</p>
                  <p className="font-bold uppercase">MYK (MESLEKİ YETERLİLİK KURUMU) BELGELENDİRME HİZMETLERİ</p>
                  <p>
                    Mesleki Yeterlilik Kurumu (MYK) tarafından yetkilendirilmiş belgelendirme kuruluşumuz bünyesinde,
                    Ulusal Meslek Standartları çerçevesinde sınav ve belgelendirme hizmetleri sunmaktayız. Hizmetlerimize
                    ilişkin fiyat teklifimiz ikinci sayfada yer almakta olup aşağıda belgelendirme süreci hakkında bilgiler verilmektedir.
                  </p>

                  <p className="font-bold uppercase pt-1">BELGELENDİRME SÜRECİ:</p>
                  <p><span className="font-bold">1. BAŞVURU VE EVRAK AŞAMASI</span><br />Adaylar, gerekli belgelerini tamamlayarak başvurularını yaparlar. Başvuru evrakları; kimlik fotokopisi, biyometrik fotoğraf, öğrenim belgesi ve sağlık raporundan oluşmaktadır.</p>
                  <p><span className="font-bold">2. TEORİK SINAV</span><br />Adaylar, ilgili Ulusal Meslek Standardı kapsamında teorik bilgilerini ölçen yazılı sınava tabi tutulurlar. Sınav, akredite sınav merkezlerimizde gerçekleştirilmektedir.</p>
                  <p><span className="font-bold">3. PERFORMANSA DAYALI SINAV</span><br />Teorik sınavda başarılı olan adaylar, pratik becerilerini ölçmeye yönelik performans sınavına alınırlar. Sınav, gerçek iş koşullarını simüle eden ortamlarda uygulanmaktadır.</p>
                  <p><span className="font-bold">4. BELGELENDİRME</span><br />Her iki sınavda başarılı olan adaylara; MYK tarafından tescil edilen, tüm Türkiye'de ve Avrupa Yeterlilik Çerçevesi (AYÇ) kapsamında tanınan Mesleki Yeterlilik Belgesi verilmektedir.</p>

                  <div className="pt-1">
                    <p className="font-bold uppercase">ÖNEMLİ BİLGİLER:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {mykImportantNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                </div>
              </div>

              <div style={{ pageBreakAfter: 'always', breakAfter: 'page', height: '1px' }} />

              {/* SAYFA 2 */}
              <div style={{ minHeight: '297mm', boxSizing: 'border-box' }}>
                <div className="border-b border-slate-200 pb-2">
                  <img
                    src="/teklif/fiyat-teklif-header.png"
                    alt="Vefa Fiyat Teklif Header"
                    crossOrigin="anonymous"
                    className="w-full h-auto"
                  />
                </div>

                <div className="px-6 space-y-2 text-[10px]">
                <div className="flex items-center justify-between pt-1 px-1">
                  <p className="text-[18px] font-bold tracking-wide text-slate-700">FİYAT TEKLİFİ</p>
                  <p className="text-[11px] font-semibold text-slate-600">{customer.companyName} | {quoteId}</p>
                </div>

                <div className="overflow-hidden border border-slate-300">
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr style={{ backgroundColor: '#253b55', color: '#ffffff' }}>
                        <th className="py-1.5 px-2 text-center w-10" style={{ border: '1px solid #cbd5e1' }}>SIRA</th>
                        <th className="py-1.5 px-2 text-left" style={{ border: '1px solid #cbd5e1' }}>BELGE TÜRÜ</th>
                        <th className="py-1.5 px-2 text-center w-16" style={{ border: '1px solid #cbd5e1' }}>MİKTAR</th>
                        <th className="py-1.5 px-2 text-right w-28" style={{ border: '1px solid #cbd5e1' }}>BİRİM FİYATI</th>
                        <th className="py-1.5 px-2 text-center w-24" style={{ border: '1px solid #cbd5e1' }}>ÖLÇÜ</th>
                        <th className="py-1.5 px-2 text-right w-32" style={{ border: '1px solid #cbd5e1' }}>KDV DAHİL TOPLAM FİYATI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mykDisplayRows.map((it, idx) => {
                        const unitGross = toNumber(it.customPrice ?? it.basePrice);
                        const qty = toNumber(it.quantity, 1) || 1;
                        const taxRate = toNumber(it.taxRate, 20);
                        const unitNet = unitGross / (1 + (taxRate / 100));
                        const totalGross = unitGross * qty;

                        return (
                          <tr key={it.id || idx}>
                            <td className="py-1.5 px-2 text-center" style={{ border: '1px solid #cbd5e1' }}>{idx + 1}</td>
                            <td className="py-1.5 px-2 font-semibold uppercase" style={{ border: '1px solid #cbd5e1' }}>
                              <div>{it.code ? `${it.code} ${it.title}` : it.title}</div>
                              {Array.isArray(it.infoChildren) && it.infoChildren.length > 0 && (
                                <ul className="list-disc pl-4 mt-1 normal-case text-[9px] text-slate-600 space-y-0.5 font-medium">
                                  {it.infoChildren.map((child) => (
                                    <li key={child.id}>
                                      {child.unitCode ? `${child.unitCode} - ${child.title}` : child.title}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-center" style={{ border: '1px solid #cbd5e1' }}>{qty}</td>
                            <td className="py-1.5 px-2 text-right" style={{ border: '1px solid #cbd5e1' }}>{formatTL(unitNet)}</td>
                            <td className="py-1.5 px-2 text-center font-semibold uppercase" style={{ border: '1px solid #cbd5e1' }}>{it.unit || 'KURSİYER'}</td>
                            <td className="py-1.5 px-2 text-right font-bold" style={{ border: '1px solid #cbd5e1' }}>{formatTL(totalGross)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: '#253b55', color: '#ffffff' }}>
                        <td colSpan={5} className="py-1.5 px-2 text-right leading-tight font-bold" style={{ border: '1px solid #253b55' }}>
                          GENEL TOPLAM<br />KDV DAHİL
                        </td>
                        <td className="py-1.5 px-2 text-right text-[18px] font-black" style={{ border: '1px solid #253b55' }}>
                          {formatTL(grandTotalWithTax)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="pt-1">
                  <p className="font-bold uppercase">NOTLAR VE ŞARTLAR:</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {mykTermsLines.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end pt-3">
                  <div className="flex items-center justify-center" style={{ width: '17.6rem', height: '8.8rem' }}>
                    <img
                      src="/teklif/kase.png"
                      alt="Kaşe ve imza"
                      crossOrigin="anonymous"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-slate-200 pb-2">
                <img
                  src="/teklif/fiyat-teklif-header.png"
                  alt="Vefa Fiyat Teklif Header"
                  crossOrigin="anonymous"
                  className="w-full h-auto"
                />
              </div>

              <div className="px-6">
              {/* Metadata Table */}
              <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                <table className="w-full text-[10px] border-collapse">
                  <tbody>
                    <tr className="align-top">
                      <td className="w-1/2 p-3 border-r border-slate-200 space-y-1">
                        <div><span className="font-bold text-slate-700">TEKLİF NO:</span> <span className="font-mono font-bold text-[#1b365d]">{quoteId}</span></div>
                        <div><span className="font-bold text-slate-700">KONU:</span> İş Makineleri Eğitimi ve Belgelendirme</div>
                        <div className="pt-1"><span className="font-bold text-slate-700">İLGİLİ FİRMA:</span> <span className="font-bold text-slate-900 uppercase">{customer.companyName}</span></div>
                        <div><span className="font-bold text-slate-700">İLGİLİ KİŞİ:</span> {customer.authorizedPerson || '-'}</div>
                        <div><span className="font-bold text-slate-700">E MAİL:</span> {customer.email || '-'}</div>
                      </td>
                      <td className="w-1/2 p-3 space-y-1">
                        <div><span className="font-bold text-slate-700">TARİH:</span> {date}</div>
                        <div><span className="font-bold text-slate-700">TELEFON:</span> {issuerPhone}</div>
                        <div><span className="font-bold text-slate-700">İLGİLİ:</span> {issuerName}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Salutation */}
              <div className="text-[10px] space-y-1 mt-4">
                <p className="font-bold text-slate-800">Sayın Yetkili;</p>
                <p className="text-slate-600">İhtiyaç duyulan belgelere ait fiyat listesi aşağıda çıkarılmıştır.</p>
              </div>

              {/* Itemized Table */}
              <div className="overflow-hidden rounded-md border border-[#1b365d] mt-4">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1b365d] text-white font-bold text-[9px]" style={{ backgroundColor: '#1b365d', color: '#ffffff' }}>
                      <th className="py-2 px-2 text-center border-r border-blue-900 w-8" style={{ borderRight: '1px solid #1e3a5f' }}>SIRA</th>
                      <th className="py-2 px-2 border-r border-blue-900" style={{ borderRight: '1px solid #1e3a5f' }}>SERTİFİKA SINIFI / EĞİTİM</th>
                      <th className="py-2 px-2 text-center border-r border-blue-900 w-12" style={{ borderRight: '1px solid #1e3a5f' }}>MİKTAR</th>
                      <th className="py-2 px-2 text-right border-r border-blue-900 w-20" style={{ borderRight: '1px solid #1e3a5f' }}>FİYAT</th>
                      <th className="py-2 px-2 text-center border-r border-blue-900 w-16" style={{ borderRight: '1px solid #1e3a5f' }}>ÖLÇÜ</th>
                      <th className="py-2 px-2 text-right w-24">TOPLAM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {items.map((it, idx) => {
                      const unitP = toNumber(it.customPrice ?? it.basePrice);
                      const qty = toNumber(it.quantity, 1) || 1;
                      const taxRate = toNumber(it.taxRate, 10);
                      const unitNet = unitP / (1 + (taxRate / 100));
                      const totalP = unitP * qty;

                      return (
                        <tr key={it.id || idx} className="hover:bg-slate-50" style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td className="py-2 px-2 text-center font-bold border-r border-slate-200" style={{ borderRight: '1px solid #e2e8f0' }}>{idx + 1}</td>
                          <td className="py-2 px-2 border-r border-slate-200" style={{ borderRight: '1px solid #e2e8f0' }}>
                            <div className="font-bold uppercase text-slate-900">{it.title}</div>
                            <div className="text-[8px] text-slate-500">KDV %{taxRate}</div>
                          </td>
                          <td className="py-2 px-2 text-center font-bold border-r border-slate-200" style={{ borderRight: '1px solid #e2e8f0' }}>{qty}</td>
                          <td className="py-2 px-2 text-right border-r border-slate-200" style={{ borderRight: '1px solid #e2e8f0' }}>{formatTL(unitNet)}</td>
                          <td className="py-2 px-2 text-center font-semibold border-r border-slate-200 uppercase" style={{ borderRight: '1px solid #e2e8f0' }}>{it.unit || 'KURSİYER'}</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-900">{formatTL(totalP)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#1b365d] text-white font-bold text-[10px]">
                      <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider">
                        GENEL TOPLAM (KDV DAHİL)
                      </td>
                      <td className="py-2.5 px-2 text-right text-xs font-black text-amber-300">
                        {formatTL(grandTotalWithTax)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* DYNAMIC EDITABLE TERMS & CONDITIONS (PDF Footer notes) */}
              <div className="space-y-1.5 pt-1.5 text-[9px] text-slate-700 leading-tight border-t border-slate-200">
                {paymentTermNote && (
                  <p className="font-bold text-slate-900 uppercase">
                    {paymentTermNote}
                  </p>
                )}

                {examPlanNote && (
                  <p className="font-bold text-slate-800">
                    {examPlanNote}
                  </p>
                )}

                {registrationDocuments.length > 0 && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">{documentsHeader}</p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 font-medium">
                      {registrationDocuments.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {examFeeNote && (
                  <p className="text-slate-800 whitespace-pre-line">
                    {examFeeNote}
                  </p>
                )}

                {validityNote && (
                  <p className="font-bold text-slate-900 whitespace-pre-line">
                    {validityNote}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <div className="flex items-center justify-center" style={{ width: '17.6rem', height: '8.8rem' }}>
                  <img
                    src="/teklif/kase.png"
                    alt="Kaşe ve imza"
                    crossOrigin="anonymous"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Terms & Conditions Edit Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#1b365d]">
                <Edit3 size={20} className="text-[#ff6b00]" />
                <h3 className="font-extrabold text-lg">PDF Şart ve Notları Düzenle</h3>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {isMyk ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notlar ve Şartlar:</label>
                  <p className="text-slate-500 mb-2">Her satır PDF'de ayrı madde olarak gösterilir.</p>
                  <textarea
                    rows={10}
                    value={mykTermsText}
                    onChange={(e) => setMykTermsText(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-medium resize-y"
                  />
                </div>
              ) : (
                <>
                  {/* Ödeme Şartı */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">1. Ödeme Koşulu Notu:</label>
                    <input
                      type="text"
                      value={paymentTermNote}
                      onChange={(e) => setPaymentTermNote(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  {/* Sınav Planlama */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">2. Sınav Planlama Açıklaması:</label>
                    <input
                      type="text"
                      value={examPlanNote}
                      onChange={(e) => setExamPlanNote(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  {/* Evrak Başlığı & Listesi */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">3. Kayıt Evrakları Başlığı & Listesi:</label>
                    <input
                      type="text"
                      value={documentsHeader}
                      onChange={(e) => setDocumentsHeader(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-bold mb-2 text-[#1b365d]"
                    />

                    <div className="space-y-1.5 pl-1">
                      {registrationDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                          <input
                            type="text"
                            value={doc}
                            onChange={(e) => handleUpdateDocument(idx, e.target.value)}
                            className="flex-1 border border-slate-200 rounded-lg p-2 font-medium"
                          />
                          <button
                            onClick={() => handleRemoveDocument(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddDocument}
                        className="text-[#ff6b00] font-bold text-xs flex items-center gap-1 mt-1 pl-5"
                      >
                        <Plus size={14} />
                        <span>Evrak Ekle</span>
                      </button>
                    </div>
                  </div>

                  {/* Sınav Harcı */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">4. Sınav Harcı / Ek Açıklama:</label>
                    <textarea
                      rows={2}
                      value={examFeeNote}
                      onChange={(e) => setExamFeeNote(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-medium resize-none"
                    />
                  </div>

                  {/* Geçerlilik */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">5. Teklif Geçerlilik Notu:</label>
                    <textarea
                      rows={2}
                      value={validityNote}
                      onChange={(e) => setValidityNote(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-medium resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-[#1b365d] text-white py-3 rounded-xl font-bold text-sm shadow active-tap"
              >
                Değişiklikleri Uygula ve Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Sender Modal */}
      {showMailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 text-lg">E-Posta İle Gönder</h3>
              <button onClick={() => setShowMailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alıcı E-Posta:</label>
                <input 
                  type="email" 
                  value={mailTo}
                  onChange={(e) => setMailTo(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Konu:</label>
                <input 
                  type="text" 
                  value={mailSubjectInput}
                  onChange={(e) => setMailSubjectInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mesaj İçeriği:</label>
                <textarea 
                  rows={5} 
                  value={mailBodyInput}
                  onChange={(e) => setMailBodyInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyMailText}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1 active-tap"
              >
                <Copy size={14} />
                <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
              
              <button
                onClick={handleSendMailWithAttachment}
                disabled={isSendingMail}
                className="flex-1 py-2.5 bg-[#ff6b00] disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow active-tap"
              >
                <Send size={14} />
                <span>{isSendingMail ? 'Gönderiliyor...' : 'Mail Gönder (PDF Ekli)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
