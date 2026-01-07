import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';
import { hashPassword } from '../utils/auth';

// Get dashboard
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const totalCustomers = await prisma.consumerProfile.count();
    const totalRetailers = await prisma.retailerProfile.count();
    const totalWholesalers = await prisma.wholesalerProfile.count();
    const totalLoans = await prisma.loan.count();
    const totalSales = await prisma.sale.count();

    const totalRevenue = (await prisma.sale.findMany()).reduce((sum, s) => sum + s.totalAmount, 0);

    res.json({
      success: true,
      totalCustomers,
      totalRetailers,
      totalWholesalers,
      totalLoans,
      totalSales,
      totalRevenue
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get customers
export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.consumerProfile.findMany({
      include: { user: true }
    });
    res.json({ customers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get retailers
export const getRetailers = async (req: AuthRequest, res: Response) => {
  try {
    const retailers = await prisma.retailerProfile.findMany({
      include: { user: true }
    });
    res.json({ retailers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create retailer
export const createRetailer = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, business_name, phone, address, credit_limit } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        role: 'retailer',
        name: business_name
      }
    });

    await prisma.retailerProfile.create({
      data: {
        userId: user.id,
        shopName: business_name,
        address,
        creditLimit: credit_limit || 0
      }
    });

    res.json({ success: true, message: 'Retailer created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get wholesalers
export const getWholesalers = async (req: AuthRequest, res: Response) => {
  try {
    const wholesalers = await prisma.wholesalerProfile.findMany({
      include: { user: true }
    });
    res.json({ wholesalers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create wholesaler
export const createWholesaler = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, company_name, phone, address } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        role: 'wholesaler',
        name: company_name
      }
    });

    await prisma.wholesalerProfile.create({
      data: {
        userId: user.id,
        companyName: company_name,
        address
      }
    });

    res.json({ success: true, message: 'Wholesaler created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get loans
export const getLoans = async (req: AuthRequest, res: Response) => {
  try {
    const loans = await prisma.loan.findMany({
      include: { consumer: { include: { user: true } } }
    });
    res.json({ loans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get NFC cards
export const getNFCCards = async (req: AuthRequest, res: Response) => {
  try {
    const cards = await prisma.nfcCard.findMany({
      include: { consumer: { include: { user: true } } }
    });
    res.json({ cards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get categories
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({ select: { category: true }, distinct: ['category'] });
    const categories = products.map(p => ({ name: p.category, id: p.category }));
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
