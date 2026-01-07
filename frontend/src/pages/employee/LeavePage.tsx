import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Table, Tag, Modal, Form, Input, DatePicker, Select, message, Statistic, Progress } from 'antd';
import { CalendarOutlined, PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const LeavePage: React.FC = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [form] = Form.useForm();
  
  const leaveBalance = { vacation: 15, sick: 10, personal: 5 };
  const leaveRequests = [
    { id: '1', type: 'Vacation', startDate: '2025-12-20', endDate: '2025-12-27', days: 5, status: 'approved', reason: 'Family holiday' },
  ];

  const handleSubmit = async (values: any) => {
    const [start, end] = values.dateRange;
    const days = end.diff(start, 'day') + 1;
    message.success(`Leave request submitted for ${days} days!`);
    setShowRequestModal(false);
    form.resetFields();
  };

  return (
    <div>
      <Title level={2}><CalendarOutlined /> Leave Management</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><Card><Statistic title="Vacation" value={leaveBalance.vacation} suffix="days" valueStyle={{ color: '#52c41a' }} /><Progress percent={(leaveBalance.vacation/20)*100} showInfo={false} strokeColor="#52c41a" /></Card></Col>
        <Col span={8}><Card><Statistic title="Sick Leave" value={leaveBalance.sick} suffix="days" valueStyle={{ color: '#1890ff' }} /><Progress percent={(leaveBalance.sick/12)*100} showInfo={false} strokeColor="#1890ff" /></Card></Col>
        <Col span={8}><Card><Statistic title="Personal" value={leaveBalance.personal} suffix="days" valueStyle={{ color: '#faad14' }} /><Progress percent={(leaveBalance.personal/6)*100} showInfo={false} strokeColor="#faad14" /></Card></Col>
      </Row>

      <Card title="My Leave Requests" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setShowRequestModal(true)}>Request Leave</Button>}>
        <Table
          dataSource={leaveRequests}
          columns={[
            { title: 'Type', dataIndex: 'type', key: 'type' },
            { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
            { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
            { title: 'Days', dataIndex: 'days', key: 'days' },
            { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'approved' ? 'success' : status === 'pending' ? 'processing' : 'error'}>{status.toUpperCase()}</Tag> },
          ]}
          rowKey="id"
        />
      </Card>

      <Modal title="Request Leave" open={showRequestModal} onCancel={() => setShowRequestModal(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true }]}>
            <Select size="large"><Select.Option value="vacation">Vacation</Select.Option><Select.Option value="sick">Sick Leave</Select.Option><Select.Option value="personal">Personal</Select.Option></Select>
          </Form.Item>
          <Form.Item name="dateRange" label="Dates" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Please provide a reason for your leave request" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowRequestModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Submit Request</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeavePage;
