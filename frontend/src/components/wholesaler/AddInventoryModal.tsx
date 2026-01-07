import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import { wholesalerApi } from '../../services/apiService';

interface AddInventoryModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const { TextArea } = Input;

const defaultCategories = [
    'Grains & Cereals',
    'Cooking Essentials',
    'Beverages',
    'Snacks',
    'Dairy & Eggs',
    'Meat & Fish',
    'Fruits & Vegetables',
    'Household Items',
    'Personal Care',
    'Baby Products',
];

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
    open,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>(defaultCategories);

    useEffect(() => {
        if (open) {
            fetchCategories();
        }
    }, [open]);

    const fetchCategories = async () => {
        try {
            const response = await wholesalerApi.getCategories();
            if (response.data?.categories?.length > 0) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await wholesalerApi.createProduct(values);

            message.success('Inventory added successfully');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            if (error.errorFields) return;
            message.error(error.response?.data?.error || 'Failed to add inventory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Add New Inventory Item"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Add Item"
            width={700}
            centered
            style={{ borderRadius: '12px', overflow: 'hidden' }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ stock: 0, low_stock_threshold: 10, unit: 'units' }}
                style={{ marginTop: '16px' }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Product Name"
                            rules={[{ required: true, message: 'Please enter product name' }]}
                        >
                            <Input placeholder="e.g. Premium Basmati Rice" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="sku"
                            label="SKU / Item Code"
                            rules={[{ required: true, message: 'Please enter SKU' }]}
                        >
                            <Input placeholder="e.g. BR-001" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[{ required: true, message: 'Please select category' }]}
                        >
                            <Select placeholder="Select category" showSearch>
                                {categories.map(cat => (
                                    <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="unit"
                            label="Unit of Measure"
                            rules={[{ required: true, message: 'Please select unit' }]}
                        >
                            <Select placeholder="Select unit">
                                <Select.Option value="units">Units / Pieces</Select.Option>
                                <Select.Option value="kg">Kilograms (kg)</Select.Option>
                                <Select.Option value="liters">Liters (L)</Select.Option>
                                <Select.Option value="packs">Packs</Select.Option>
                                <Select.Option value="boxes">Boxes</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="cost_price"
                            label="Supplier Cost Price (RWF)"
                            rules={[{ required: true, message: 'Please enter cost price' }]}
                            tooltip="The price you pay to the supplier/manufacturer"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="wholesale_price"
                            label="Wholesale Selling Price (RWF)"
                            rules={[{ required: true, message: 'Please enter selling price' }]}
                            tooltip="The price you charge retailers"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="stock"
                            label="Initial Stock Quantity"
                            rules={[{ required: true, message: 'Please enter initial stock' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="low_stock_threshold"
                            label="Low Stock Alert Threshold"
                            rules={[{ required: true, message: 'Please enter threshold' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="invoice_number"
                            label="Wholesaler Invoice No."
                            rules={[{ required: true, message: 'Please enter invoice number' }]}
                            tooltip="Used by retailers to add this product to their inventory"
                        >
                            <Input placeholder="e.g. WHL-INV-001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="barcode" label="Barcode (Optional)">
                            <Input placeholder="Scan or enter barcode" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="description" label="Description (Optional)">
                    <TextArea rows={3} placeholder="Enter product details..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};
