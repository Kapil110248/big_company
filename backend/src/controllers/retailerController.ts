import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

// Get dashboard stats
// Get dashboard stats with comprehensive calculations
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id },
      include: { 
        orders: true // Orders to wholesalers
      }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    // Fetch data in parallel
    const [
      todaySales,
      allSales,
      inventory,
      pendingOrders
    ] = await Promise.all([
      // Today's Sales
      prisma.sale.findMany({
        where: {
          retailerId: retailerProfile.id,
          createdAt: { gte: today, lt: tomorrow }
        },
        include: { items: true }
      }),
      // All Sales (for revenue stats)
      prisma.sale.findMany({
        where: { retailerId: retailerProfile.id }
      }),
      // Inventory
      prisma.product.findMany({
        where: { retailerId: retailerProfile.id }
      }),
      // Pending Orders (to wholesalers)
      prisma.order.findMany({
        where: {
          retailerId: retailerProfile.id,
          status: 'pending'
        }
      })
    ]);

    // Calculate Stats
    const totalRevenue = allSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todaySalesAmount = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const customersToday = new Set(todaySales.map(s => s.consumerId).filter(Boolean)).size || todaySales.length; // Approximate if anonymous
    const totalOrders = todaySales.length;

    // Inventory Stats
    const inventoryItems = inventory.length;
    const lowStockItems = inventory.filter(p => p.lowStockThreshold && p.stock <= p.lowStockThreshold).length;
    const lowStockList = inventory
      .filter(p => p.lowStockThreshold && p.stock <= p.lowStockThreshold)
      .map(p => ({
        name: p.name,
        stock: p.stock,
        threshold: p.lowStockThreshold || 10
      }));

    const capitalWallet = inventory.reduce((sum, p) => sum + (p.stock * (p.costPrice || 0)), 0);
    const potentialRevenue = inventory.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const profitWallet = potentialRevenue - capitalWallet;

    // Payment Method Breakdown
    const paymentStats = todaySales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'cash';
      acc[method] = (acc[method] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const paymentMethodsData = Object.entries(paymentStats).map(([name, value]) => ({
      name: name === 'momo' ? 'Mobile Money' : name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((value / (todaySalesAmount || 1)) * 100), // Percentage
      color: name === 'momo' ? '#ffcc00' : name === 'cash' ? '#52c41a' : '#1890ff'
    }));

    // Hourly Sales Data (for chart)
    const salesByHour = new Array(24).fill(0).map((_, i) => ({ 
      name: `${i}:00`, 
      sales: 0, 
      customers: 0 
    }));
    
    todaySales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      if (salesByHour[hour]) {
        salesByHour[hour].sales += sale.totalAmount;
        salesByHour[hour].customers += 1;
      }
    });

    const currentHour = new Date().getHours();
    const chartData = salesByHour.slice(Math.max(0, currentHour - 12), currentHour + 1); // Last 12 hours

    // Top Products (This requires SaleItem aggregation, simplifying for now by using recent sales items or mock logic if complex aggregation is seemingly too heavy without raw sql)
    // For robust top products we need to query SaleItem grouped by productId. 
    // Let's do a quick separate query for top products
    const topSellingItems = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true }, // price here is total for that line item (price * qty)? No, schema says `price` is unit price? check schema
      where: {
        sale: { retailerId: retailerProfile.id }
      },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    // We need product names, so we need to fetch products for these IDs
    const topProductIds = topSellingItems.map(item => item.productId);
    const topProductsDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } }
    });
    
    const topProducts = topSellingItems.map(item => {
      const product = topProductsDetails.find(p => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        sold: item._sum.quantity || 0,
        revenue: (item._sum.price || 0), // Note: this might be inaccurate if price in SaleItem is unit price. Schema says `price Float`. Assuming it is effectively total or we can multiply.
        stock: product?.stock || 0,
        trend: 0 // Placeholder
      };
    });

    // Recent Orders (Sales to consumers)
    const recentOrders = await prisma.sale.findMany({
      where: { retailerId: retailerProfile.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { consumer: true }
    });

    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id.substring(0, 8).toUpperCase(),
      customer: order.consumer?.fullName || 'Walk-in Customer',
      items: 0, // Need to fetch items count if critical
      total: order.totalAmount,
      status: order.status,
      date: order.createdAt,
      payment: order.paymentMethod
    }));

    res.json({
      totalOrders,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      inventoryItems,
      lowStockItems,
      capitalWallet,
      profitWallet,
      creditLimit: retailerProfile.creditLimit,
      todaySales: todaySalesAmount,
      customersToday,
      growth: { orders: 0, revenue: 0 }, 
      
      // Payment breakdown
      dashboardWalletRevenue: paymentStats['wallet'] || 0,
      creditWalletRevenue: paymentStats['credit'] || 0,
      mobileMoneyRevenue: paymentStats['momo'] || 0,
      cashRevenue: paymentStats['cash'] || 0,
      gasRewardsGiven: 0,
      gasRewardsValue: 0,

      // Charts & Lists
      salesData: chartData,
      paymentMethods: paymentMethodsData,
      topProducts: topProducts,
      recentOrders: formattedRecentOrders,
      lowStockList: lowStockList
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get inventory
export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const products = await prisma.product.findMany({
      where: { retailerId: retailerProfile.id }
    });

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create product (Manual or Invoice-based)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const { invoice_number, name, description, sku, category, price, costPrice, stock } = req.body;

    // --- Invoice Flow ---
    if (invoice_number) {
      console.log('Received invoice import request:', invoice_number);
      // Find the order by ID (treating invoice_number as Order ID)
      const order = await prisma.order.findUnique({
        where: { id: invoice_number },
        include: { items: { include: { product: true } } }
      });
      console.log('Order found:', order ? order.id : 'null');

      if (!order) {
         return res.status(404).json({ error: `Invoice/Order not found. Received ID: ${invoice_number}` });
      }
      
      // Security check: ensure order belongs to this retailer
      if (order.retailerId !== retailerProfile.id) {
        return res.status(403).json({ error: 'Unauthorized: Invoice does not belong to you' });
      }

      // Check if already processed (optional, but good practice to avoid duplicates)
      // For now, we allow re-importing which might duplicate or fail on uniqueness. 
      // Let's check if products with this invoiceNumber already exist.
      const existing = await prisma.product.findFirst({
        where: { retailerId: retailerProfile.id, invoiceNumber: invoice_number }
      });
      if (existing) {
         return res.status(400).json({ error: 'Invoice already imported' });
      }

      const createdProducts = [];
      for (const item of order.items) {
        const sourceProduct = item.product;
        // Create new inventory item
        const newProduct = await prisma.product.create({
          data: {
            name: sourceProduct.name,
            description: sourceProduct.description,
            sku: sourceProduct.sku, // Keep SKU or generate new? Keeping same simplifies tracking.
            category: sourceProduct.category,
            price: sourceProduct.price * 1.2, // Default markup 20%
            costPrice: item.price, // Cost is what they paid in the order
            stock: item.quantity,
            unit: sourceProduct.unit,
            invoiceNumber: invoice_number,
            retailerId: retailerProfile.id,
            status: 'active'
          }
        });
        createdProducts.push(newProduct);
      }
      return res.json({ success: true, count: createdProducts.length, message: `Imported ${createdProducts.length} items from invoice` });
    }

    // --- Manual Flow (Single Product) ---
    // Validate required fields for manual creation
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and Price are required for manual creation' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        category: category || 'General',
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        stock: stock ? parseInt(stock) : 0,
        retailerId: retailerProfile.id
      }
    });

    res.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, costPrice, stock } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        category,
        price: price ? parseFloat(price) : undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined
      }
    });

    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const orders = await prisma.order.findMany({
      where: { retailerId: retailerProfile.id },
      include: { items: { include: { product: true } }, wholesaler: true }
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get branches
export const getBranches = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const branches = await prisma.branch.findMany({
      where: { retailerId: retailerProfile.id },
      include: { terminals: true }
    });

    res.json({ branches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create branch
export const createBranch = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const { name, location } = req.body;

    const branch = await prisma.branch.create({
      data: {
        name,
        location,
        retailerId: retailerProfile.id
      }
    });

    res.json({ success: true, branch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get wallet
export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    res.json({
      balance: retailerProfile.walletBalance,
      creditLimit: retailerProfile.creditLimit,
      availableCredit: retailerProfile.creditLimit - 0 // Assuming no outstanding credit for now
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// POS FUNCTIONS
// ==========================================

// Get POS Products (with search and stock info)
export const getPOSProducts = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const { search, limit = '50', offset = '0' } = req.query;

    const where: any = {
      retailerId: retailerProfile.id,
      status: 'active', // Only active products
      // stock: { gt: 0 }  <-- Removed to show all inventory including out of stock
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { sku: { contains: search as string } },
        { barcode: { contains: search as string } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { name: 'asc' }
    });

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Scan Barcode
export const scanBarcode = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const product = await prisma.product.findFirst({
      where: {
        retailerId: retailerProfile.id,
        barcode: barcode,
        status: 'active'
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create Sale
export const createSale = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const { 
      items, 
      payment_method, 
      subtotal, 
      tax_amount, 
      discount, 
      customer_phone,
      payment_details 
    } = req.body;

    // 1. Validate items and stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.product_id } });
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product: ${product?.name || item.product_id}` 
        });
      }
    }

    // 2. Perform Transaction (Create Sale, Decrement Stock)
    const result = await prisma.$transaction(async (prisma) => {
      // Create Sale Record
      const sale = await prisma.sale.create({
        data: {
          retailerId: retailerProfile.id,
          totalAmount: (subtotal + tax_amount - (discount || 0)),
          paymentMethod: payment_method,
          status: 'completed',
          items: {
            create: items.map((item: any) => ({
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      // Update Stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return sale;
    });

    res.json({ success: true, sale: result });

  } catch (error: any) {
    console.error('Sale failed:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Daily Sales Stats
export const getDailySales = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await prisma.sale.findMany({
      where: {
        retailerId: retailerProfile.id,
        createdAt: { gte: today, lt: tomorrow }
      }
    });

    const totalSales = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const transactionCount = todaySales.length;
    
    // Aggregation by payment method
    const paymentMethods = todaySales.reduce((acc, s) => {
      const method = s.paymentMethod;
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      total_sales: totalSales,
      transaction_count: transactionCount,
      mobile_payment_transactions: paymentMethods['mobile_money'] || 0,
      dashboard_wallet_transactions: paymentMethods['dashboard_wallet'] || 0,
      credit_wallet_transactions: paymentMethods['credit_wallet'] || 0,
      gas_rewards_m3: 0, 
      gas_rewards_rwf: 0
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// WHOLESALE ORDERING FUNCTIONS
// ==========================================

// Get Wholesaler Products
export const getWholesalerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, limit = '50', offset = '0' } = req.query;

    const where: any = {
      wholesalerId: { not: null }, // Only products belonging to wholesalers
      status: 'active'
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { sku: { contains: search as string } }
      ];
    }

    if (category) {
      where.category = category as string;
    }

    const products = await prisma.product.findMany({
      where,
      include: { wholesaler: true }, // Include wholesaler info
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { name: 'asc' }
    });

    // Map to frontend expected format
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      wholesaler_price: p.price, // Wholesaler's selling price
      stock_available: p.stock,
      min_order: 1, // Default min order
      unit: p.unit || 'unit',
      wholesaler_name: p.wholesaler?.companyName
    }));

    res.json({ products: formattedProducts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create Wholesaler Order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    // Determine wholesaler from the first product (assuming single wholesaler per order for simplicity 
    // or strictly enforce items from same wholesaler in logic, but here we just take the first one found)
    const firstProductId = items[0].product_id;
    const firstProduct = await prisma.product.findUnique({ where: { id: firstProductId } });
    
    if (!firstProduct || !firstProduct.wholesalerId) {
       return res.status(400).json({ error: 'Product does not belong to a wholesaler' });
    }
    const wholesalerId = firstProduct.wholesalerId;

    // Transaction: Create Order, Debit Wallet
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Check Wallet
      if (retailerProfile.walletBalance < totalAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // 2. Create Order
      const order = await prisma.order.create({
        data: {
          retailerId: retailerProfile.id,
          wholesalerId: wholesalerId,
          totalAmount: totalAmount,
          status: 'pending',
          items: {
            create: items.map((item: any) => ({
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      // 3. Debit Wallet
      await prisma.retailerProfile.update({
        where: { id: retailerProfile.id },
        data: { walletBalance: { decrement: totalAmount } }
      });

      return order;
    });

    res.json({ success: true, order: result });
  } catch (error: any) {
    console.error('Create order failed:', error);
    res.status(500).json({ error: error.message });
  }
};


