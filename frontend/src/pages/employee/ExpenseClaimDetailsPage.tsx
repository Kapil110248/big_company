import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Timeline,
  Image,
  Alert,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ShopOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const ExpenseClaimDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock data
  const expense = {
    id: id || '1',
    title: 'Client Meeting Lunch',
    category: 'Meals & Entertainment',
    amount: 45000,
    currency: 'RWF',
    date: '2025-11-28',
    status: 'approved',
    description:
      'Business lunch meeting with ABC Corporation client to discuss Q1 2026 partnership opportunities and product roadmap.',
    merchant: 'The Manor Hotel Restaurant',
    receipt: '/receipts/receipt-001.pdf',
    receiptImage: 'https://via.placeholder.com/600x800?text=Receipt+Image',
    submittedDate: '2025-11-29',
    submittedBy: 'You',
    approvedDate: '2025-11-30',
    approvedBy: 'Jane Manager',
    approverComments: 'Approved. Valid business expense with proper documentation.',
    paidDate: undefined,
    rejectionReason: undefined,
    paymentMethod: 'Direct Deposit',
    reimbursementAccount: '**** **** **** 1234',
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      approved: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      rejected: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      paid: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      paid: 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      {/* Header */}
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employee/expense-claims')}>
          Back to Expense Claims
        </Button>
      </Space>

      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <DollarOutlined /> {expense.title}
          </Title>
        </Col>
        <Col>
          <Space>
            <Tag color={getStatusColor(expense.status)} style={{ fontSize: 16, padding: '4px 16px' }}>
              {getStatusIcon(expense.status)} {expense.status.toUpperCase()}
            </Tag>
          </Space>
        </Col>
      </Row>

      {/* Status Alert */}
      {expense.status === 'pending' && (
        <Alert
          message="Claim Pending Review"
          description="Your expense claim has been submitted and is awaiting approval from your manager."
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {expense.status === 'approved' && !expense.paidDate && (
        <Alert
          message="Claim Approved"
          description={`Your expense claim has been approved by ${expense.approvedBy}. Payment will be processed in the next payroll cycle.`}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {expense.status === 'rejected' && (
        <Alert
          message="Claim Rejected"
          description={expense.rejectionReason || 'Your expense claim was not approved.'}
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {expense.status === 'paid' && (
        <Alert
          message="Claim Paid"
          description={`Reimbursement of ${expense.amount.toLocaleString()} ${expense.currency} has been processed to your account.`}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Expense Details */}
        <Col xs={24} lg={12}>
          <Card title="Expense Details" extra={<FileTextOutlined />}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Expense Title">{expense.title}</Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{expense.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {expense.amount.toLocaleString()} {expense.currency}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Expense Date">
                <Space>
                  <CalendarOutlined />
                  {dayjs(expense.date).format('MMMM DD, YYYY')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Merchant/Vendor">
                <Space>
                  <ShopOutlined />
                  {expense.merchant}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Description">{expense.description}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Timeline */}
          <Card title="Status Timeline" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item color="blue" dot={<UserOutlined />}>
                <Space direction="vertical">
                  <Text strong>Submitted</Text>
                  <Text type="secondary">{dayjs(expense.submittedDate).format('MMM DD, YYYY HH:mm')}</Text>
                  <Text type="secondary">By: {expense.submittedBy}</Text>
                </Space>
              </Timeline.Item>

              {expense.approvedDate && (
                <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                  <Space direction="vertical">
                    <Text strong>Approved</Text>
                    <Text type="secondary">{dayjs(expense.approvedDate).format('MMM DD, YYYY HH:mm')}</Text>
                    <Text type="secondary">By: {expense.approvedBy}</Text>
                    {expense.approverComments && (
                      <Alert
                        message="Manager Comments"
                        description={expense.approverComments}
                        type="success"
                        showIcon={false}
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </Space>
                </Timeline.Item>
              )}

              {expense.paidDate && (
                <Timeline.Item color="purple" dot={<DollarOutlined />}>
                  <Space direction="vertical">
                    <Text strong>Payment Processed</Text>
                    <Text type="secondary">{dayjs(expense.paidDate).format('MMM DD, YYYY HH:mm')}</Text>
                    <Text type="secondary">Method: {expense.paymentMethod}</Text>
                    <Text type="secondary">Account: {expense.reimbursementAccount}</Text>
                  </Space>
                </Timeline.Item>
              )}

              {expense.status === 'pending' && (
                <Timeline.Item color="gray" dot={<ClockCircleOutlined />}>
                  <Space direction="vertical">
                    <Text strong>Awaiting Approval</Text>
                    <Text type="secondary">Pending manager review</Text>
                  </Space>
                </Timeline.Item>
              )}

              {expense.rejectionReason && (
                <Timeline.Item color="red" dot={<CloseCircleOutlined />}>
                  <Space direction="vertical">
                    <Text strong>Rejected</Text>
                    <Text type="secondary">Reason: {expense.rejectionReason}</Text>
                  </Space>
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Col>

        {/* Receipt */}
        <Col xs={24} lg={12}>
          <Card
            title="Receipt"
            extra={
              <Button icon={<DownloadOutlined />} type="link">
                Download
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} align="center">
              <Image
                src={expense.receiptImage}
                alt="Receipt"
                style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #d9d9d9' }}
              />
              <Divider />
              <Descriptions column={1} size="small">
                <Descriptions.Item label="File Name">receipt-001.pdf</Descriptions.Item>
                <Descriptions.Item label="Upload Date">
                  {dayjs(expense.submittedDate).format('MMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="File Size">245 KB</Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>

          {/* Reimbursement Details */}
          {(expense.status === 'approved' || expense.status === 'paid') && (
            <Card title="Reimbursement Details" style={{ marginTop: 16 }}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Payment Method">{expense.paymentMethod}</Descriptions.Item>
                <Descriptions.Item label="Account">{expense.reimbursementAccount}</Descriptions.Item>
                <Descriptions.Item label="Amount">
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    {expense.amount.toLocaleString()} {expense.currency}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {expense.paidDate ? (
                    <Tag color="success">PAID</Tag>
                  ) : (
                    <Tag color="processing">PENDING PAYMENT</Tag>
                  )}
                </Descriptions.Item>
                {expense.paidDate && (
                  <Descriptions.Item label="Paid Date">
                    {dayjs(expense.paidDate).format('MMM DD, YYYY')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ExpenseClaimDetailsPage;
