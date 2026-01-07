import axios from 'axios';
import { MOCK_DATA } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bigcompany_token') || localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const FORCE_MOCK = false;

// Helper to get mock data based on URL and method
const getMockResponse = (url: string = '', method: string = 'get') => {
  const normalizedUrl = url.toLowerCase();
  console.warn(`[MOCK MODE] Intercepting ${method.toUpperCase()} ${url}`);

  if (method === 'get') {
    // ADMIN MOCKS
    if (normalizedUrl.includes('/admin/dashboard')) return { data: { success: true, ...MOCK_DATA.admin.dashboard } };
    if (normalizedUrl.includes('/admin/retailers')) return { data: { success: true, retailers: MOCK_DATA.admin.retailers } };
    if (normalizedUrl.includes('/admin/wholesalers')) return { data: { success: true, wholesalers: MOCK_DATA.admin.wholesalers } };
    if (normalizedUrl.includes('/admin/customers')) return { data: { success: true, customers: MOCK_DATA.admin.customers } };
    if (normalizedUrl.includes('/admin/loans')) return { data: { success: true, loans: MOCK_DATA.admin.loans } };
    if (normalizedUrl.includes('/admin/nfc-cards')) return { data: { success: true, cards: MOCK_DATA.admin.nfc_cards } };
    if (normalizedUrl.includes('/admin/categories')) return { data: { success: true, categories: MOCK_DATA.admin.categories } };
    if (normalizedUrl.includes('/admin/audit-logs')) return { data: { success: true, logs: [] } };
    if (normalizedUrl.includes('/admin/reports')) return { data: { success: true, summary: MOCK_DATA.admin.dashboard, salesData: [] } };

    // WHOLESALER MOCKS
    if (normalizedUrl.includes('/wholesaler/dashboard/stats')) return { data: MOCK_DATA.wholesaler.stats };
    if (normalizedUrl.includes('/wholesaler/inventory')) return { data: { products: MOCK_DATA.wholesaler.inventory, count: MOCK_DATA.wholesaler.inventory.length } };
    if (normalizedUrl.includes('/wholesaler/retailer-orders')) return { data: { orders: MOCK_DATA.wholesaler.orders, count: MOCK_DATA.wholesaler.orders.length } };
    if (normalizedUrl.includes('/wholesaler/credit-requests')) return { data: { requests: MOCK_DATA.wholesaler.credit_requests } };

    // RETAILER MOCKS
    if (normalizedUrl.includes('/retailer/dashboard/stats')) return { data: MOCK_DATA.retailer.stats };
    if (normalizedUrl.includes('/retailer/inventory')) return { data: { products: MOCK_DATA.retailer.inventory } };
    if (normalizedUrl.includes('/retailer/orders')) return { data: { orders: MOCK_DATA.retailer.orders } };
    if (normalizedUrl.includes('/retailer/branches')) return { data: { branches: MOCK_DATA.retailer.branches } };

    // EMPLOYEE MOCKS
    if (normalizedUrl.includes('/employee/dashboard')) return { data: MOCK_DATA.employee.dashboard };
    if (normalizedUrl.includes('/employee/attendance')) return { data: { attendance: MOCK_DATA.employee.attendance } };
    if (normalizedUrl.includes('/employee/payslips')) return { data: { payslips: MOCK_DATA.employee.payslips } };
    if (normalizedUrl.includes('/employee/tasks')) return { data: { tasks: MOCK_DATA.employee.tasks } };

    // CONSUMER MOCKS
    if (normalizedUrl.includes('/store/retailers')) return { data: { retailers: MOCK_DATA.consumer.retailers } };
    if (normalizedUrl.includes('/store/products')) return { data: { products: MOCK_DATA.consumer.products } };
    if (normalizedUrl.includes('/store/categories')) return { data: { categories: MOCK_DATA.consumer.categories } };
    if (normalizedUrl.includes('/store/customers/me/orders')) return { data: { orders: MOCK_DATA.consumer.orders } };
    if (normalizedUrl.includes('/store/customers/me/wallet')) return { data: MOCK_DATA.consumer.wallet };
    if (normalizedUrl.includes('/store/rewards/balance')) return { data: MOCK_DATA.consumer.rewards };
    if (normalizedUrl.includes('/store/wallet/balance')) return { data: MOCK_DATA.consumer.wallet };
    if (normalizedUrl.includes('/store/wallet/transactions')) return { data: { transactions: MOCK_DATA.consumer.wallet.transactions } };

    // CONSUMER LOAN MOCKS
    if (normalizedUrl.includes('/store/loans/products')) return {
      data: {
        products: [
          { id: 'lp_1', name: 'Emergency Food Loan', min_amount: 1000, max_amount: 5000, interest_rate: 0, term_days: 7, loan_type: 'food' },
          { id: 'lp_2', name: 'Personal Cash Loan', min_amount: 5000, max_amount: 20000, interest_rate: 0.1, term_days: 30, loan_type: 'cash' }
        ]
      }
    };
    if (normalizedUrl.includes('/store/loans/eligibility')) return { data: { eligible: true, credit_score: 65, max_eligible_amount: 15000 } };
    if (normalizedUrl.includes('/store/loans')) {
      if (normalizedUrl.match(/\/store\/loans\/[^\/]+$/)) return { data: { loan: MOCK_DATA.admin.loans[1] } };
      return { data: { loans: [MOCK_DATA.admin.loans[1]], summary: { total_outstanding: 25000 } } };
    }
    if (normalizedUrl.includes('/store/loans/food-credit')) return { data: { available_credit: 3500 } };

    // Default empty state
    return { data: { success: true, items: [], total: 0 } };
  }
  return { data: { success: true, message: 'Mock Action Successful' } };
};

// Overwrite axios methods to prevent any network activity if FORCE_MOCK is true
if (FORCE_MOCK) {
  api.get = (url: string) => Promise.resolve(getMockResponse(url, 'get')) as any;
  api.post = (url: string) => Promise.resolve(getMockResponse(url, 'post')) as any;
  api.put = (url: string) => Promise.resolve(getMockResponse(url, 'put')) as any;
  api.delete = (url: string) => Promise.resolve(getMockResponse(url, 'delete')) as any;
}

// Handle 401 responses and API errors (only relevant if FORCE_MOCK is false)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bigcompany_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('bigcompany_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Employee APIs
export const employeeApi = {
  getDashboard: () => api.get('/employee/dashboard'),
  getAttendance: () => api.get('/employee/attendance'),
  checkIn: () => api.post('/employee/attendance/check-in'),
  checkOut: () => api.post('/employee/attendance/check-out'),
  getPayslips: () => api.get('/employee/payslips'),
  getPayslip: (id: string) => api.get(`/employee/payslips/${id}`),
  getTasks: () => api.get('/employee/tasks'),
  getLeaveBalance: () => api.get('/employee/leave/balance'),
  requestLeave: (data: any) => api.post('/employee/leave/request', data),
};

// Consumer/Shop APIs
export const consumerApi = {
  // Retailers
  getRetailers: (params?: { lat?: number; lng?: number }) =>
    api.get('/store/retailers', { params }),

  // Categories
  getCategories: () => api.get('/store/categories'),

  // Products
  getProducts: (params?: { retailerId?: string; category?: string; search?: string; limit?: number }) =>
    api.get('/store/products', { params }),
  getProduct: (id: string) => api.get(`/store/products/${id}`),

  // Cart
  getCart: () => api.get('/store/carts'),
  createCart: (retailerId: string) => api.post('/store/carts', { retailer_id: retailerId }),
  addToCart: (cartId: string, productId: string, quantity: number) =>
    api.post(`/store/carts/${cartId}/line-items`, { product_id: productId, quantity }),
  updateCartItem: (cartId: string, itemId: string, quantity: number) =>
    api.put(`/store/carts/${cartId}/line-items/${itemId}`, { quantity }),
  removeCartItem: (cartId: string, itemId: string) =>
    api.delete(`/store/carts/${cartId}/line-items/${itemId}`),
  clearCart: (cartId: string) => api.delete(`/store/carts/${cartId}`),

  // Checkout
  checkout: (cartId: string, data?: { delivery_address?: string; notes?: string }) =>
    api.post(`/store/carts/${cartId}/complete`, data),

  // Orders
  getOrders: (params?: any) => api.get('/store/customers/me/orders', { params }),
  getOrder: (id: string) => api.get(`/store/customers/me/orders/${id}`),
  trackOrder: (id: string) => api.get(`/store/customers/me/orders/${id}/track`),

  // Wallet
  getWallet: () => api.get('/store/wallet/balance'),
  getWalletTransactions: (params?: any) => api.get('/store/wallet/transactions', { params }),

  // Gas Service
  getGasMeters: () => api.get('/store/gas/meters'),
  registerGasMeter: (meterNumber: string, alias: string) =>
    api.post('/store/gas/register-meter', { meter_number: meterNumber, alias }),
  topUpGas: (meterNumber: string, amount: number, paymentMethod: string) =>
    api.post('/store/gas/topup', { meter_number: meterNumber, amount, payment_method: paymentMethod }),
  getGasHistory: () => api.get('/store/gas/history'),

  // Rewards
  getRewardsBalance: () => api.get('/store/rewards/balance'),
  getRewardsHistory: (limit?: number) => api.get('/store/rewards/history', { params: { limit } }),
  redeemRewards: (points: number) => api.post('/store/rewards/redeem', { points }),
  getReferralCode: () => api.get('/store/rewards/referral-code'),
  applyReferralCode: (code: string) => api.post('/store/rewards/apply-referral', { code }),
  getLeaderboard: (period: 'week' | 'month' | 'all') =>
    api.get('/store/rewards/leaderboard', { params: { period } }),

  // Loans
  getLoanProducts: () => api.get('/store/loans/products'),
  checkLoanEligibility: () => api.get('/store/loans/eligibility'),
  getLoans: () => api.get('/store/loans'),
  getLoanDetails: (id: string) => api.get(`/store/loans/${id}`),
  applyForLoan: (data: { loan_product_id: string; amount: number; purpose?: string }) =>
    api.post('/store/loans/apply', data),
  repayLoan: (id: string, data: { amount: number; payment_method: string }) =>
    api.post(`/store/loans/${id}/repay`, data),
  getFoodCredit: () => api.get('/store/loans/food-credit'),
};

// Retailer APIs
export const retailerApi = {
  // Profile
  getProfile: () => api.get('/retailer/profile'),
  updateProfile: (data: any) => api.put('/retailer/profile', data),

  // Dashboard & Analytics
  getDashboardStats: () => api.get('/retailer/dashboard'),
  getAnalytics: (params?: any) => api.get('/retailer/analytics', { params }),

  // Inventory
  getInventory: (params?: any) => api.get('/retailer/inventory', { params }),
  getProducts: (params?: any) => api.get('/retailer/inventory', { params }),
  getCategories: () => api.get('/retailer/inventory/categories'),
  createProduct: (data: any) => api.post('/retailer/inventory', data),
  updateProduct: (id: string, data: any) => api.put(`/retailer/inventory/${id}`, data),
  updateInventory: (id: string, data: any) => api.put(`/retailer/inventory/${id}`, data),
  updateStock: (id: string, quantity: number, type: string, reason?: string) =>
    api.post(`/retailer/inventory/${id}/stock`, { quantity, type, reason }),
  updatePrice: (id: string, sellingPrice: number, costPrice?: number) =>
    api.put(`/retailer/inventory/${id}/price`, { selling_price: sellingPrice, cost_price: costPrice }),

  // Orders
  getOrders: (params?: any) => api.get('/retailer/orders', { params }),
  getOrder: (id: string) => api.get(`/retailer/orders/${id}`),
  createOrder: (data: any) => api.post('/retailer/orders', data),
  updateOrderStatus: (id: string, status: string, notes?: string) =>
    api.put(`/retailer/orders/${id}/status`, { status, notes }),
  cancelOrder: (id: string, reason: string) =>
    api.post(`/retailer/orders/${id}/cancel`, { reason }),
  fulfillOrder: (id: string) => api.post(`/retailer/orders/${id}/fulfill`),

  // POS
  getPOSProducts: (params?: any) => api.get('/retailer/pos/products', { params }),
  scanBarcode: (barcode: string) => api.post('/retailer/pos/scan', { barcode }),
  createSale: (data: any) => api.post('/retailer/pos/sale', data),
  getDailySales: () => api.get('/retailer/pos/daily-sales'),

  // Wallet & Credit
  getWallet: () => api.get('/retailer/wallet'),
  getWalletBalance: () => api.get('/retailer/wallet'), // Mapped to /retailer/wallet as it returns balance
  getWalletTransactions: (params?: any) => api.get('/retailer/wallet/transactions', { params }),
  getCreditInfo: () => api.get('/retailer/credit'),
  getCreditOrders: (params?: any) => api.get('/retailer/credit/orders', { params }),
  getCreditOrder: (id: string) => api.get(`/retailer/credit/orders/${id}`),
  requestCredit: (data: any) => api.post('/retailer/credit/request', data),
  makeRepayment: (orderId: string, amount: number) =>
    api.post(`/retailer/credit/orders/${orderId}/repay`, { amount }),
  topUpWallet: (amount: number, source: string) => api.post('/retailer/wallet/topup', { amount, source }),

  // Wholesalers & Stock
  getWholesalers: () => api.get('/retailer/wholesalers'),
  getWholesalerProducts: (params?: any) => api.get('/retailer/wholesaler/products', { params }), // Correct endpoint

  // Branch Management
  getBranches: () => api.get('/retailer/branches'),
  getBranchStats: () => api.get('/retailer/branches/stats'),
  getBranch: (id: string) => api.get(`/retailer/branches/${id}`),
  createBranch: (data: any) => api.post('/retailer/branches', data),
  updateBranch: (id: string, data: any) => api.put(`/retailer/branches/${id}`, data),
  deleteBranch: (id: string) => api.delete(`/retailer/branches/${id}`),
  getBranchTransactions: (branchId: string, params?: any) =>
    api.get(`/retailer/branches/${branchId}/transactions`, { params }),
  getBranchSummary: (branchId: string, period?: string) =>
    api.get(`/retailer/branches/${branchId}/summary`, { params: { period } }),

  // POS Terminal Management
  getBranchTerminals: (branchId: string) => api.get(`/retailer/branches/${branchId}/terminals`),
  createTerminal: (branchId: string, data: any) =>
    api.post(`/retailer/branches/${branchId}/terminals`, data),
  updateTerminal: (terminalId: string, data: any) =>
    api.put(`/retailer/terminals/${terminalId}`, data),
  deleteTerminal: (terminalId: string) => api.delete(`/retailer/terminals/${terminalId}`),

  // NFC Cards (Retailer)
  getNFCCards: (params?: any) => api.get('/retailer/nfc-cards', { params }),
  getNFCCardStats: () => api.get('/retailer/nfc-cards/stats'),
  issueNFCCard: (data: any) => api.post('/retailer/nfc-cards/issue', data),
  blockNFCCard: (cardId: string, reason: string) =>
    api.post(`/retailer/nfc-cards/${cardId}/block`, { reason }),
  unblockNFCCard: (cardId: string) => api.post(`/retailer/nfc-cards/${cardId}/unblock`),
  topUpNFCCard: (cardId: string, data: any) =>
    api.post(`/retailer/nfc-cards/${cardId}/topup`, data),
  getNFCCardTransactions: (cardId: string, params?: any) =>
    api.get(`/retailer/nfc-cards/${cardId}/transactions`, { params }),

  // Manual Card Payments (3 Verification Methods)
  verifyPinAndCharge: (cardId: string, pin: string, amount: number, branchId?: string) =>
    api.post('/retailer/manual-payment/verify-pin', { card_id: cardId, pin, amount, branch_id: branchId }),
  generatePaymentCode: (cardId: string, amount: number, customerPhone?: string, branchId?: string) =>
    api.post('/retailer/manual-payment/generate-code', {
      card_id: cardId,
      amount,
      customer_phone: customerPhone,
      branch_id: branchId
    }),
  verifyCodeAndCharge: (cardId: string, code: string, amount: number, branchId?: string) =>
    api.post('/retailer/manual-payment/verify-code', { card_id: cardId, code, amount, branch_id: branchId }),
  requestPaymentOTP: (cardId: string, amount: number, customerPhone: string) =>
    api.post('/retailer/manual-payment/request-otp', {
      card_id: cardId,
      amount,
      customer_phone: customerPhone
    }),
  verifyOTPAndCharge: (cardId: string, otp: string, customerPhone: string, amount: number) =>
    api.post('/retailer/manual-payment/verify-otp', {
      card_id: cardId,
      otp,
      customer_phone: customerPhone,
      amount
    }),
  getPaymentAuditLogs: (params?: { limit?: number; offset?: number; card_id?: string; method?: string }) =>
    api.get('/retailer/manual-payment/audit', { params }),
};

// Wholesaler APIs
export const wholesalerApi = {
  // Dashboard
  getDashboardStats: () => api.get('/wholesaler/dashboard/stats'),

  // Inventory
  getInventory: (params?: any) => api.get('/wholesaler/inventory', { params }),
  getProducts: (params?: any) => api.get('/wholesaler/inventory', { params }),
  getCategories: () => api.get('/wholesaler/inventory/categories'),
  getInventoryStats: () => api.get('/wholesaler/inventory/stats'),
  createProduct: (data: any) => api.post('/wholesaler/inventory', data),
  addInventory: (data: any) => api.post('/wholesaler/inventory', data),
  updateProduct: (id: string, data: any) => api.put(`/wholesaler/inventory/${id}`, data),
  updateInventory: (id: string, data: any) => api.put(`/wholesaler/inventory/${id}`, data),
  updateStock: (id: string, quantity: number, type: string, reason?: string) =>
    api.post(`/wholesaler/inventory/${id}/stock`, { quantity, type, reason }),
  updatePrice: (id: string, wholesalePrice: number, costPrice?: number) =>
    api.put(`/wholesaler/inventory/${id}/price`, { wholesale_price: wholesalePrice, cost_price: costPrice }),
  deleteProduct: (id: string) => api.delete(`/wholesaler/inventory/${id}`),

  // Retailer Orders
  getRetailerOrders: (params?: any) => api.get('/wholesaler/retailer-orders', { params }),
  getOrders: (params?: any) => api.get('/wholesaler/retailer-orders', { params }),
  getOrder: (id: string) => api.get(`/wholesaler/retailer-orders/${id}`),
  getOrderStats: () => api.get('/wholesaler/retailer-orders/stats'),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/wholesaler/retailer-orders/${id}/status`, { status }),
  confirmOrder: (id: string) => api.post(`/wholesaler/retailer-orders/${id}/confirm`),
  rejectOrder: (id: string, reason: string) =>
    api.post(`/wholesaler/retailer-orders/${id}/reject`, { reason }),
  shipOrder: (id: string, trackingNumber?: string, deliveryNotes?: string) =>
    api.post(`/wholesaler/retailer-orders/${id}/ship`, { tracking_number: trackingNumber, delivery_notes: deliveryNotes }),
  confirmDelivery: (id: string) => api.post(`/wholesaler/retailer-orders/${id}/deliver`),

  // Retailers Management
  getRetailers: (params?: any) => api.get('/wholesaler/retailers', { params }),
  getRetailer: (id: string) => api.get(`/wholesaler/retailers/${id}`),
  getRetailerOrdersById: (id: string, limit?: number) =>
    api.get(`/wholesaler/retailers/${id}/orders`, { params: { limit } }),
  getRetailerStats: (id: string) => api.get(`/wholesaler/retailers/${id}/stats`),
  updateRetailerCreditLimit: (id: string, creditLimit: number) =>
    api.put(`/wholesaler/retailers/${id}/credit-limit`, { creditLimit }),
  blockRetailer: (id: string, reason: string) =>
    api.post(`/wholesaler/retailers/${id}/block`, { reason }),
  unblockRetailer: (id: string) => api.post(`/wholesaler/retailers/${id}/unblock`),

  // Credit Management
  getSupplierOrders: () => api.get('/wholesaler/supplier-orders'),
  getCreditRequests: (params?: any) => api.get('/wholesaler/credit-requests', { params }),
  approveCreditRequest: (id: string) => api.post(`/wholesaler/credit-requests/${id}/approve`),
  rejectCreditRequest: (id: string, reason?: string) =>
    api.post(`/wholesaler/credit-requests/${id}/reject`, { reason }),

  // Profile & Settings
  getProfile: () => api.get('/wholesaler/profile'),
  updateProfile: (data: any) => api.put('/wholesaler/profile', data),
  updateSettings: (data: any) => api.put('/wholesaler/settings', data),
};

// NFC Card APIs - for managing customer NFC cards
export const nfcApi = {
  // Customer's own cards
  getMyCards: () => api.get('/nfc/cards'),
  linkCard: (uid: string, pin: string, nickname?: string) =>
    api.post('/nfc/cards/link', { uid, pin, nickname }),
  unlinkCard: (cardId: string) => api.delete(`/nfc/cards/${cardId}`),
  setCardPin: (cardId: string, oldPin: string, newPin: string) =>
    api.put(`/nfc/cards/${cardId}/pin`, { old_pin: oldPin, new_pin: newPin }),
  setPrimaryCard: (cardId: string) => api.put(`/nfc/cards/${cardId}/primary`),
  updateCardNickname: (cardId: string, nickname: string) =>
    api.put(`/nfc/cards/${cardId}/nickname`, { nickname }),

  // POS NFC operations (for retailers)
  processNFCPayment: (cardUid: string, pin: string, amount: number, description?: string) =>
    api.post('/nfc/pos/payment', { card_uid: cardUid, pin, amount, description }),
  checkCardBalance: (cardUid: string, pin: string) =>
    api.post('/nfc/pos/balance', { card_uid: cardUid, pin }),
  validateCard: (cardUid: string) => api.post('/nfc/pos/validate', { card_uid: cardUid }),

  // Admin NFC operations (for wholesaler admin)
  getAllCards: (params?: any) => api.get('/nfc/admin/cards', { params }),
  getCardDetails: (cardId: string) => api.get(`/nfc/admin/cards/${cardId}`),
  blockCard: (cardId: string, reason: string) =>
    api.post(`/nfc/admin/cards/${cardId}/block`, { reason }),
  unblockCard: (cardId: string) => api.post(`/nfc/admin/cards/${cardId}/unblock`),
  getCardTransactions: (cardId: string, params?: any) =>
    api.get(`/nfc/admin/cards/${cardId}/transactions`, { params }),
  issueNewCard: (customerId: string, uid: string, pin: string) =>
    api.post('/nfc/admin/cards/issue', { customer_id: customerId, uid, pin }),
  getCardStats: () => api.get('/nfc/admin/stats'),
};

// Wallet APIs - for managing customer wallets
export const walletApi = {
  // Customer wallet
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params?: any) => api.get('/wallet/transactions', { params }),

  // Top-up
  topUpMobileMoney: (amount: number, phone: string, provider: 'mtn' | 'airtel') =>
    api.post('/wallet/topup/mobile-money', { amount, phone, provider }),
  topUpBankTransfer: (amount: number) => api.post('/wallet/topup/bank', { amount }),
  checkTopUpStatus: (transactionId: string) =>
    api.get(`/wallet/topup/status/${transactionId}`),

  // Transfer
  transfer: (recipientPhone: string, amount: number, pin: string, description?: string) =>
    api.post('/wallet/transfer', { recipient_phone: recipientPhone, amount, pin, description }),

  // Admin wallet operations
  getCustomerWallet: (customerId: string) => api.get(`/wallet/admin/customers/${customerId}`),
  adjustBalance: (customerId: string, amount: number, type: 'credit' | 'debit', reason: string) =>
    api.post(`/wallet/admin/customers/${customerId}/adjust`, { amount, type, reason }),
  getWalletStats: () => api.get('/wallet/admin/stats'),
};

// Admin APIs
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Customers
  getCustomers: (params?: any) => api.get('/admin/customers', { params }),
  getCustomer: (id: string) => api.get(`/admin/customers/${id}`),
  createCustomer: (data: any) => api.post('/admin/customers', data),
  updateCustomer: (id: string, data: any) => api.put(`/admin/customers/${id}`, data),
  deleteCustomer: (id: string) => api.delete(`/admin/customers/${id}`),
  creditCustomer: (id: string, amount: number, reason: string) =>
    api.post(`/admin/customers/${id}/credit`, { amount, reason }),
  updateCustomerStatus: (id: string, data: { status: string }) =>
    api.put(`/admin/customers/${id}/status`, data),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  // Retailers
  getRetailers: (params?: any) => api.get('/admin/retailers', { params }),
  createRetailer: (data: any) => api.post('/admin/retailers', data), // Fixed endpoint
  updateRetailer: (id: string, data: any) => api.put(`/admin/retailers/${id}`, data),
  deleteRetailer: (id: string) => api.delete(`/admin/retailers/${id}`),
  verifyRetailer: (id: string) => api.post(`/admin/retailers/${id}/verify`),
  updateRetailerStatus: (id: string, isActive: boolean, reason?: string) =>
    api.post(`/admin/retailers/${id}/status`, { isActive, reason }),
  updateRetailerCreditLimit: (id: string, creditLimit: number, reason?: string) =>
    api.post(`/admin/retailers/${id}/credit-limit`, { creditLimit, reason }),

  // Wholesalers
  getWholesalers: (params?: any) => api.get('/admin/wholesalers', { params }),
  createWholesaler: (data: any) => api.post('/admin/wholesalers', data), // Fixed endpoint
  updateWholesaler: (id: string, data: any) => api.put(`/admin/wholesalers/${id}`, data),
  deleteWholesaler: (id: string) => api.delete(`/admin/wholesalers/${id}`),
  verifyWholesaler: (id: string) => api.post(`/admin/wholesalers/${id}/verify`),
  updateWholesalerStatus: (id: string, isActive: boolean, reason?: string) =>
    api.post(`/admin/wholesalers/${id}/status`, { isActive, reason }),

  // Loans
  getLoans: (params?: any) => api.get('/admin/loans', { params }),
  approveLoan: (id: string) => api.post(`/admin/loans/${id}/approve`),
  rejectLoan: (id: string, reason: string) => api.post(`/admin/loans/${id}/reject`, { reason }),

  // NFC Cards
  getNFCCards: (params?: any) => api.get('/admin/nfc-cards', { params }),
  registerNFCCard: (cardUid: string, dashboardId?: string) =>
    api.post('/admin/nfc-cards/register', { cardUid, dashboardId }),
  blockNFCCard: (uid: string, blocked: boolean, reason?: string) =>
    api.post(`/admin/nfc-cards/${uid}/block`, { blocked, reason }),

  // Reports
  getTransactionReport: (params?: { startDate?: string; endDate?: string; type?: string; groupBy?: string }) =>
    api.get('/admin/reports/transactions', { params }),
  getRevenueReport: (params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
    api.get('/admin/reports/revenue', { params }),

  // Audit Logs
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings: Record<string, any>) => api.post('/admin/settings', { settings }),
};

// General Auth APIs (Protected)
// These use role-based endpoints: /wholesaler/auth, /retailer/auth, etc.
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || 'wholesaler'; // Default to wholesaler
};

export const authApi = {
  updatePassword: (data: any) => {
    const role = getUserRole();
    return api.put(`/${role}/auth/update-password`, data);
  },
  updatePin: (data: any) => {
    const role = getUserRole();
    return api.put(`/${role}/auth/update-pin`, data);
  },
};

export default api;
