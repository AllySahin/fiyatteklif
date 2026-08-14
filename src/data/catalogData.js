// LONCA BELGELENDİRME A.Ş. MYK Sınav Ücret Tarifesi (31.07.2026 Yürürlük)
// İş Makineleri kurs ücretleri kullanıcı tarafından sonradan eklenecek

export const CATEGORIES = [
  { id: 'ismakineleri', name: 'İş Makineleri Eğitimi', icon: 'Truck', count: 'Operatörlük Kursları' },
  { id: 'myk', name: 'MYK Belgelendirme - LONCA', icon: 'Award', count: 'Lonca Belgelendirme A.Ş.' },
  { id: 'poly', name: 'MYK Belgelendirme - POLY', icon: 'Award', count: 'Poly Cert Belgelendirme' }
];

// MYK alt kategorileri - LONCA (akordion grupları)
export const SUBCATEGORIES = [
  { id: 'myk_lonca_insaat',    cat: 'myk', name: 'İnşaat Sektörü' },
  { id: 'myk_lonca_metal',     cat: 'myk', name: 'Metal, Kaynak & Makine' },
  { id: 'myk_lonca_otomotiv',  cat: 'myk', name: 'Otomotiv & Elektrikli Araç' },
  { id: 'myk_lonca_elektrik',  cat: 'myk', name: 'Elektrik & Elektronik' },
  { id: 'myk_lonca_enerji',    cat: 'myk', name: 'Enerji, Gaz & Plastik' },
  { id: 'myk_lonca_tekstil',   cat: 'myk', name: 'Tekstil, Hazır Giyim & Deri' },
  { id: 'myk_lonca_ticaret',   cat: 'myk', name: 'Ticaret (Satış & Pazarlama)' },
  { id: 'myk_lonca_turizm',    cat: 'myk', name: 'Turizm, Konaklama & Yiyecek-İçecek' },
  { id: 'myk_lonca_hizmet',    cat: 'myk', name: 'Toplumsal & Kişisel Hizmetler' },
  { id: 'myk_lonca_ulastirma', cat: 'myk', name: 'Ulaştırma, Lojistik & Haberleşme' }
];

// MYK alt kategorileri - POLY CERT (akordion grupları)
export const POLY_SUBCATEGORIES = [
  { id: 'poly_insaat',     cat: 'poly', name: 'İnşaat Sektörü' },
  { id: 'poly_metal',      cat: 'poly', name: 'Metal, Kaynak & Boru Montajı' },
  { id: 'poly_elektrik',   cat: 'poly', name: 'Elektrik & Elektronik' },
  { id: 'poly_makine',     cat: 'poly', name: 'Makine Bakım & Montaj' },
  { id: 'poly_ulastirma',  cat: 'poly', name: 'Ulaştırma, Lojistik & Vinç' },
  { id: 'poly_ticaret',    cat: 'poly', name: 'Ticaret & Satış' }
];

// İş makineleri alt kategorileri (kurslar sonradan eklenecek)
export const IS_MAKINESI_SUBCATS = [
  { id: 'forklift',    name: 'Forklift Operatörlüğü' },
  { id: 'personelyukyukseltici', name: 'Personel ve Yük Yükseltici Operatörlüğü' },
  { id: 'ekskavator',  name: 'Ekskavatör Operatörlüğü' },
  { id: 'bekoloder',   name: 'Kazıcı Yükleyici (Beko Loder)' },
  { id: 'loder',       name: 'Yükleyici (Loder)' },
  { id: 'istifmakinesi', name: 'İstif Makinesi Operatörlüğü' },
  { id: 'elektriklitranspalet', name: 'Elektrikli Transpalet Operatörlüğü' },
  { id: 'cekmearaci', name: 'Çekme Aracı Operatörlüğü' },
  { id: 'bicerdöver', name: 'Biçerdöver Operatörlüğü' },
  { id: 'yoldisi', name: 'Yoldışı Operatörlüğü' },
  { id: 'mobilvinc',   name: 'Mobil Vinç Operatörlüğü' },
  { id: 'kulevinc',    name: 'Kule Vinç Operatörlüğü' },
  { id: 'kopruluvinc', name: 'Tavan & Köprülü Vinç' },
  { id: 'manlift',     name: 'Manlift / Yükseltici Platform' },
  { id: 'silindir',    name: 'Silindir Operatörlüğü' },
  { id: 'greyder',     name: 'Greyder Operatörlüğü' },
  { id: 'dozer',       name: 'Dozer Operatörlüğü' }
];

// ─── LONCA BELGELENDİRME A.Ş. GERÇEK TARİFE (31.07.2026) ───────────────────

// Birim kodu mapping (MYK standartları + Alternatifler)
const UNIT_CODE_MAP = {
  'B1': 'B1',
  'B2': 'B2',
  'B3': 'B3',
  'B4': 'B4',
  'B5': 'B5',
  'B6': 'B6',
  'B7': 'B7',
  'B8': 'B8',
  'B9': 'B9',
  'B14': 'B14',
  'Alternatif 1': 'Alt-1',
  'Alternatif 2': 'Alt-2',
  'Alternatif 3': 'Alt-3',
  'Alternatif 4': 'Alt-4',
  'Alternatif 5': 'Alt-5',
};

// Helper: parent-child ilişkisi ve birim kodu parse et
const parseItemRelation = (code, title, birimKodu, anaKategoriMi) => {
  // CSV'den gelen direkt bilgiyi kullan
  const isParent = anaKategoriMi === 'EVET';
  const isChild = anaKategoriMi === 'HAYIR' && birimKodu;
  
  // Parent code'u belirle: aynı kod ile başlayan parent'ı bul
  const parentCode = isChild ? code : null;
  
  // Birim kodunu normalize et
  const unitCode = birimKodu ? (UNIT_CODE_MAP[birimKodu] || birimKodu) : null;
  
  return {
    isParent,
    isChild,
    unitCode,
    parentCode
  };
};

const LONCA_ITEMS = [

  // ── İNŞAAT SEKTÖRÜ ──────────────────────────────────────────────────────────
  { cat: 'İNŞAAT', code: '11UY0011-3/03', title: 'AHŞAP KALIPÇI', unitCode: '', price: 16500, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0055-3/01', title: 'ALÇI SIVA UYGULAYICISI', unitCode: '', price: 16800, isParent: true },
  { cat: 'İNŞAAT', code: '18UY0369-3/00', title: 'BETON POMPA OPERATÖRÜ', unitCode: '', price: 32000, isParent: true },
  { cat: 'İNŞAAT', code: '23UY0567-3/00', title: 'BETON TRANSMİKSER OPERATÖRÜ', unitCode: '', price: 30000, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0026-3/01', title: 'DOZER OPERATÖRÜ', unitCode: '', price: 31800, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0048-3/01', title: 'DUVARCISI', unitCode: '', price: 15900, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0028-3/01', title: 'EKSKAVATÖR OPERATÖRÜ', unitCode: '', price: 31800, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0029-3/01', title: 'GREYDER OPERATÖRÜ', unitCode: '', price: 33300, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0057-3/01', title: 'ISI YALITIMCISI', unitCode: '', price: 15300, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0023-3/02', title: 'İNŞAAT BOYACISI (Rev.02)', unitCode: '', price: 14100, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0023-3/03', title: 'İNŞAAT BOYACISI (Rev.03)', unitCode: '', price: 12000, isParent: true },
  { cat: 'İNŞAAT', code: '16UY0253-2/00', title: 'İNŞAAT İŞÇİSİ', unitCode: '', price: 9000, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0056-3/01', title: 'İSKELE KURULUM ELEMANI', unitCode: '', price: 13500, isParent: true },
  { cat: 'İNŞAAT', code: '13UY0171-3/01', title: 'KAZICI YÜKLEYİCİ (BEKO LODER) OPERATÖRÜ', unitCode: '', price: 21750, isParent: true },
  { cat: 'İNŞAAT', code: '22UY0498-3/00', title: 'KULE VİNÇ OPERATÖRÜ', unitCode: '', price: 33000, isParent: true },
  { cat: 'İNŞAAT', code: '13UY0172-3/01', title: 'MOBİL VİNÇ OPERATÖRÜ', unitCode: '', price: 10500, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0027-3/01', title: 'SİLİNDİR OPERATÖRÜ', unitCode: '', price: 25800, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0012-3/03', title: 'BETONARME DEMİRCİSİ', unitCode: '', price: 16500, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0049-3/00', title: 'BETONCU', unitCode: '', price: 16000, isParent: true },

  // ── METAL, KAYNAK & MAKİNE ──────────────────────────────────────────────────
  { cat: 'METAL', code: '11UY0014-3/02', title: 'ALÜMİNYUM KAYNAKÇISI (A1 + B1 + B2 - Tüm Birimler)', unitCode: '', price: 17250, isParent: true },
  { cat: 'METAL', code: '11UY0014-3/02', title: 'ALÜMİNYUM KAYNAKÇISI (B1 - Metal-Ark Asal Gaz Kaynağı (MIG) Alüminyum (131))', unitCode: 'B1', price: 9000, isParent: false },
  { cat: 'METAL', code: '11UY0014-3/02', title: 'ALÜMİNYUM KAYNAKÇISI (B2 - Tungsten Asal Gaz Kaynağı (TIG) - Alüminyum (141))', unitCode: 'B2', price: 9000, isParent: false },
  
  { cat: 'METAL', code: '12UY0082-4/01', title: 'CNC PROGRAMCISI (Sv.4)', unitCode: '', price: 8700, isParent: true },
  { cat: 'METAL', code: '12UY0082-5/01', title: 'CNC PROGRAMCISI (Sv.5)', unitCode: '', price: 9500, isParent: true },
  
  { cat: 'METAL', code: '11UY0010-3/04', title: 'ÇELİK KAYNAKÇISI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 41250, isParent: true },
  { cat: 'METAL', code: '11UY0010-3/04', title: 'ÇELİK KAYNAKÇISI (B1 - Elektrotla Ark Kaynağı (111))', unitCode: 'B1', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3/04', title: 'ÇELİK KAYNAKÇISI (B5 - Tel Elektrotla Metal-Ark Asal Gaz Kaynağı (MIG Kaynağı) (131))', unitCode: 'B5', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3/04', title: 'ÇELİK KAYNAKÇISI (B6 - Tel Elektrotla Metal-Ark Aktif Gaz Kaynağı (MAG Kaynağı) (135))', unitCode: 'B6', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3/04', title: 'ÇELİK KAYNAKÇISI (B7 - Aktif Koruyucu Gazla Özlü Tel Elektrotla Metal-Ark Kaynağı (136))', unitCode: 'B7', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3/04', title: 'ÇELİK KAYNAKÇISI (B9 - Tungsten Asal Gaz Kaynağı (TIG Kaynağı) (141))', unitCode: 'B9', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3/04', title: 'ÇELİK KAYNAKÇISI (B14 - Oksi-Asetilen Kaynağı (311))', unitCode: 'B14', price: 7500, isParent: false },
  
  { cat: 'METAL', code: '11UY0013-3/03', title: 'ENDÜSTRİYEL BORU MONTAJCISI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 23250, isParent: true },
  { cat: 'METAL', code: '11UY0013-3/03', title: 'ENDÜSTRİYEL BORU MONTAJCISI (B1 - Mekanik Boru Tesisatı İmalatı)', unitCode: 'B1', price: 12000, isParent: false },
  { cat: 'METAL', code: '11UY0013-3/03', title: 'ENDÜSTRİYEL BORU MONTAJCISI (B2 - Endüstriyel Boru Montajı)', unitCode: 'B2', price: 12000, isParent: false },
  
  { cat: 'METAL', code: '12UY0081-3/01', title: 'FREZECİ (Sv.3)', unitCode: '', price: 10800, isParent: true },
  { cat: 'METAL', code: '12UY0081-4/01', title: 'FREZECİ (Sv.4)', unitCode: '', price: 13000, isParent: true },
  
  { cat: 'METAL', code: '11UY0016-4/03', title: 'KAYNAK OPERATÖRÜ (Tüm Birimler - Genel Toplam)', unitCode: '', price: 21900, isParent: true },
  { cat: 'METAL', code: '11UY0016-4/03', title: 'KAYNAK OPERATÖRÜ (B2 - MIG Kaynağı (131))', unitCode: 'B2', price: 7800, isParent: false },
  { cat: 'METAL', code: '11UY0016-4/03', title: 'KAYNAK OPERATÖRÜ (B3 - MAG Kaynağı (135))', unitCode: 'B3', price: 7800, isParent: false },
  { cat: 'METAL', code: '11UY0016-4/03', title: 'KAYNAK OPERATÖRÜ (B7 - Toz Altı Ark Kaynağı (121))', unitCode: 'B7', price: 7800, isParent: false },
  
  { cat: 'METAL', code: '10UY0002-3/03', title: 'MAKİNE BAKIMCI (Sv.3) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 20250, isParent: true },
  { cat: 'METAL', code: '10UY0002-3/03', title: 'MAKİNE BAKIMCI (Sv.3) (B1 - Önleyici Bakım)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'METAL', code: '10UY0002-3/03', title: 'MAKİNE BAKIMCI (Sv.3) (B2 - Düzeltici Bakım)', unitCode: 'B2', price: 10500, isParent: false },
  
  { cat: 'METAL', code: '10UY0002-4/03', title: 'MAKİNE BAKIMCI (Sv.4) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 22550, isParent: true },
  { cat: 'METAL', code: '10UY0002-4/03', title: 'MAKİNE BAKIMCI (Sv.4) (B1 - Önleyici Bakım)', unitCode: 'B1', price: 11300, isParent: false },
  { cat: 'METAL', code: '10UY0002-4/03', title: 'MAKİNE BAKIMCI (Sv.4) (B2 - Düzeltici Bakım)', unitCode: 'B2', price: 12050, isParent: false },
  
  { cat: 'METAL', code: '10UY0002-5/03', title: 'MAKİNE BAKIMCI (Sv.5) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 24050, isParent: true },
  { cat: 'METAL', code: '10UY0002-5/03', title: 'MAKİNE BAKIMCI (Sv.5) (B1 - Önleyici Bakım)', unitCode: 'B1', price: 14300, isParent: false },
  { cat: 'METAL', code: '10UY0002-5/03', title: 'MAKİNE BAKIMCI (Sv.5) (B2 - Düzeltici Bakım)', unitCode: 'B2', price: 16550, isParent: false },
  
  { cat: 'METAL', code: '12UY0105-3/01', title: 'MAKİNE MONTAJCISI (Sv.3)', unitCode: '', price: 13500, isParent: true },
  { cat: 'METAL', code: '12UY0105-4/01', title: 'MAKİNE MONTAJCISI (Sv.4)', unitCode: '', price: 15000, isParent: true },
  { cat: 'METAL', code: '14UY0201-3/01', title: 'MATKAP TEZGAH İŞÇİSİ', unitCode: '', price: 6450, isParent: true },
  
  { cat: 'METAL', code: '12UY0084-4', title: 'METAL KESİM OPERATÖRÜ (Tüm Birimler - Genel Toplam)', unitCode: '', price: 30000, isParent: true },
  { cat: 'METAL', code: '12UY0084-4', title: 'METAL KESİM OPERATÖRÜ (A1 + B1) Sac Kesme-Dilimleme', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'METAL', code: '12UY0084-4', title: 'METAL KESİM OPERATÖRÜ (A1 + B2) Lazer Kesim', unitCode: 'B2', price: 10500, isParent: false },
  { cat: 'METAL', code: '12UY0084-4', title: 'METAL KESİM OPERATÖRÜ (A1 + B3) Plazma Kesim', unitCode: 'B3', price: 10500, isParent: false },
  
  { cat: 'METAL', code: '12UY0083-3/02', title: 'METAL KESİMCİ (Tüm Birimler - Genel Toplam)', unitCode: '', price: 50250, isParent: true },
  { cat: 'METAL', code: '12UY0083-3/02', title: 'METAL KESİMCİ (B1 - Giyotin Makasla Kesim)', unitCode: 'B1', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3/02', title: 'METAL KESİMCİ (B2 - Oksi-Gaz ile Kesim)', unitCode: 'B2', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3/02', title: 'METAL KESİMCİ (B3 - Şerit Testere ile Kesim)', unitCode: 'B3', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3/02', title: 'METAL KESİMCİ (B4 - Daire Testere ile Kesim)', unitCode: 'B4', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3/02', title: 'METAL KESİMCİ (B6 - Lazer Kesim)', unitCode: 'B6', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3/02', title: 'METAL KESİMCİ (B7 - Plazma Kesim)', unitCode: 'B7', price: 9000, isParent: false },
  
  { cat: 'METAL', code: '12UY0086-3/02', title: 'METAL LEVHA İŞLEME TEZGÂH İŞÇİSİ', unitCode: '', price: 9800, isParent: true },
  
  { cat: 'METAL', code: '12UY0087-4/02', title: 'METAL LEVHA İŞLEME TEZGÂH OPERATÖRÜ (Tüm Birimler - Genel Toplam)', unitCode: '', price: 30000, isParent: true },
  { cat: 'METAL', code: '12UY0087-4/02', title: 'METAL LEVHA İŞLEME TEZGÂH OPERATÖRÜ (B1 - Abkant Pres)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'METAL', code: '12UY0087-4/02', title: 'METAL LEVHA İŞLEME TEZGÂH OPERATÖRÜ (B3 - Pres)', unitCode: 'B3', price: 10500, isParent: false },
  { cat: 'METAL', code: '12UY0087-4/02', title: 'METAL LEVHA İŞLEME TEZGÂH OPERATÖRÜ (B4 - Punch Pres)', unitCode: 'B4', price: 10500, isParent: false },
  
  { cat: 'METAL', code: '14UY0202-3/01', title: 'NC/CNC TEZGÂH İŞÇİSİ (Sv.3) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 20250, isParent: true },
  { cat: 'METAL', code: '14UY0202-3/01', title: 'NC/CNC TEZGÂH İŞÇİSİ (Sv.3) (B1 - Tornalama İşlemleri)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'METAL', code: '14UY0202-3/01', title: 'NC/CNC TEZGÂH İŞÇİSİ (Sv.3) (B2 - Frezeleme İşlemleri)', unitCode: 'B2', price: 10500, isParent: false },
  
  { cat: 'METAL', code: '14UY0202-4/01', title: 'NC/CNC TEZGÂH İŞÇİSİ (Sv.4) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 21800, isParent: true },
  { cat: 'METAL', code: '14UY0202-4/01', title: 'NC/CNC TEZGÂH İŞÇİSİ (Sv.4) (B1 - Tornalama İşlemleri)', unitCode: 'B1', price: 11300, isParent: false },
  { cat: 'METAL', code: '14UY0202-4/01', title: 'NC/CNC TEZGÂH İŞÇİSİ (Sv.4) (B2 - Frezeleme İşlemleri)', unitCode: 'B2', price: 11300, isParent: false },
  
  { cat: 'METAL', code: '15UY0224-3/00', title: 'PREŞÇİ (Sv.3)', unitCode: '', price: 9800, isParent: true },
  { cat: 'METAL', code: '15UY0224-4/00', title: 'PREŞÇİ (Sv.4)', unitCode: '', price: 12900, isParent: true },
  
  { cat: 'METAL', code: '14UY0200-3/02', title: 'TAŞLAMA TEZGÂH İŞÇİSİ (Sv.3) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 14850, isParent: true },
  { cat: 'METAL', code: '14UY0200-3/02', title: 'TAŞLAMA TEZGÂH İŞÇİSİ (Sv.3) (B1 - Düzlem Yüzey Taşlama)', unitCode: 'B1', price: 7800, isParent: false },
  { cat: 'METAL', code: '14UY0200-3/02', title: 'TAŞLAMA TEZGÂH İŞÇİSİ (Sv.3) (B2 - Silindirik Taşlama)', unitCode: 'B2', price: 7800, isParent: false },
  
  { cat: 'METAL', code: '14UY0200-4/02', title: 'TAŞLAMA TEZGÂH İŞÇİSİ (Sv.4) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 17250, isParent: true },
  { cat: 'METAL', code: '14UY0200-4/02', title: 'TAŞLAMA TEZGÂH İŞÇİSİ (Sv.4) (B1 - Düzlem Yüzey Taşlama)', unitCode: 'B1', price: 9000, isParent: false },
  { cat: 'METAL', code: '14UY0200-4/02', title: 'TAŞLAMA TEZGÂH İŞÇİSİ (Sv.4) (B2 - Silindirik Taşlama)', unitCode: 'B2', price: 9000, isParent: false },
  
  { cat: 'METAL', code: '15UY0227-3/01', title: 'TORNACI (Sv.3, Rev.01)', unitCode: '', price: 12750, isParent: true },
  { cat: 'METAL', code: '15UY0227-4/01', title: 'TORNACI (Sv.4, Rev.01)', unitCode: '', price: 12750, isParent: true },
  { cat: 'METAL', code: '11UY0015-4/03', title: 'DİRENÇ KAYNAK AYARCISI', unitCode: '', price: 7150, isParent: true },

  // ── OTOMOTİV & ELEKTRİKLİ ARAÇ ─────────────────────────────────────────────
  { cat: 'OTOMOTIV', code: '24UY0577-4/00', title: 'BATARYA ELEKTRİKLİ ARAÇ BAKIM ONARIMCISI (Sv.4) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 38550, isParent: true },
  { cat: 'OTOMOTIV', code: '24UY0577-4/00', title: 'BATARYA ELEKTRİKLİ ARAÇ BAKIM ONARIMCISI (Sv.4) (B1 - Mekanik Donanımın Bakım İşlemleri)', unitCode: 'B1', price: 16500, isParent: false },
  { cat: 'OTOMOTIV', code: '24UY0577-4/00', title: 'BATARYA ELEKTRİKLİ ARAÇ BAKIM ONARIMCISI (Sv.4) (B2 - Batarya Sisteminin Bakım İşlemleri)', unitCode: 'B2', price: 22800, isParent: false },
  
  { cat: 'OTOMOTIV', code: '24UY0577-5/00', title: 'BATARYA ELEKTRİKLİ ARAÇ BAKIM ONARIMCISI (Sv.5) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 41250, isParent: true },
  { cat: 'OTOMOTIV', code: '24UY0577-5/00', title: 'BATARYA ELEKTRİKLİ ARAÇ BAKIM ONARIMCISI (Sv.5) (B1 - Mekanik Donanımın Bakım ve Onarım İşlemleri)', unitCode: 'B1', price: 18000, isParent: false },
  { cat: 'OTOMOTIV', code: '24UY0577-5/00', title: 'BATARYA ELEKTRİKLİ ARAÇ BAKIM ONARIMCISI (Sv.5) (B2 - Batarya Sisteminin Bakım İşlemleri)', unitCode: 'B2', price: 24000, isParent: false },
  
  { cat: 'OTOMOTIV', code: '24UY0583-3/00', title: 'ELEKTRİKLİ ARAÇ MONTAJ ELEMANI (Sv.3) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 35250, isParent: true },
  { cat: 'OTOMOTIV', code: '24UY0583-3/00', title: 'ELEKTRİKLİ ARAÇ MONTAJ ELEMANI (Sv.3) (B1 - Mekanik Montaj İşlemleri)', unitCode: 'B1', price: 16500, isParent: false },
  { cat: 'OTOMOTIV', code: '24UY0583-3/00', title: 'ELEKTRİKLİ ARAÇ MONTAJ ELEMANI (Sv.3) (B2 - Elektrik Montaj İşlemleri)', unitCode: 'B2', price: 19500, isParent: false },
  
  { cat: 'OTOMOTIV', code: '24UY0583-4/00', title: 'ELEKTRİKLİ ARAÇ MONTAJ ELEMANI (Sv.4)', unitCode: '', price: 18000, isParent: true },
  
  { cat: 'OTOMOTIV', code: '11UY0007-3/03', title: 'OTOMOTİV MONTAJCISI (Sv.3) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 14850, isParent: true },
  { cat: 'OTOMOTIV', code: '11UY0007-3/03', title: 'OTOMOTİV MONTAJCISI (Sv.3) (B1 - Montaj Hazırlık İşlemleri)', unitCode: 'B1', price: 7800, isParent: false },
  { cat: 'OTOMOTIV', code: '11UY0007-3/03', title: 'OTOMOTİV MONTAJCISI (Sv.3) (B2 - Montaj İşlemleri)', unitCode: 'B2', price: 7800, isParent: false },
  
  { cat: 'OTOMOTIV', code: '11UY0007-4/03', title: 'OTOMOTİV MONTAJCISI (Sv.4) (Tüm Birimler - Genel Toplam)', unitCode: '', price: 17250, isParent: true },
  { cat: 'OTOMOTIV', code: '11UY0007-4/03', title: 'OTOMOTİV MONTAJCISI (Sv.4) (B1 - Montaj Hazırlık İşlemleri)', unitCode: 'B1', price: 9000, isParent: false },
  { cat: 'OTOMOTIV', code: '11UY0007-4/03', title: 'OTOMOTİV MONTAJCISI (Sv.4) (B2 - Montaj İşlemleri)', unitCode: 'B2', price: 9000, isParent: false },
  
  { cat: 'OTOMOTIV', code: '12UY0053-3/03', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.3) - Tüm Birimler', unitCode: '', price: 50100, isParent: true },
  { cat: 'OTOMOTIV', code: '12UY0053-3/03', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.3) (B1 - Elektrotla Ark Kaynağı (111))', unitCode: 'B1', price: 7800, isParent: false },
  { cat: 'OTOMOTIV', code: '12UY0053-3/03', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.3) (B2 - Tungsten Asal Gaz Kaynağı (TIG Kaynağı) - Alüminyum (141))', unitCode: 'B2', price: 7800, isParent: false },
  { cat: 'OTOMOTIV', code: '12UY0053-3/03', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.3) (B5 - Tel Elektrotla Metal-Ark Asal Gaz Kaynağı (MIG Kaynağı) (131))', unitCode: 'B5', price: 7800, isParent: false },
  { cat: 'OTOMOTIV', code: '12UY0053-3/03', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.3) (B6 - Tel Elektrotla Metal-Ark Aktif Gaz Kaynağı (MAG Kaynağı) (135))', unitCode: 'B6', price: 7800, isParent: false },
  { cat: 'OTOMOTIV', code: '12UY0053-3/03', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.3) (B9 - Tungsten Asal Gaz Ark Kaynağı (TIG Kaynağı) (141))', unitCode: 'B9', price: 7800, isParent: false },
  { cat: 'OTOMOTIV', code: '12UY0053-3/03', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.3) (B14 - Oksi-Asetilen Kaynağı (311))', unitCode: 'B14', price: 7800, isParent: false },
  
  { cat: 'OTOMOTIV', code: '12UY0053-4/04', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.4) - Tüm Birimler', unitCode: '', price: 25500, isParent: true },
  { cat: 'OTOMOTIV', code: '12UY0053-4/04', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.4) (B1 - Direnç Nokta Kaynağı (21))', unitCode: 'B1', price: 9000, isParent: false },
  { cat: 'OTOMOTIV', code: '12UY0053-4/04', title: 'OTOMOTİV SAC VE GÖVDE KAYNAKÇISI (Sv.4) (B3 - Tel Elektrotla Metal-Ark Aktif Gaz Kaynağı (MAG Kaynağı) (135))', unitCode: 'B3', price: 9000, isParent: false },

  // ── ENERJİ, GAZ & PLASTİK ───────────────────────────────────────────────────
  { cat: 'ENERJI', code: '11UY0031-3/02', title: 'ISITMA VE DOĞAL GAZ İÇ TESİSAT YAPIM PERSONELI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 30000, isParent: true },
  { cat: 'ENERJI', code: '11UY0031-3/02', title: 'ISITMA VE DOĞAL GAZ İÇ TESİSAT YAPIM PERSONELI (B1 - Doğal Gaz İç Tesisatı Borulama, Test ve Bakım)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'ENERJI', code: '11UY0031-3/02', title: 'ISITMA VE DOĞAL GAZ İÇ TESİSAT YAPIM PERSONELI (B2 - Isıtma Tesisatı Borulama, Test ve Bakım)', unitCode: 'B2', price: 10500, isParent: false },
  { cat: 'ENERJI', code: '11UY0031-3/02', title: 'ISITMA VE DOĞAL GAZ İÇ TESİSAT YAPIM PERSONELI (B3 - Fleks Boru Tesisatı Borulama, Test ve Bakım)', unitCode: 'B3', price: 10500, isParent: false },
  
  { cat: 'ENERJI', code: '09UY0001-3/02', title: 'PLASTİK KAYNAKÇISI', unitCode: '', price: 9150, isParent: true },
  
  { cat: 'ENERJI', code: '11UY0033-3/04', title: 'DOĞAL GAZ ÇELİK BORU KAYNAKÇISI - Tüm Birimler', unitCode: '', price: 32100, isParent: true },
  { cat: 'ENERJI', code: '11UY0033-3/04', title: 'DOĞAL GAZ ÇELİK BORU KAYNAKÇISI (B1 - Elektrotla Ark Kaynağı (111))', unitCode: 'B1', price: 9150, isParent: false },
  { cat: 'ENERJI', code: '11UY0033-3/04', title: 'DOĞAL GAZ ÇELİK BORU KAYNAKÇISI (B2 - Gaz Korumasız Özlü Tel Elektrotla Ark Kaynağı (114))', unitCode: 'B2', price: 9150, isParent: false },
  { cat: 'ENERJI', code: '11UY0033-3/04', title: 'DOĞAL GAZ ÇELİK BORU KAYNAKÇISI (B9 - Tungsten Asal Gaz Ark Kaynağı (TIG Kaynağı) (141))', unitCode: 'B9', price: 9150, isParent: false },
  { cat: 'ENERJI', code: '11UY0033-3/04', title: 'DOĞAL GAZ ÇELİK BORU KAYNAKÇISI (B14 - Oksi-Asetilen Kaynağı (311))', unitCode: 'B14', price: 9150, isParent: false },
  
  { cat: 'ENERJI', code: '11UY0034-3/02', title: 'DOĞAL GAZ POLİETİLEN BORU KAYNAKÇISI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 14775, isParent: true },
  { cat: 'ENERJI', code: '11UY0034-3/02', title: 'DOĞAL GAZ POLİETİLEN BORU KAYNAKÇISI (B1 - Elektrofüzyon Kaynağı ile Anma Çapı 315 mm ve Altındaki Doğal Gaz Polietilen Boruların Birleştirilmesi)', unitCode: 'B1', price: 9150, isParent: false },
  { cat: 'ENERJI', code: '11UY0034-3/02', title: 'DOĞAL GAZ POLİETİLEN BORU KAYNAKÇISI (B2 - Elektrofüzyon Kaynağı ile Doğal Gaz Polietilen Borusuna Semer Mesnet Birleştirilmesi)', unitCode: 'B2', price: 9150, isParent: false },
  
  { cat: 'ENERJI', code: '12UY0069-3/03', title: 'PLASTİK ENJEKSİYON ÜRETİM ELEMANI (Sv.3)', unitCode: '', price: 13500, isParent: true },
  { cat: 'ENERJI', code: '12UY0069-4/03', title: 'PLASTİK ENJEKSİYON ÜRETİM ELEMANI (Sv.4)', unitCode: '', price: 13500, isParent: true },

  // ── ULAŞTIRMA, LOJİSTİK & HABERLEŞME ────────────────────────────────────────────────────
  { cat: 'ULAŞTIRMA', code: '13UY0145-3/04', title: 'ENDÜSTRİYEL TAŞIMACI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 49500, isParent: true },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3/04', title: 'ENDÜSTRİYEL TAŞIMACI (B1 - Endüstriyel Forklift Kullanımı)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3/04', title: 'ENDÜSTRİYEL TAŞIMACI (B2 - Elektrikli Transpalet Kullanımı)', unitCode: 'B2', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3/04', title: 'ENDÜSTRİYEL TAŞIMACI (B3 - Elektrikli İstif Makinesi Kullanımı)', unitCode: 'B3', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3/04', title: 'ENDÜSTRİYEL TAŞIMACI (B4 - Endüstriyel Çekici Kullanımı)', unitCode: 'B4', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3/04', title: 'ENDÜSTRİYEL TAŞIMACI (B5 - Sapancılık)', unitCode: 'B5', price: 10500, isParent: false },
  
  { cat: 'ULAŞTIRMA', code: '17UY0326-3/00', title: 'KAMYON ŞOFÖRÜ', unitCode: '', price: 10000, isParent: true },
  { cat: 'ULAŞTIRMA', code: '15UY0205-3/01', title: 'KÖPRÜLÜ VİNÇ OPERATÖRÜ', unitCode: '', price: 10500, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0327-3/00', title: 'MİNİBÜS ŞOFÖRÜ', unitCode: '', price: 13800, isParent: true },
  { cat: 'ULAŞTIRMA', code: '19UY0390-3/00', title: 'MOTOSİKLETLİ KURYE', unitCode: '', price: 10500, isParent: true },
  
  { cat: 'ULAŞTIRMA', code: '22UY0474-4/00', title: 'POSTA VE KARGO TESLİM ELEMANI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 18750, isParent: true },
  { cat: 'ULAŞTIRMA', code: '22UY0474-4/00', title: 'POSTA VE KARGO TESLİM ELEMANI (B1 - Posta Teslimatı Uygulamaları)', unitCode: 'B1', price: 9750, isParent: false },
  { cat: 'ULAŞTIRMA', code: '22UY0474-4/00', title: 'POSTA VE KARGO TESLİM ELEMANI (B2 - Kargo Teslimatı Uygulamaları)', unitCode: 'B2', price: 9750, isParent: false },
  
  { cat: 'ULAŞTIRMA', code: '17UY0328-3/00', title: 'SERVİS ARACI ŞOFÖRÜ', unitCode: '', price: 12000, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0329-3/00', title: 'ŞEHİR İÇİ TOPLU TAŞIMA OTOBÜS ŞOFÖRÜ', unitCode: '', price: 13800, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0330-3/00', title: 'TAKSİ ŞOFÖRÜ', unitCode: '', price: 13800, isParent: true },
  
  { cat: 'ULAŞTIRMA', code: '17UY0331-3/01', title: 'TEHLİKELİ MADDE TAŞIMACILIĞI ŞOFÖRÜ (Tüm Birimler - Genel Toplam)', unitCode: '', price: 20400, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0331-3/01', title: 'TEHLİKELİ MADDE TAŞIMACILIĞI ŞOFÖRÜ (B1 - Patlayıcı Madde Taşıma)', unitCode: 'B1', price: 13900, isParent: false },
  { cat: 'ULAŞTIRMA', code: '17UY0331-3/01', title: 'TEHLİKELİ MADDE TAŞIMACILIĞI ŞOFÖRÜ (B2 - Radyoaktif Madde Taşıma)', unitCode: 'B2', price: 13900, isParent: false },
  
  { cat: 'ULAŞTIRMA', code: '19UY0387-3/00', title: 'VALE GÖREVLİSİ', unitCode: '', price: 11300, isParent: true },

  // ── TOPLUMSAL & KİŞİSEL HİZMETLER ────────────────────────────────────────────────────
  { cat: 'HIZMET', code: '18UY0344-4/00', title: 'EPİLASYON UZMANI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 13500, isParent: true },
  { cat: 'HIZMET', code: '18UY0344-4/00', title: 'EPİLASYON UZMANI (B1 - Elektro Sistem ile Epilasyon)', unitCode: 'B1', price: 6450, isParent: false },
  { cat: 'HIZMET', code: '18UY0344-4/00', title: 'EPİLASYON UZMANI (B2 - Işık Sistemleri ile Epilasyon)', unitCode: 'B2', price: 7800, isParent: false },
  
  { cat: 'HIZMET', code: '16UY0244-4/02', title: 'GÜZELLİK UZMANI', unitCode: '', price: 16700, isParent: true },
  
  { cat: 'HIZMET', code: '16UY0245-4', title: 'KUAFÖR (Tüm Birimler - Genel Toplam)', unitCode: '', price: 39800, isParent: true },
  { cat: 'HIZMET', code: '16UY0245-4', title: 'KUAFÖR (Alternatif-1) Kadın Kuaförlüğü', unitCode: 'Alt-1', price: 24800, isParent: false },
  { cat: 'HIZMET', code: '16UY0245-4', title: 'KUAFÖR (Alternatif-2) Erkek Kuaförlüğü / Berber', unitCode: 'Alt-2', price: 24800, isParent: false },
  { cat: 'HIZMET', code: '16UY0245-4', title: 'KUAFÖR (Alternatif-3) Kadın + Erkek Kuaförlüğü', unitCode: 'Alt-3', price: 39800, isParent: false },
  { cat: 'HIZMET', code: '16UY0245-4', title: 'KUAFÖR (Alternatif-4) Kadın Saç Kesimi + Geçici Şekil', unitCode: 'Alt-4', price: 15800, isParent: false },
  { cat: 'HIZMET', code: '16UY0245-4', title: 'KUAFÖR (Alternatif-5) Erkek Saç Kesimi, Şekil ve Tıraş', unitCode: 'Alt-5', price: 15800, isParent: false },
  
  { cat: 'HIZMET', code: '16UY0242-3/02', title: 'MAKYAJ UYGULAYICISI (Tüm Birimler - Genel Toplam)', unitCode: '', price: 20700, isParent: true },
  { cat: 'HIZMET', code: '16UY0242-3/02', title: 'MAKYAJ UYGULAYICISI (B1 - Standart Makyaj Uygulamaları)', unitCode: 'B1', price: 10800, isParent: false },
  { cat: 'HIZMET', code: '16UY0242-3/02', title: 'MAKYAJ UYGULAYICISI (B2 - Kalıcı Makyaj Uygulamaları)', unitCode: 'B2', price: 10800, isParent: false },
  
  { cat: 'HIZMET', code: '16UY0247-3/00', title: 'PROTEZ TIRNAK UYGULAYICISI', unitCode: '', price: 15900, isParent: true },

  // ── TİCARET (SATIŞ & PAZARLAMA) ────────────────────────────────────────────────────
  { cat: 'TICARET', code: '17UY0332-4/00', title: 'EMLAK DANIŞMANI', unitCode: '', price: 12000, isParent: true },
  { cat: 'TICARET', code: '17UY0333-5/00', title: 'SORUMLU EMLAK DANIŞMANI', unitCode: '', price: 14300, isParent: true },
  { cat: 'TICARET', code: '17UY0298-4/01', title: 'MOTORLU KARA TAŞITLARI ALIM SATIM DANIŞMANI', unitCode: '', price: 9800, isParent: true },
  { cat: 'TICARET', code: '17UY0299-5/01', title: 'MOTORLU KARA TAŞITLARI ALIM SATIM SORUMLUSU', unitCode: '', price: 12000, isParent: true },

  // ── TURİZM, KONAKLAMA & YİYECEK-İÇECEK ────────────────────────────────────────────────────
  { cat: 'TURIZM', code: '13UY0182-4/01', title: 'AŞÇI (Rev.01)', unitCode: '', price: 30000, isParent: true },
  { cat: 'TURIZM', code: '15UY0216-4/01', title: 'BARİSTA (KAHVE BAR GÖREVLİSİ)', unitCode: '', price: 15700, isParent: true },
  { cat: 'TURIZM', code: '13UY0181-3/01', title: 'DÖNERCİ', unitCode: '', price: 27100, isParent: true },
  { cat: 'TURIZM', code: '13UY0180-3/01', title: 'KEBAPÇI', unitCode: '', price: 17400, isParent: true },
  { cat: 'TURIZM', code: '13UY0183-4/00', title: 'PASTACI (Alternatif 1)', unitCode: '', price: 33100, isParent: true },
];

// ─── POLY CERT BELGELENDİRME FİYAT LİSTESİ ─────────────────────────────────

const POLY_ITEMS = [
  // İNŞAAT SEKTÖRÜ
  { cat: 'İNŞAAT', code: '11UY0011-3', title: 'AHŞAP KALIPÇI', unitCode: '', price: 15300, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0054-3', title: 'ALÇI LEVHA UYGULAYICISI', unitCode: '', price: 15000, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0055-3', title: 'ALÇI SIVA UYGULAYICISI', unitCode: '', price: 15000, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0012-3', title: 'BETONARME DEMİRCİSİ', unitCode: '', price: 16600, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0049-3', title: 'BETONCU', unitCode: '', price: 16050, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0048-3', title: 'DUVARCISI (Tüm Birimler)', unitCode: '', price: 14250, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0048-3', title: 'DUVARCISI (B1 - Genel Duvarcı İşlemleri)', unitCode: 'B1', price: 14250, isParent: false },
  { cat: 'İNŞAAT', code: '12UY0057-3', title: 'ISI YALITIMCISI', unitCode: '', price: 14250, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0023-3', title: 'İNŞAAT BOYACISI', unitCode: '', price: 11625, isParent: true },
  { cat: 'İNŞAAT', code: '16UY0253-2', title: 'İNŞAAT İŞÇİSİ', unitCode: '', price: 9000, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0056-3', title: 'İSKELE KURULUM ELEMANI', unitCode: '', price: 13500, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0050-3', title: 'PANEL KALIPÇI', unitCode: '', price: 16800, isParent: true },
  { cat: 'İNŞAAT', code: '12UY0051-3', title: 'SERAMİK KARO KAPLAMACISI', unitCode: '', price: 16800, isParent: true },
  { cat: 'İNŞAAT', code: '11UY0024-3', title: 'SIVACI', unitCode: '', price: 15000, isParent: true },

  // METAL, KAYNAK & BORU MONTAJI
  { cat: 'METAL', code: '11UY0014-3', title: 'ALÜMİNYUM KAYNAKÇISI (Tüm Birimler)', unitCode: '', price: 9000, isParent: true },
  { cat: 'METAL', code: '11UY0014-3', title: 'ALÜMİNYUM KAYNAKÇISI (B1 - MIG Kaynağı Alüminyum (131))', unitCode: 'B1', price: 9000, isParent: false },
  { cat: 'METAL', code: '11UY0014-3', title: 'ALÜMİNYUM KAYNAKÇISI (B2 - TIG Kaynağı Alüminyum (141))', unitCode: 'B2', price: 9000, isParent: false },
  
  { cat: 'METAL', code: '11UY0010-3', title: 'ÇELİK KAYNAKÇISI (Tüm Birimler)', unitCode: '', price: 7500, isParent: true },
  { cat: 'METAL', code: '11UY0010-3', title: 'ÇELİK KAYNAKÇISI (B1 - Elektrotla Ark Kaynağı (111))', unitCode: 'B1', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3', title: 'ÇELİK KAYNAKÇISI (B6 - MAG Kaynağı (135))', unitCode: 'B6', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3', title: 'ÇELİK KAYNAKÇISI (B9 - TIG Kaynağı (141))', unitCode: 'B9', price: 7500, isParent: false },
  { cat: 'METAL', code: '11UY0010-3', title: 'ÇELİK KAYNAKÇISI (B14 - Oksi-Asetilen Kaynağı (311))', unitCode: 'B14', price: 7500, isParent: false },
  
  { cat: 'METAL', code: '11UY0015-4', title: 'DİRENÇ KAYNAK AYARCISI (Tüm Birimler)', unitCode: '', price: 7125, isParent: true },
  { cat: 'METAL', code: '11UY0015-4', title: 'DİRENÇ KAYNAK AYARCISI (B1 - Direnç Nokta Kaynağı (21))', unitCode: 'B1', price: 7125, isParent: false },
  { cat: 'METAL', code: '11UY0015-4', title: 'DİRENÇ KAYNAK AYARCISI (B2 - Dikiş Direnç Kaynağı (22))', unitCode: 'B2', price: 7125, isParent: false },
  { cat: 'METAL', code: '11UY0015-4', title: 'DİRENÇ KAYNAK AYARCISI (B3 - Projeksiyon Kabartmalı Kaynak (23))', unitCode: 'B3', price: 7125, isParent: false },
  
  { cat: 'METAL', code: '11UY0013-3', title: 'ENDÜSTRİYEL BORU MONTAJCISI (Tüm Birimler)', unitCode: '', price: 12000, isParent: true },
  { cat: 'METAL', code: '11UY0013-3', title: 'ENDÜSTRİYEL BORU MONTAJCISI (B2 - Endüstriyel Boru Montajı)', unitCode: 'B2', price: 12000, isParent: false },
  
  { cat: 'METAL', code: '11UY0016-4', title: 'KAYNAK OPERATÖRÜ (Tüm Birimler)', unitCode: '', price: 7800, isParent: true },
  { cat: 'METAL', code: '11UY0016-4', title: 'KAYNAK OPERATÖRÜ (B3 - MAG Kaynağı (135))', unitCode: 'B3', price: 7800, isParent: false },
  { cat: 'METAL', code: '11UY0016-4', title: 'KAYNAK OPERATÖRÜ (B4 - TIG Kaynağı (141))', unitCode: 'B4', price: 7800, isParent: false },
  { cat: 'METAL', code: '11UY0016-4', title: 'KAYNAK OPERATÖRÜ (B7 - Toz Altı Ark Kaynağı (121))', unitCode: 'B7', price: 7800, isParent: false },
  
  { cat: 'METAL', code: '12UY0083-3', title: 'METAL KESİMCİ (Tüm Birimler)', unitCode: '', price: 9000, isParent: true },
  { cat: 'METAL', code: '12UY0083-3', title: 'METAL KESİMCİ (B1 - Giyotin Makasla Kesim)', unitCode: 'B1', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3', title: 'METAL KESİMCİ (B2 - Oksi-Gaz ile Kesim)', unitCode: 'B2', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3', title: 'METAL KESİMCİ (B3 - Şerit Testere ile Kesim)', unitCode: 'B3', price: 9000, isParent: false },
  { cat: 'METAL', code: '12UY0083-3', title: 'METAL KESİMCİ (B4 - Daire Testere ile Kesim)', unitCode: 'B4', price: 9000, isParent: false },
  
  { cat: 'METAL', code: '12UY0085-3', title: 'METAL SAC İŞLEMECİ', unitCode: '', price: 8100, isParent: true },

  // ELEKTRİK & ELEKTRONİK
  { cat: 'ELEKTRİK', code: '12UY0075-3', title: 'ELEKTRİK PANO MONTAJCISI (Sv.3)', unitCode: '', price: 9750, isParent: true },
  { cat: 'ELEKTRİK', code: '12UY0075-4', title: 'ELEKTRİK PANO MONTAJCISI (Sv.4)', unitCode: '', price: 10500, isParent: true },
  { cat: 'ELEKTRİK', code: '12UY0075-5', title: 'ELEKTRİK PANO MONTAJCISI (Sv.5)', unitCode: '', price: 12750, isParent: true },
  
  { cat: 'ELEKTRİK', code: '15UY0241-3', title: 'ELEKTRİK TESİSATÇISI (Sv.3)', unitCode: '', price: 11250, isParent: true },
  
  { cat: 'ELEKTRİK', code: '15UY0241-4', title: 'ELEKTRİK TESİSATÇISI (Sv.4) - Tüm Birimler', unitCode: '', price: 12000, isParent: true },
  { cat: 'ELEKTRİK', code: '15UY0241-4', title: 'ELEKTRİK TESİSATÇISI (Sv.4) (B1 - Elektrik İç Tesisat Projesi Hazırlama)', unitCode: 'B1', price: 12000, isParent: false },
  { cat: 'ELEKTRİK', code: '15UY0241-4', title: 'ELEKTRİK TESİSATÇISI (Sv.4) (B2 - Elektrik İç Tesisat Uygulaması)', unitCode: 'B2', price: 12000, isParent: false },
  
  { cat: 'ELEKTRİK', code: '17UY0288-5', title: 'ELEKTRİK TESİSATÇISI (Sv.5) - Tüm Birimler', unitCode: '', price: 17250, isParent: true },
  { cat: 'ELEKTRİK', code: '17UY0288-5', title: 'ELEKTRİK TESİSATÇISI (Sv.5) (B1 - El. Tesisatı Döşeme, Fonk., Bakım Onarım)', unitCode: 'B1', price: 9900, isParent: false },
  { cat: 'ELEKTRİK', code: '17UY0288-5', title: 'ELEKTRİK TESİSATÇISI (Sv.5) (B2 - Elektrik Tesisat Projelerini Hazırlama)', unitCode: 'B2', price: 10650, isParent: false },
  
  { cat: 'ELEKTRİK', code: '15UY0206-3', title: 'ELEKTRO-MEKANİK MONTAJ İŞÇİSİ (Sv.3)', unitCode: '', price: 13500, isParent: true },
  { cat: 'ELEKTRİK', code: '15UY0206-4', title: 'ELEKTRO-MEKANİK MONTAJ İŞÇİSİ (Sv.4)', unitCode: '', price: 15000, isParent: true },
  
  { cat: 'ELEKTRİK', code: '16UY0264-4', title: 'ELEKTRONİK VE ELEKTRİKLİ ÜRÜNLER SERVİSÇİSİ (Tüm Birimler)', unitCode: '', price: 10500, isParent: true },
  { cat: 'ELEKTRİK', code: '16UY0264-4', title: 'ELEKTRONİK VE ELEKTRİKLİ ÜRÜNLER SERVİSÇİSİ (B1 - Soğutucuların Servis İşlemleri)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'ELEKTRİK', code: '16UY0264-4', title: 'ELEKTRONİK VE ELEKTRİKLİ ÜRÜNLER SERVİSÇİSİ (B2 - Temizleyici ve Yıkayıcıların Servis İşlemleri)', unitCode: 'B2', price: 10500, isParent: false },
  { cat: 'ELEKTRİK', code: '16UY0264-4', title: 'ELEKTRONİK VE ELEKTRİKLİ ÜRÜNLER SERVİSÇİSİ (B3 - Isıtıcı ve Pişiricilerin Servis İşlemleri)', unitCode: 'B3', price: 10500, isParent: false },
  { cat: 'ELEKTRİK', code: '16UY0264-4', title: 'ELEKTRONİK VE ELEKTRİKLİ ÜRÜNLER SERVİSÇİSİ (B4 - Küçük Ev Aletleri Servis İşlemleri)', unitCode: 'B4', price: 10500, isParent: false },
  { cat: 'ELEKTRİK', code: '16UY0264-4', title: 'ELEKTRONİK VE ELEKTRİKLİ ÜRÜNLER SERVİSÇİSİ (B5 - Klimaların Servis İşlemleri)', unitCode: 'B5', price: 10500, isParent: false },
  
  { cat: 'ELEKTRİK', code: '13UY0121-5', title: 'İŞLETME ELEKTRİK BAKIMCISI (Tüm Birimler)', unitCode: '', price: 11250, isParent: true },
  { cat: 'ELEKTRİK', code: '13UY0121-5', title: 'İŞLETME ELEKTRİK BAKIMCISI (B1 - AG Tesislerinde Bakım Onarım)', unitCode: 'B1', price: 11250, isParent: false },
  { cat: 'ELEKTRİK', code: '13UY0121-5', title: 'İŞLETME ELEKTRİK BAKIMCISI (B2 - Kurulum Yer Değiştirme ve Söküm)', unitCode: 'B2', price: 11250, isParent: false },
  
  { cat: 'ELEKTRİK', code: '12UY0076-4', title: 'OTOMASYON SİSTEMLERİ MONTAJCISI', unitCode: '', price: 9750, isParent: true },

  // MAKİNE BAKIM & MONTAJ
  { cat: 'MAKİNE', code: '10UY0002-3', title: 'MAKİNE BAKIMCI (Sv.3) - Tüm Birimler', unitCode: '', price: 10500, isParent: true },
  { cat: 'MAKİNE', code: '10UY0002-3', title: 'MAKİNE BAKIMCI (Sv.3) (B1 - Önleyici Bakım)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'MAKİNE', code: '10UY0002-3', title: 'MAKİNE BAKIMCI (Sv.3) (B2 - Düzeltici Bakım)', unitCode: 'B2', price: 10500, isParent: false },
  
  { cat: 'MAKİNE', code: '10UY0002-4', title: 'MAKİNE BAKIMCI (Sv.4) - Tüm Birimler', unitCode: '', price: 11250, isParent: true },
  { cat: 'MAKİNE', code: '10UY0002-4', title: 'MAKİNE BAKIMCI (Sv.4) (B1 - Önleyici Bakım)', unitCode: 'B1', price: 11250, isParent: false },
  { cat: 'MAKİNE', code: '10UY0002-4', title: 'MAKİNE BAKIMCI (Sv.4) (B2 - Düzeltici Bakım)', unitCode: 'B2', price: 12000, isParent: false },
  
  { cat: 'MAKİNE', code: '12UY0105-3', title: 'MAKİNE MONTAJCISI (Sv.3)', unitCode: '', price: 13500, isParent: true },
  { cat: 'MAKİNE', code: '12UY0105-4', title: 'MAKİNE MONTAJCISI (Sv.4)', unitCode: '', price: 15000, isParent: true },

  // ULAŞTIRMA, LOJİSTİK & VİNÇ
  { cat: 'ULAŞTIRMA', code: '13UY0145-3', title: 'ENDÜSTRİYEL TAŞIMACI (Tüm Birimler)', unitCode: '', price: 10500, isParent: true },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3', title: 'ENDÜSTRİYEL TAŞIMACI (B1 - Endüstriyel Forklift Kullanımı)', unitCode: 'B1', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3', title: 'ENDÜSTRİYEL TAŞIMACI (B2 - Endüstriyel Elektrikli Transpalet Kullanımı)', unitCode: 'B2', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3', title: 'ENDÜSTRİYEL TAŞIMACI (B3 - Endüstriyel Elektrikli İstif Mak. Kullanımı)', unitCode: 'B3', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3', title: 'ENDÜSTRİYEL TAŞIMACI (B4 - Endüstriyel Çekici Kullanımı)', unitCode: 'B4', price: 10500, isParent: false },
  { cat: 'ULAŞTIRMA', code: '13UY0145-3', title: 'ENDÜSTRİYEL TAŞIMACI (B5 - Sapancılık)', unitCode: 'B5', price: 10500, isParent: false },
  
  { cat: 'ULAŞTIRMA', code: '17UY0326-3', title: 'KAMYON ŞOFÖRÜ', unitCode: '', price: 8400, isParent: true },
  { cat: 'ULAŞTIRMA', code: '15UY0205-3', title: 'KÖPRÜLÜ VİNÇ OPERATÖRÜ', unitCode: '', price: 10500, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0327-3', title: 'MİNİBÜS ŞOFÖRÜ', unitCode: '', price: 12000, isParent: true },
  { cat: 'ULAŞTIRMA', code: '19UY0390-3', title: 'MOTOSİKLETLİ KURYE', unitCode: '', price: 10500, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0328-3', title: 'SERVİS ARACI ŞOFÖRÜ', unitCode: '', price: 12000, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0329-3', title: 'ŞEHİR İÇİ TOPLU TAŞIMA OTOBÜS ŞOFÖRÜ', unitCode: '', price: 12000, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0330-3', title: 'TAKSİ ŞOFÖRÜ', unitCode: '', price: 12000, isParent: true },
  
  { cat: 'ULAŞTIRMA', code: '17UY0331-3', title: 'TEHLİKELİ MADDE TAŞIMACILIĞI ŞOFÖRÜ (Tüm Birimler)', unitCode: '', price: 13950, isParent: true },
  { cat: 'ULAŞTIRMA', code: '17UY0331-3', title: 'TEHLİKELİ MADDE TAŞIMACILIĞI ŞOFÖRÜ (B1 - Patlayıcı Madde Ambalaj/Paket Taşıma)', unitCode: 'B1', price: 7275, isParent: false },

  // TİCARET & SATIŞ
  { cat: 'TİCARET', code: '17UY0296-3', title: 'KASİYER', unitCode: '', price: 8550, isParent: true },
  { cat: 'TİCARET', code: '17UY0297-5', title: 'MAĞAZA SATIŞ ALANI GELİŞTİRME SORUMLUSU', unitCode: '', price: 11700, isParent: true },
  { cat: 'TİCARET', code: '17UY0323-3', title: 'SATIŞ DANIŞMANI (Sv.3)', unitCode: '', price: 7800, isParent: true },
  { cat: 'TİCARET', code: '17UY0323-4', title: 'SATIŞ DANIŞMANI (Sv.4)', unitCode: '', price: 9750, isParent: true },
];

const IS_MAKINESI_ITEMS = [
  { subcategory: 'forklift', code: 'ISMK-001', title: 'Forklift Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'personelyukyukseltici', code: 'ISMK-002', title: 'Personel ve Yük Yükseltici Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'ekskavator', code: 'ISMK-003', title: 'Ekskavatör Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'bekoloder', code: 'ISMK-004', title: 'Beko Loder Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'loder', code: 'ISMK-005', title: 'Loder Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'istifmakinesi', code: 'ISMK-006', title: 'İstif Makinesi Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'elektriklitranspalet', code: 'ISMK-007', title: 'Elektrikli Transpalet Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'bicerdöver', code: 'ISMK-008', title: 'Biçerdöver Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'yoldisi', code: 'ISMK-009', title: 'Yoldışı Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'kopruluvinc', code: 'ISMK-010', title: 'Köprülü Vinç Operatörlük Eğitimi ve Belgesi', price: 0 },
  { subcategory: 'cekmearaci', code: 'ISMK-011', title: 'Çekme Aracı Operatörlük Eğitimi ve Belgesi', price: 0 },
];

const generateCatalog = () => {
  // LONCA - Kategori mapping: CSV kategorisi → subcategory ID
  const loncaCatMap = {
    'İNŞAAT': 'myk_lonca_insaat',
    'METAL': 'myk_lonca_metal',
    'OTOMOTIV': 'myk_lonca_otomotiv',
    'ELEKTRIK VE ELEKTRONIK': 'myk_lonca_elektrik',
    'ENERJI': 'myk_lonca_enerji',
    'TEKSTIL': 'myk_lonca_tekstil',
    'TICARET': 'myk_lonca_ticaret',
    'TURIZM': 'myk_lonca_turizm',
    'HIZMET': 'myk_lonca_hizmet',
    'ULAŞTIRMA': 'myk_lonca_ulastirma'
  };

  // POLY - Kategori mapping: CSV kategorisi → subcategory ID
  const polyCatMap = {
    'İNŞAAT': 'poly_insaat',
    'METAL': 'poly_metal',
    'ELEKTRİK': 'poly_elektrik',
    'MAKİNE': 'poly_makine',
    'ULAŞTIRMA': 'poly_ulastirma',
    'TİCARET': 'poly_ticaret'
  };

  // LONCA items
  const loncaItems = LONCA_ITEMS.map((item, idx) => ({
    id: `LONCA-${idx + 1}`,
    category: 'myk',
    subcategory: loncaCatMap[item.cat] || 'myk_lonca_hizmet',
    code: item.code,
    title: item.title,
    basePrice: item.price,
    taxRate: 20,
    unit: 'KİŞİ',
    description: 'Lonca Belgelendirme A.Ş. — MYK Yetkili Sınav ve Belgelendirme Ücreti (KDV Dahil)',
    // Parent-child metadata
    isParent: item.isParent,
    isChild: !item.isParent && item.unitCode !== '',
    unitCode: item.unitCode || null,
    parentCode: (!item.isParent && item.unitCode) ? item.code : null
  }));

  // POLY items
  const polyItems = POLY_ITEMS.map((item, idx) => ({
    id: `POLY-${idx + 1}`,
    category: 'poly',
    subcategory: polyCatMap[item.cat] || 'poly_ticaret',
    code: item.code,
    title: item.title,
    basePrice: item.price,
    taxRate: 20,
    unit: 'KİŞİ',
    description: 'Poly Cert Belgelendirme — MYK Yetkili Sınav ve Belgelendirme Ücreti (KDV Dahil)',
    // Parent-child metadata
    isParent: item.isParent,
    isChild: !item.isParent && item.unitCode !== '',
    unitCode: item.unitCode || null,
    parentCode: (!item.isParent && item.unitCode) ? item.code : null
  }));

  // İş Makineleri items
  const isMakinesiItems = IS_MAKINESI_ITEMS.map((item, idx) => ({
    id: `ISMK-${idx + 1}`,
    category: 'ismakineleri',
    subcategory: item.subcategory,
    code: item.code,
    title: item.title,
    basePrice: item.price,
    taxRate: 10,
    unit: 'KİŞİ',
    description: 'Vefa İş Makineleri Operatörlük Eğitimi ve Belgelendirme (KDV Dahil)',
    isParent: false,
    isChild: false,
    unitCode: null,
    parentCode: null
  }));

  return [...isMakinesiItems, ...loncaItems, ...polyItems];
};

export const INITIAL_CATALOG = generateCatalog();
