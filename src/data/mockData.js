// Initial Mock Data matching sample screenshots

export const MOCK_CUSTOMERS = [
  {
    id: 'CUST-001',
    companyName: 'ERK BORU',
    authorizedPerson: 'SEYHAN FIRAT',
    email: 'seyhan.firat@erkboru.com',
    phone: '+90 505 251 17 36',
    address: 'Sarıhüyük Mh. Haltdere 2 Cd. Park Apt. C Blok No:9/A Tepebaşı / ESKİŞEHİR',
    taxOffice: 'Eskişehir Dairesi',
    taxNo: '3801370505'
  },
  {
    id: 'CUST-002',
    companyName: 'ABC İnşaat A.Ş.',
    authorizedPerson: 'Ali Yılmaz',
    email: 'ali.yilmaz@abcinsaat.com.tr',
    phone: '0 (532) 111 22 33',
    address: 'Organize Sanayi Bölgesi 4. Cadde No:12 Nilüfer / BURSA',
    taxOffice: 'Nilüfer V.D.',
    taxNo: '1234567890'
  },
  {
    id: 'CUST-003',
    companyName: 'XYZ Yapı Grubu',
    authorizedPerson: 'Mehmet Demir',
    email: 'mehmet@xyzyapi.com',
    phone: '0 (542) 999 88 77',
    address: 'Atatürk Blvd. No:45 Kat:3 Çankaya / ANKARA',
    taxOffice: 'Çankaya V.D.',
    taxNo: '9876543210'
  },
  {
    id: 'CUST-004',
    companyName: 'Mega Altyapı Ltd.',
    authorizedPerson: 'Ayşe Kaya',
    email: 'info@megaaltyapi.com',
    phone: '0 (505) 444 55 66',
    address: 'Gültepe Mah. Sanayi Cad. No:88 Kadıköy / İSTANBUL',
    taxOffice: 'Kadıköy V.D.',
    taxNo: '4567891230'
  }
];

export const MOCK_QUOTES = [
  {
    id: 'VEFA0000167',
    date: '2026-07-27',
    validUntil: '2026-08-11',
    category: 'ismakineleri',
    customer: {
      companyName: 'ERK BORU',
      authorizedPerson: 'SEYHAN FIRAT',
      email: 'seyhan.firat@erkboru.com',
      phone: '+90 505 251 17 36',
      address: 'Sarıhüyük Mh. Haltdere 2 Cd. Park Apt. C Blok No:9/A Tepebaşı / ESKİŞEHİR'
    },
    items: [
      {
        id: 'QITEM-1',
        title: 'FORKLİFT OPERATÖRLÜK EĞİTİMİ VE BELGESİ',
        unitPrice: 6363.64,
        quantity: 1,
        unit: 'KURSİYER',
        taxRate: 10,
        totalWithTax: 7000.00
      },
      {
        id: 'QITEM-2',
        title: 'KÖPRÜLÜ VİNÇ OPERATÖRLÜK EĞİTİMİ VE BELGESİ',
        unitPrice: 4545.45,
        quantity: 1,
        unit: 'KURSİYER',
        taxRate: 10,
        totalWithTax: 5000.00
      }
    ],
    totalAmount: 12000.00,
    status: 'Gönderildi', // Gönderildi, Onaylandı, Bekliyor
    createdAt: '2026-07-27T10:30:00Z',
    createdByName: 'Alparslan Kavuştu',
    createdByPhone: '+90 505 251 17 36'
  },
  {
    id: 'VEFA0000166',
    date: '2026-08-10',
    validUntil: '2026-08-25',
    category: 'ismakineleri',
    customer: {
      companyName: 'ABC İnşaat A.Ş.',
      authorizedPerson: 'Ali Yılmaz',
      email: 'ali.yilmaz@abcinsaat.com.tr',
      phone: '0 (532) 111 22 33'
    },
    items: [
      {
        id: 'QITEM-3',
        title: 'EKSKAVATÖR OPERATÖRLÜK EĞİTİMİ VE BELGESİ',
        unitPrice: 13636.36,
        quantity: 1,
        unit: 'KURSİYER',
        taxRate: 10,
        totalWithTax: 15000.00
      }
    ],
    totalAmount: 15000.00,
    status: 'Gönderildi',
    createdAt: '2026-08-10T14:35:00Z'
  },
  {
    id: 'VEFA0000165',
    date: '2026-08-09',
    validUntil: '2026-08-24',
    category: 'myk',
    customer: {
      companyName: 'XYZ Yapı Grubu',
      authorizedPerson: 'Mehmet Demir',
      email: 'mehmet@xyzyapi.com',
      phone: '0 (542) 999 88 77'
    },
    items: [
      {
        id: 'QITEM-4',
        title: 'Ahşap Kalıpçı Seviye 3 MYK Belgesi',
        unitPrice: 41454.55,
        quantity: 10,
        unit: 'KİŞİ',
        taxRate: 10,
        totalWithTax: 45600.00
      }
    ],
    totalAmount: 45600.00,
    status: 'Onaylandı',
    createdAt: '2026-08-09T11:20:00Z'
  },
  {
    id: 'VEFA0000164',
    date: '2026-08-05',
    validUntil: '2026-08-20',
    category: 'ismakineleri',
    customer: {
      companyName: 'Mega Altyapı Ltd.',
      authorizedPerson: 'Ayşe Kaya',
      email: 'info@megaaltyapi.com',
      phone: '0 (505) 444 55 66'
    },
    items: [
      {
        id: 'QITEM-5',
        title: 'Mobil Vinç Operatör Belgesi',
        unitPrice: 116363.64,
        quantity: 10,
        unit: 'KURSİYER',
        taxRate: 10,
        totalWithTax: 128000.00
      }
    ],
    totalAmount: 128000.00,
    status: 'Bekliyor',
    createdAt: '2026-08-05T09:15:00Z'
  }
];

export const MOCK_NOTES = [
  {
    id: 'NOTE-001',
    customerName: 'ERK BORU',
    contactPerson: 'Seyhan Fırat',
    phone: '+90 505 251 17 36',
    email: 'seyhan.firat@erkboru.com',
    noteText: '1 adet Forklift ve 1 adet Köprülü Vinç eğitimi için teklif istendi. Gelecek hafta sınav planı yapılacak.',
    status: 'Teklif Gönderildi', // Teklif Gönderildi, Geri Aranacak, Fiyat Bekliyor, Anlaşıldı
    date: '27 Temmuz 2026, 10:15',
    timestamp: 1785136500000
  },
  {
    id: 'NOTE-002',
    customerName: 'ABC İnşaat A.Ş.',
    contactPerson: 'Ali Yılmaz',
    phone: '0 (532) 111 22 33',
    email: 'ali.yilmaz@abcinsaat.com.tr',
    noteText: 'Yeni şantiye için 3 operatör belgelendirmesi (Ekskavatör & Yükleyici) görüşüldü. 15 Ağustos’ta tekrar aranacak.',
    status: 'Geri Aranacak',
    date: '10 Ağustos 2026, 14:10',
    timestamp: 1786273800000
  },
  {
    id: 'NOTE-003',
    customerName: 'XYZ Yapı Grubu',
    contactPerson: 'Mehmet Demir',
    phone: '0 (542) 999 88 77',
    email: 'mehmet@xyzyapi.com',
    noteText: '10 kişi MYK Ahşap Kalıpçı sınav harçları banka IBAN hesabına yatırıldı. Sınav tarihi teyit edilecek.',
    status: 'Anlaşıldı',
    date: '9 Ağustos 2026, 16:45',
    timestamp: 1786196700000
  }
];
