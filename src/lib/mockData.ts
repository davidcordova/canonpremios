import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos de ejemplo para vendedores
export const sellers = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'vendedor@canon.com',
    store: 'Canon Store Central',
    points: 1250,
    birthDate: '1990-03-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '2',
    name: 'María García',
    email: 'vendedor2@canon.com',
    store: 'Canon Store Norte',
    points: 2800,
    birthDate: '1992-03-20',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

// Datos de ejemplo para productos
export const products = [
  { id: '1', code: '0012', model: 'Cabeza', type: 'Repuesto', points: 2, stock: 10 },
  { id: '2', code: '0015', model: 'Cabezales Maxifi', type: 'Repuesto', points: 10, stock: 10 },
  { id: '3', code: '0001', model: 'Impresora Canon G2160', type: 'Impresora', points: 2, stock: 10 },
  { id: '4', code: '0002', model: 'Impresora Canon G3110', type: 'Impresora', points: 3, stock: 10 },
  { id: '5', code: '0003', model: 'Impresora Canon G3160', type: 'Impresora', points: 0, stock: 10 },
  { id: '6', code: '0004', model: 'Impresora Canon G4110', type: 'Impresora', points: 10, stock: 10 },
  { id: '7', code: '0005', model: 'Impresora Canon G6010', type: 'Impresora', points: 8, stock: 10 },
  { id: '8', code: '0011', model: 'Impresora Canon G610', type: 'Impresora', points: 14, stock: 10 },
  { id: '9', code: '0006', model: 'Impresora Canon G7010', type: 'Impresora', points: 12, stock: 10 },
  { id: '10', code: '0009', model: 'Impresora Canon Maxifi GX6010', type: 'Impresora', points: 18, stock: 10 },
  { id: '11', code: '0010', model: 'Impresora Canon Maxifi GX7010', type: 'Impresora', points: 20, stock: 10 },
  { id: '12', code: '0022', model: 'Impresora G2170', type: 'Impresora', points: 10, stock: 10 },
  { id: '13', code: '0015', model: 'Impresora G3170', type: 'Impresora', points: 13, stock: 10 },
  { id: '14', code: '0023', model: 'Impresora G4170', type: 'Impresora', points: 15, stock: 10 },
  { id: '15', code: '0012', model: 'Kit de mantenimiento', type: 'Repuesto', points: 2, stock: 10 },
  { id: '16', code: '0008', model: 'Tintas (por botella)', type: 'Consumible', points: 1, stock: 10 }
];

// Lista de mayoristas
export const wholesalers = [
  'Datacont S.A.C',
  'Grupo Deltron S.A',
  'Compudiskett SRL',
  'Ingram Micro S.A.C',
  'Intcomex Peru S.A.C'
];

// Lista de empresas
export const companies = [
  {
    id: '1',
    ruc: '20123456789',
    name: 'Canon Store Central S.A.C',
    status: 'active' as const,
    createdAt: '2024-01-01',
    city: 'Lima',
    anniversaryDate: '2020-01-15'
  },
  {
    id: '2',
    ruc: '20987654321',
    name: 'Canon Store Norte S.A.C',
    status: 'active' as const,
    createdAt: '2024-01-15',
    city: 'Trujillo',
    anniversaryDate: '2020-02-01'
  },
  {
    id: '3',
    ruc: '20456789123',
    name: 'Canon Store Sur S.A.C',
    status: 'active' as const,
    createdAt: '2024-02-01',
    city: 'Arequipa',
    anniversaryDate: '2020-03-15'
  },
  {
    id: '4',
    ruc: '20789123456',
    name: 'Canon Store Este S.A.C',
    status: 'active' as const,
    createdAt: '2024-02-15',
    city: 'Cusco',
    anniversaryDate: '2020-04-01'
  },
  {
    id: '5',
    ruc: '20321654987',
    name: 'Canon Store Oeste S.A.C',
    status: 'inactive' as const,
    createdAt: '2023-12-01',
    city: 'Piura',
    anniversaryDate: '2020-05-15'
  }
];

// Generar registros de stock de ejemplo
export const generateMockStockRecords = () => {
  const records = [];
  const currentDate = new Date();
  
  // Generar registros para cada vendedor
  sellers.forEach(seller => {
    // Generar entre 3 y 7 registros por vendedor
    const numRecords = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < numRecords; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      // Seleccionar productos aleatorios para el registro
      const selectedProducts = products
        .filter(() => Math.random() > 0.5)
        .map(product => {
          const difference = Math.floor(Math.random() * 11) - 5; // Diferencia entre -5 y +5
          return {
            productId: product.id,
            model: product.model,
            previousStock: 10,
            currentStock: 10 + difference,
            difference
          };
        });

      if (selectedProducts.length === 0) {
        const product = products[0];
        const difference = Math.floor(Math.random() * 11) - 5;
        selectedProducts.push({
          productId: product.id,
          model: product.model,
          previousStock: 10,
          currentStock: 10 + difference,
          difference
        });
      }

      const record = {
        id: `${seller.id}-${i + 1}`,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        week: format(date, 'w'),
        weekStart: format(startOfWeek(date, { locale: es }), 'yyyy-MM-dd'),
        weekEnd: format(endOfWeek(date, { locale: es }), 'yyyy-MM-dd'),
        seller: {
          id: seller.id,
          name: seller.name,
          email: seller.email,
          avatar: seller.avatar,
          company: seller.store
        },
        products: selectedProducts,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
      };

      records.push(record);
    }
  });

  return records.sort((a, b) => b.date.localeCompare(a.date));
};

// Generar ventas de ejemplo
export const generateMockSales = () => {
  const sales = [];
  const currentDate = new Date();
  
  // Generar ventas para cada vendedor
  sellers.forEach(seller => {
    // Generar entre 5 y 10 ventas por vendedor
    const numSales = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < numSales; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      // Generar productos aleatorios para la venta
      const saleProducts = products
        .filter(() => Math.random() > 0.5)
        .map(product => ({
          productId: product.id,
          model: product.model,
          quantity: Math.floor(Math.random() * 3) + 1,
          points: product.points
        }));

      if (saleProducts.length === 0) {
        saleProducts.push({
          productId: products[0].id,
          model: products[0].model,
          quantity: 1,
          points: products[0].points
        });
      }

      const points = saleProducts.reduce((sum, p) => sum + (p.points * p.quantity), 0);

      const sale = {
        id: `${seller.id}-${i + 1}`,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        seller: {
          id: seller.id,
          name: seller.name,
          email: seller.email,
          avatar: seller.avatar,
          company: seller.store
        },
        products: saleProducts,
        points,
        status: Math.random() > 0.3 ? 'completed' : 'pending',
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
      };

      sales.push(sale);
    }
  });

  return sales.sort((a, b) => b.date.localeCompare(a.date));
};

// Generar compras de ejemplo
export const generateMockPurchases = () => {
  const purchases = [];
  const currentDate = new Date();
  
  // Generar compras para cada vendedor
  sellers.forEach(seller => {
    // Generar entre 3 y 7 compras por vendedor
    const numPurchases = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < numPurchases; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const purchase = {
        id: `${seller.id}-${i + 1}`,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        seller: {
          id: seller.id,
          name: seller.name,
          email: seller.email,
          avatar: seller.avatar,
          company: seller.store
        },
        documentType: Math.random() > 0.5 ? 'factura' : 'boleta',
        documentNumber: `F001-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
        wholesaler: wholesalers[Math.floor(Math.random() * wholesalers.length)],
        document: 'https://example.com/document.pdf',
        products: [
          {
            productId: '1',
            model: 'Canon G2160',
            quantity: Math.floor(Math.random() * 5) + 1,
            points: 2
          },
          {
            productId: '2',
            model: 'Canon G3110',
            quantity: Math.floor(Math.random() * 3) + 1,
            points: 3
          }
        ],
        totalPoints: 15,
        status: Math.random() > 0.6 ? 'pending' : Math.random() > 0.5 ? 'approved' : 'rejected',
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
      };

      purchases.push(purchase);
    }
  });

  return purchases.sort((a, b) => b.date.localeCompare(a.date));
};


export const getWinners = async () => {
  try {
    const response = await fetch('/winners.json')
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al cargar los ganadores:', error);
    return [];
  }
};

// Generar ganadores de ejemplo
export const generateMockWinners = () => {
  const winners = [];
  const currentDate = new Date();
  
  const rewards = [
    {
      name: 'iPad Pro 11"',
      points: 5000,
      category: 'tecnología'
    },
    {
      name: 'Vale de Compra S/500',
      points: 2000,
      category: 'vales'
    },
    {
      name: 'Smartwatch Galaxy Watch 6',
      points: 3500,
      category: 'tecnología'
    },
    {
      name: 'Pack de Merchandising Premium',
      points: 1500,
      category: 'merchandising'
    }
  ];

  // Generar ganadores para cada vendedor
  sellers.forEach(seller => {
    // Generar entre 1 y 3 premios por vendedor
    const numWins = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numWins; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      
      const winner = {
        id: `${seller.id}-${i + 1}`,
        name: seller.name,
        avatar: seller.avatar,
        store: seller.store,
        company: seller.store,
        photo: reward.category === 'tecnología'
          ? 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&q=80&w=1200&h=800'
          : 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&q=80&w=1200&h=800',
        reward: {
          name: reward.name,
          points: reward.points,
          date: date.toISOString().split('T')[0]
        },
        review: `¡Felicitaciones a ${seller.name} por alcanzar los puntos necesarios para su ${reward.name}! Un reconocimiento a su excelente desempeño.`
      };

      winners.push(winner);
    }
  });

  return winners.sort((a, b) => b.reward.date.localeCompare(a.reward.date));
};

// Generar capacitaciones de ejemplo
export const generateMockTrainings = () => {
  const trainings = [];
  const currentDate = new Date();
  
  const topics = [
    'Capacitación PIXMA Series 2024',
    'Capacitación Maxify GX Series',
    'Técnicas de Venta Avanzadas',
    'Gestión de Clientes Corporativos',
    'Nuevas Características ImageCLASS',
    'Marketing Digital para Vendedores'
  ];

  const trainers = [
    'Carlos Mendoza',
    'Ana Rodríguez',
    'Luis Torres',
    'Patricia Flores'
  ];

  // Generar capacitaciones para cada vendedor
  sellers.forEach(seller => {
    // Generar entre 2 y 5 capacitaciones por vendedor
    const numTrainings = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numTrainings; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30)); // Fechas futuras
      
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const trainer = trainers[Math.floor(Math.random() * trainers.length)];
      const status = Math.random() > 0.6 ? 'pending' : Math.random() > 0.5 ? 'approved' : 'rejected';
      
      const training = {
        id: `${seller.id}-${i + 1}`,
        date: date.toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 8) + 9}:00`, // Entre 9:00 y 16:00
        seller: {
          id: seller.id,
          name: seller.name,
          email: seller.email,
          avatar: seller.avatar,
          company: seller.store
        },
        topic,
        description: `Necesito capacitación sobre ${topic.toLowerCase()} para mejorar mis argumentos de venta y conocimiento del producto.`,
        status,
        trainer: status === 'approved' ? trainer : undefined,
        duration: status === 'approved' ? '1.5 horas' : undefined,
        meetingUrl: status === 'approved' ? 'https://meet.google.com/abc-defg-hij' : undefined,
        comments: status === 'rejected' ? 'Por favor proponer una fecha alternativa' : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      trainings.push(training);
    }
  });

  return trainings.sort((a, b) => a.date.localeCompare(b.date));
};

// Generar métricas del administrador
export const generateAdminMetrics = () => {
  const sales = generateMockSales();
  const purchases = generateMockPurchases();

  return {
    summary: {
      totalSellers: sellers.length,
      activeSellers: sellers.length,
      totalSales: sales.length,
      salesGrowth: 15,
      totalPurchases: purchases.length,
      purchasesGrowth: 12,
      totalRewards: 156,
      rewardsGrowth: 8,
      totalTrainings: 89,
      trainingsGrowth: 20,
      totalAwards: 24,
      awardsGrowth: 5
    },
    purchasesByUser: sellers.map(seller => ({
      name: seller.name,
      purchases: purchases.filter(p => p.seller.id === seller.id).length
    })),
    salesByUser: sellers.map(seller => ({
      name: seller.name,
      sales: sales.filter(s => s.seller.id === seller.id).length
    })),
    productsByStore: [
      { store: 'Canon Store Central', products: 150 },
      { store: 'Canon Store Norte', products: 200 },
      { store: 'Canon Store Sur', products: 175 },
      { store: 'Canon Store Este', products: 225 }
    ],
    rewardRedemptions: [
      { month: 'Ene', cantidad: 45 },
      { month: 'Feb', cantidad: 52 },
      { month: 'Mar', cantidad: 59 }
    ],
    trainingCompletion: [
      { month: 'Ene', completados: 25, programados: 30 },
      { month: 'Feb', completados: 28, programados: 32 },
      { month: 'Mar', completados: 31, programados: 35 }
    ],
    topPerformers: sellers.map(seller => ({
      name: seller.name,
      points: seller.points,
      quantity: Math.floor(Math.random() * 50) + 100
    }))
  };
};