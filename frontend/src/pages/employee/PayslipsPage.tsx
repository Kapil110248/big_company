import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Table, Tag, Modal, Descriptions, Divider, Statistic, Alert } from 'antd';
import { DollarOutlined, DownloadOutlined, EyeOutlined, FileTextOutlined, CreditCardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface PayslipItem {
  id: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
  status: 'paid' | 'pending' | 'processing';
  payDate: string;
  deductions: {
    tax: number;
    insurance: number;
    pension: number;
    billPayments: number;
  };
  allowances: {
    transport: number;
    housing: number;
    meal: number;
  };
}

export const PayslipsPage: React.FC = () => {
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const payslips: PayslipItem[] = [
    {
      id: '1',
      month: 'November',
      year: 2025,
      grossSalary: 850000,
      netSalary: 645000,
      totalDeductions: 205000,
      status: 'paid',
      payDate: '2025-11-30',
      deductions: {
        tax: 85000,
        insurance: 25000,
        pension: 42500,
        billPayments: 52500,
      },
      allowances: {
        transport: 50000,
        housing: 100000,
        meal: 30000,
      },
    },
    {
      id: '2',
      month: 'October',
      year: 2025,
      grossSalary: 850000,
      netSalary: 648000,
      totalDeductions: 202000,
      status: 'paid',
      payDate: '2025-10-31',
      deductions: {
        tax: 85000,
        insurance: 25000,
        pension: 42500,
        billPayments: 49500,
      },
      allowances: {
        transport: 50000,
        housing: 100000,
        meal: 30000,
      },
    },
    {
      id: '3',
      month: 'September',
      year: 2025,
      grossSalary: 850000,
      netSalary: 642000,
      totalDeductions: 208000,
      status: 'paid',
      payDate: '2025-09-30',
      deductions: {
        tax: 85000,
        insurance: 25000,
        pension: 42500,
        billPayments: 55500,
      },
      allowances: {
        transport: 50000,
        housing: 100000,
        meal: 30000,
      },
    },
  ];

  const handleViewDetails = (payslip: PayslipItem) => {
    setSelectedPayslip(payslip);
    setShowDetailsModal(true);
  };

  const handleDownload = (payslip: PayslipItem) => {
    // Simulate PDF download
    console.log('Downloading payslip:', payslip.id);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} RWF`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'success',
      pending: 'warning',
      processing: 'processing',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Period',
      key: 'period',
      render: (_: any, record: PayslipItem) => `${record.month} ${record.year}`,
    },
    {
      title: 'Gross Salary',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Deductions',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      render: (amount: number) => <Text type="danger">{formatCurrency(amount)}</Text>,
    },
    {
      title: 'Net Salary',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (amount: number) => <Text strong style={{ color: '#52c41a' }}>{formatCurrency(amount)}</Text>,
    },
    {
      title: 'Pay Date',
      dataIndex: 'payDate',
      key: 'payDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PayslipItem) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
            View
          </Button>
          <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const latestPayslip = payslips[0];

  return (
    <div>
      <Title level={2}>
        <DollarOutlined /> Payslips
      </Title>

      {/* Current Month Summary */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
        <Row gutter={16}>
          <Col span={24}>
            <Text style={{ color: 'white', fontSize: 16 }}>
              Latest Payslip - {latestPayslip.month} {latestPayslip.year}
            </Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 8 }}>Gross Salary</Text>
              <Text strong style={{ color: 'white', fontSize: 24 }}>{formatCurrency(latestPayslip.grossSalary)}</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 8 }}>Total Deductions</Text>
              <Text strong style={{ color: 'white', fontSize: 24 }}>{formatCurrency(latestPayslip.totalDeductions)}</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 8 }}>Net Salary</Text>
              <Text strong style={{ color: 'white', fontSize: 24 }}>{formatCurrency(latestPayslip.netSalary)}</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Deductions Breakdown */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tax Deduction"
              value={latestPayslip.deductions.tax}
              prefix="RWF"
              valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Insurance"
              value={latestPayslip.deductions.insurance}
              prefix="RWF"
              valueStyle={{ color: '#1890ff', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pension"
              value={latestPayslip.deductions.pension}
              prefix="RWF"
              valueStyle={{ color: '#722ed1', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Bill Payments"
              value={latestPayslip.deductions.billPayments}
              prefix="RWF"
              valueStyle={{ color: '#faad14', fontSize: 18 }}
              suffix={<CreditCardOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert for bill payments */}
      {latestPayslip.deductions.billPayments > 0 && (
        <Alert
          message="Bill Payment Deductions"
          description={`${formatCurrency(latestPayslip.deductions.billPayments)} was automatically deducted for your scheduled bill payments this month. View details in the Bill Payments section.`}
          type="info"
          showIcon
          icon={<CreditCardOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Payslips History */}
      <Card title="Payslip History" extra={<FileTextOutlined />}>
        <Table
          dataSource={payslips}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title={`Payslip Details - ${selectedPayslip?.month} ${selectedPayslip?.year}`}
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => selectedPayslip && handleDownload(selectedPayslip)}>
            Download PDF
          </Button>,
        ]}
        width={700}
      >
        {selectedPayslip && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Pay Period" span={2}>
                {selectedPayslip.month} {selectedPayslip.year}
              </Descriptions.Item>
              <Descriptions.Item label="Pay Date" span={2}>
                {dayjs(selectedPayslip.payDate).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag color={getStatusColor(selectedPayslip.status)}>{selectedPayslip.status.toUpperCase()}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Earnings</Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Basic Salary">
                {formatCurrency(670000)}
              </Descriptions.Item>
              <Descriptions.Item label="Transport Allowance">
                {formatCurrency(selectedPayslip.allowances.transport)}
              </Descriptions.Item>
              <Descriptions.Item label="Housing Allowance">
                {formatCurrency(selectedPayslip.allowances.housing)}
              </Descriptions.Item>
              <Descriptions.Item label="Meal Allowance">
                {formatCurrency(selectedPayslip.allowances.meal)}
              </Descriptions.Item>
              <Descriptions.Item label="Gross Salary" span={2}>
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  {formatCurrency(selectedPayslip.grossSalary)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Deductions</Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Income Tax">
                {formatCurrency(selectedPayslip.deductions.tax)}
              </Descriptions.Item>
              <Descriptions.Item label="Health Insurance">
                {formatCurrency(selectedPayslip.deductions.insurance)}
              </Descriptions.Item>
              <Descriptions.Item label="Pension Fund">
                {formatCurrency(selectedPayslip.deductions.pension)}
              </Descriptions.Item>
              <Descriptions.Item label="Bill Payments">
                <Space>
                  {formatCurrency(selectedPayslip.deductions.billPayments)}
                  <CreditCardOutlined style={{ color: '#faad14' }} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Total Deductions" span={2}>
                <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                  {formatCurrency(selectedPayslip.totalDeductions)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Net Pay</Divider>
            <div style={{ textAlign: 'center', padding: '24px', background: '#f0f2f5', borderRadius: 8 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                Net Salary (Direct Deposit)
              </Text>
              <Text strong style={{ fontSize: 32, color: '#52c41a' }}>
                {formatCurrency(selectedPayslip.netSalary)}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayslipsPage;
