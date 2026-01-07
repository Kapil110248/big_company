export const MOCK_DATA = {
    // --- ADMIN DATA ---
    admin: {
        dashboard: {
            total_revenue: 154200000,
            active_retailers: 450,
            active_wholesalers: 25,
            total_loans_extended: 75000000,
            revenue_growth: 12.5,
            recent_activities: [
                { id: '1', action: 'New Retailer Joined', target: 'Kigali Fresh Market', time: '2 hours ago' },
                { id: '2', action: 'Loan Approved', target: 'RW-4452 (500,000 RWF)', time: '5 hours ago' },
                { id: '3', action: 'System Update', target: 'Version 2.4.0 deployed', time: '1 day ago' }
            ]
        },
        retailers: [
            { id: 'ret_1', store_name: 'Kigali Shop', owner_name: 'Jean Pierre', phone: '+250788100001', email: 'jean@kigali.rw', location: 'Kigali Central', status: 'active', credit_limit: 5000000, current_balance: 1250000, created_at: '2024-01-15' },
            { id: 'ret_2', store_name: 'Rubavu Mart', owner_name: 'Marie Claire', phone: '+250788100002', email: 'claire@rubavu.rw', location: 'Rubavu District', status: 'active', credit_limit: 3000000, current_balance: 450000, created_at: '2024-02-10' },
            { id: 'ret_3', store_name: 'Butare Corner', owner_name: 'Eric Munyaneza', phone: '+250788100003', email: 'eric@butare.rw', location: 'Huye District', status: 'suspended', credit_limit: 2000000, current_balance: 2000000, created_at: '2024-03-05' }
        ],
        wholesalers: [
            { id: 'wh_1', company_name: 'Bralirwa Ltd', owner_name: 'Supply Manager', phone: '+250788200001', email: 'supply@bralirwa.rw', location: 'Kigali Industrial Zone', status: 'active', total_retailers: 120, revenue: 45000000, created_at: '2023-10-20' },
            { id: 'wh_2', company_name: 'Inyange Industries', owner_name: 'Sales Dept', phone: '+250788200002', email: 'sales@inyange.rw', location: 'Masaka, Kigali', status: 'active', total_retailers: 85, revenue: 32000000, created_at: '2023-11-15' }
        ],
        customers: [
            { id: 'cust_1', name: 'Alphonse Habimana', phone: '+250788300001', email: 'alphonse@example.com', wallet_balance: 45000, nfc_cards: 2, created_at: '2024-05-01' },
            { id: 'cust_2', name: 'Gisele Uwase', phone: '+250788300002', email: 'gisele@example.com', wallet_balance: 12000, nfc_cards: 1, created_at: '2024-05-10' }
        ],
        loans: [
            { id: 'loan_1', target_id: 'ret_1', target_name: 'Kigali Shop', type: 'retailer', amount: 500000, interest: 2.5, status: 'pending', duration: 3, created_at: '2024-12-01' },
            { id: 'loan_2', target_id: 'cust_1', target_name: 'Alphonse Habimana', type: 'consumer', amount: 25000, interest: 1.2, status: 'approved', duration: 1, created_at: '2024-11-28' }
        ],
        nfc_cards: [
            { id: 'nfc_1', card_number: 'NFC-8844-2211', user_name: 'Alphonse Habimana', user_type: 'consumer', balance: 45000, status: 'active', created_at: '2024-01-10' },
            { id: 'nfc_2', card_number: 'NFC-9900-5544', user_name: 'Kigali Shop', user_type: 'retailer', balance: 1250000, status: 'active', created_at: '2024-02-15' },
            { id: 'nfc_3', card_number: 'NFC-1122-3344', user_name: null, user_type: null, balance: 0, status: 'unassigned', created_at: '2024-11-20' }
        ],
        categories: [
            { id: 'cat_1', code: 'BEV', name: 'Beverages', description: 'Soft drinks, water, juices and alcoholic drinks', is_active: true, product_count: 45, created_at: '2023-01-01' },
            { id: 'cat_2', code: 'GRN', name: 'Grains & Cereals', description: 'Rice, maize, beans and other grains', is_active: true, product_count: 28, created_at: '2023-01-01' },
            { id: 'cat_3', code: 'HSH', name: 'Household', description: 'Cleaning supplies and household essentials', is_active: true, product_count: 115, created_at: '2023-01-01' }
        ]
    },

    // --- WHOLESALER DATA ---
    wholesaler: {
        stats: {
            total_sales: 12500000,
            total_orders: 45,
            pending_shipments: 8,
            stock_value: 45000000,
            growth: 15.5
        },
        inventory: [
            { id: 'p_1', name: 'Mützig Beer 50cl', category: 'Beverages', price: 1200, cost_price: 1000, stock_quantity: 450, status: 'active' },
            { id: 'p_2', name: 'Inyange Water 500ml', category: 'Beverages', price: 400, cost_price: 350, stock_quantity: 1200, status: 'active' },
            { id: 'p_3', name: 'Wheat Flour 10kg', category: 'Food', price: 8500, cost_price: 7800, stock_quantity: 85, status: 'low_stock' }
        ],
        orders: [
            { id: 'ord_1', retailer_name: 'Kigali Shop', total_amount: 450000, status: 'shipped', created_at: '2024-12-01', items_count: 12 },
            { id: 'ord_2', retailer_name: 'Rubavu Mart', total_amount: 125000, status: 'pending', created_at: '2024-12-02', items_count: 5 }
        ],
        credit_requests: [
            { id: 'cr_1', retailer_name: 'Kigali Shop', requested_amount: 150000, status: 'pending', reason: 'Holiday stock expansion', created_at: '2024-11-30' }
        ]
    },

    // --- RETAILER DATA ---
    retailer: {
        stats: {
            daily_sales: 145000,
            monthly_sales: 4200000,
            total_inventory_items: 1250,
            net_profit: 850000
        },
        inventory: [
            { id: 'ret_p_1', name: 'Milk 1L', price: 1200, stock: 45, category: 'Dairy' },
            { id: 'ret_p_2', name: 'Sugar 1kg', price: 1500, stock: 20, category: 'Food' }
        ],
        orders: [
            { id: 'ro_1', customer_name: 'Alphonse Habimana', amount: 4500, status: 'completed', type: 'POS', time: '10:30 AM' },
            { id: 'ro_2', customer_name: 'Gisele Uwase', amount: 12500, status: 'processed', type: 'Online', time: '11:15 AM' }
        ],
        branches: [
            { id: 'b_1', name: 'Main Branch', location: 'Kigali City Center', manager: 'Jean Bosco', phone: '+250788400001', staff_count: 5, status: 'active' },
            { id: 'b_2', name: 'Airport Branch', location: 'Kanombe', manager: 'Alice Mutoni', phone: '+250788400002', staff_count: 3, status: 'active' }
        ]
    },

    // --- EMPLOYEE DATA ---
    employee: {
        dashboard: {
            attendance: { isCheckedIn: true, checkInTime: '08:45 AM', hoursWorked: 6.5, status: 'on_time' },
            leave: { vacation: 14, sick: 10, personal: 5 },
            next_payslip_date: '2024-12-31'
        },
        payslips: [
            { id: 'pay_1', month: 'November 2024', gross: 600000, net: 450000, deductions: 150000, status: 'paid', date: '2024-11-30' },
            { id: 'pay_2', month: 'October 2024', gross: 600000, net: 450000, deductions: 150000, status: 'paid', date: '2024-10-31' }
        ],
        tasks: [
            { id: 't_1', title: 'Update Inventory Records', project: 'Stock Audit', dueDate: '2024-12-05', priority: 'high', status: 'in_progress' },
            { id: 't_2', title: 'Prepare Monthly Sales Report', project: 'Finance', dueDate: '2024-12-02', priority: 'medium', status: 'todo' }
        ],
        attendance: [
            { id: 'att_1', date: '2024-12-01', checkIn: '08:30', checkOut: '17:30', status: 'on_time' },
            { id: 'att_2', date: '2024-11-30', checkIn: '08:45', checkOut: '17:35', status: 'on_time' }
        ]
    },

    // --- CONSUMER DATA ---
    consumer: {
        retailers: [
            { id: 'ret_001', name: 'Remera Express Store', location: 'Rukiri I, Remera, Gasabo', rating: 4.8, distance: 1.2, is_open: true, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800', delivery_time: '20-30 min', minimum_order: 5000 },
            { id: 'ret_002', name: 'Nyamirambo Market', location: 'Nyamirambo, Nyarugenge', rating: 4.5, distance: 2.5, is_open: true, image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800', delivery_time: '30-45 min', minimum_order: 3000 },
            { id: 'ret_005', name: 'Gikondo Groceries', location: 'Gikondo, Kicukiro', rating: 4.3, distance: 5.5, is_open: true, image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=800', delivery_time: '35-50 min', minimum_order: 4500 }
        ],
        products: [
            {
                id: 'p_1',
                title: 'Fresh Banana (Hand)',
                description: 'Sweet and organic bananas harvested daily from local farms.',
                thumbnail: 'https://images.unsplash.com/photo-1571771894821-ad99026a0947?auto=format&fit=crop&q=80&w=400',
                variants: [{ id: 'v_1', title: '1kg Hand', prices: [{ amount: 800, currency_code: 'RWF' }], inventory_quantity: 50 }],
                categories: [{ id: 'cat_1', name: 'Fruits' }]
            },
            {
                id: 'p_2',
                title: 'Irish Potatoes',
                description: 'Perfect for boiling, mashing, or frying. Locally grown in Musanze.',
                thumbnail: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
                variants: [{ id: 'v_2', title: '5kg Bag', prices: [{ amount: 4500, currency_code: 'RWF' }], inventory_quantity: 20 }],
                categories: [{ id: 'cat_2', name: 'Vegetables' }]
            },
            {
                id: 'p_3',
                title: 'Inyange Whole Milk',
                description: 'Fresh pasteurized whole milk from Rwanda\'s leading dairy.',
                thumbnail: 'https://images.unsplash.com/photo-1550583724-1255818c093b?auto=format&fit=crop&q=80&w=400',
                variants: [{ id: 'v_3', title: '1L Packet', prices: [{ amount: 1200, currency_code: 'RWF' }], inventory_quantity: 100 }],
                categories: [{ id: 'cat_3', name: 'Dairy' }]
            },
            {
                id: 'p_4',
                title: 'Organic Avocados',
                description: 'Large, creamy avocados perfect for salads or toast.',
                thumbnail: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=400',
                variants: [{ id: 'v_4', title: 'Per Piece', prices: [{ amount: 500, currency_code: 'RWF' }], inventory_quantity: 30 }],
                categories: [{ id: 'cat_1', name: 'Fruits' }]
            },
            {
                id: 'p_5',
                title: 'Premium Basmati Rice',
                description: 'Extra long grain rice for perfect meals.',
                thumbnail: 'https://images.unsplash.com/photo-1586201327693-86629f7bb1f3?auto=format&fit=crop&q=80&w=400',
                variants: [{ id: 'v_5', title: '1kg', prices: [{ amount: 2500, currency_code: 'RWF' }], inventory_quantity: 40 }],
                categories: [{ id: 'cat_4', name: 'Grains' }]
            },
            {
                id: 'p_6',
                title: 'Cooking Oil (Sunfresh)',
                description: 'High-quality sunflower oil for all your frying needs.',
                thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?auto=format&fit=crop&q=80&w=400',
                variants: [{ id: 'v_6', title: '3L Bottle', prices: [{ amount: 6500, currency_code: 'RWF' }], inventory_quantity: 15 }],
                categories: [{ id: 'cat_5', name: 'Groceries' }]
            }
        ],
        wallet: {
            balance: 15450,
            transactions: [
                { id: 'tx_1', type: 'Purchase', amount: -2500, counterparty: 'Kigali Fresh', date: '2024-12-01' },
                { id: 'tx_2', type: 'Top-up', amount: 5000, counterparty: 'Mobile Money', date: '2024-11-28' }
            ]
        },
        rewards: {
            balance: 1250,
            referral_code: 'BIG-Hab-432'
        },
        orders: [
            { id: 'ord_1', order_number: 'ORD-1001', retailer_name: 'Kigali Fresh Market', total_amount: 4500, status: 'delivered', created_at: '2024-11-30', items_count: 3 },
            { id: 'ord_2', order_number: 'ORD-1002', retailer_name: 'City Corner Store', total_amount: 12500, status: 'processing', created_at: '2024-12-01', items_count: 5 }
        ],
        categories: [
            { id: 'cat_1', name: 'Fruits', handle: 'fruits', product_count: 12 },
            { id: 'cat_2', name: 'Vegetables', handle: 'vegetables', product_count: 15 },
            { id: 'cat_3', name: 'Dairy', handle: 'dairy', product_count: 8 },
            { id: 'cat_4', name: 'Grains', handle: 'grains', product_count: 20 },
            { id: 'cat_5', name: 'Groceries', handle: 'groceries', product_count: 10 }
        ]
    }
};
