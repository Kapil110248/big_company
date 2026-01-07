import axios from 'axios';

// Use production URL by default, but local port 9000 for development
const API_URL = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'https://big-pos-backend-production.up.railway.app'
        : 'https://bigcompany-api.alexandratechlab.com');

const getAuthHeader = () => {
    const token = localStorage.getItem('bigcompany_token');
    // For admin, we also check admin_token which might be set for legacy reasons
    const adminToken = localStorage.getItem('admin_token');
    return {
        headers: {
            'Authorization': `Bearer ${token || adminToken}`,
            'Content-Type': 'application/json'
        }
    };
};

export interface Employee {
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    salary: number;
    status: 'active' | 'inactive' | 'on_leave';
    dateOfJoining: string;
    reportingTo?: string;
    bankAccount?: string;
}

export const employeeService = {
    // Get all employees
    getEmployees: async () => {
        const response = await axios.get(`${API_URL}/admin/employees`, getAuthHeader());
        return response.data;
    },

    // Create employee
    createEmployee: async (data: any) => {
        const response = await axios.post(`${API_URL}/admin/employees`, data, getAuthHeader());
        return response.data;
    },

    // Update employee
    updateEmployee: async (id: string, data: any) => {
        const response = await axios.put(`${API_URL}/admin/employees/${id}`, data, getAuthHeader());
        return response.data;
    },

    // Delete employee
    deleteEmployee: async (id: string) => {
        const response = await axios.delete(`${API_URL}/admin/employees/${id}`, getAuthHeader());
        return response.data;
    }
};
