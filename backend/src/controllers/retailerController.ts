import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

// Get dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id },
      include: { sales: true, inventory: true, orders: true }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const totalSales = retailerProfile.sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalProducts = retailerProfile.inventory.length;
    const pendingOrders = retailerProfile.orders.filter(o => o.status === 'pending').length;

    res.json({
      totalSales,
      totalProducts,
      pendingOrders,
      walletBalance: retailerProfile.walletBalance,
      creditLimit: retailerProfile.creditLimit
    });
  } catch (error: any) {
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

// Create product
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const retailerProfile = await prisma.retailerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!retailerProfile) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    const { name, description, sku, category, price, costPrice, stock } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        category,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        stock: stock ? parseInt(stock) : 0,
        retailerId: retailerProfile.id
      }
    });

    res.json({ success: true, product });
  } catch (error: any) {
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
