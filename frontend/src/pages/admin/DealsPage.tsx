import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message,
  Statistic,
  Progress,
} from 'antd';
import {
  RocketOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface Deal {
  id: string;
  title: string;
  client: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  owner: string;
  expectedCloseDate: string;
  createdDate: string;
}

export const DealsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form] = Form.useForm();

  const deals: Deal[] = [
    {
      id: '1',
      title: 'Enterprise Software License',
      client: 'ABC Corporation',
      value: 25000000,
      stage: 'negotiation',
      probability: 70,
      owner: 'John Employee',
      expectedCloseDate: '2025-12-31',
      createdDate: '2025-11-01',
    },
    {
      id: '2',
      title: 'Consulting Services',
      client: 'XYZ Ltd',
      value: 15000000,
      stage: 'proposal',
      probability: 50,
      owner: 'Sarah Johnson',
      expectedCloseDate: '2026-01-15',
      createdDate: '2025-11-15',
    },
    {
      id: '3',
      title: 'Annual Maintenance Contract',
      client: 'DEF Industries',
      value: 8000000,
      stage: 'closed_won',
      probability: 100,
      owner: 'Michael Chen',
      expectedCloseDate: '2025-11-30',
      createdDate: '2025-10-01',
    },
  ];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'default',
      qualified: 'processing',
      proposal: 'warning',
      negotiation: 'orange',
      closed_won: 'success',
      closed_lost: 'error',
    };
    return colors[stage] || 'default';
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchText.toLowerCase()) ||
      deal.client.toLowerCase().includes(searchText.toLowerCase());
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const pipelineValue = deals
    .filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    .reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);

  const handleAddDeal = async (values: any) => {
    try {
      console.log('Adding deal:', values);
      message.success('Deal created successfully!');
      setShowAddModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create deal');
    }
  };

  const columns = [
    {
      title: 'Deal',
      key: 'deal',
      render: (_: any, record: Deal) => (
        <div>
          <Text strong>{record.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.client}
          </Text>
        </div>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `${value.toLocaleString()} RWF`,
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => (
        <Tag color={getStageColor(stage)}>{stage.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Probability',
      dataIndex: 'probability',
      key: 'probability',
      render: (prob: number) => (
        <div style={{ width: 100 }}>
          <Progress percent={prob} size="small" />
        </div>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: 'Expected Close',
      dataIndex: 'expectedCloseDate',
      key: 'expectedCloseDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button type="link" icon={<EyeOutlined />}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <RocketOutlined /> Deals & Sales Pipeline
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Pipeline"
              value={totalValue}
              prefix="RWF"
              valueStyle={{ color: '#1890ff', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Closed Won"
              value={wonValue}
              prefix="RWF"
              valueStyle={{ color: '#52c41a', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Weighted Pipeline"
              value={Math.round(pipelineValue)}
              prefix="RWF"
              valueStyle={{ color: '#722ed1', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Deals"
              value={deals.length}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="All Deals"
        extra={
          <Space>
            <Input
              placeholder="Search deals..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select value={stageFilter} onChange={setStageFilter} style={{ width: 150 }}>
              <Option value="all">All Stages</Option>
              <Option value="lead">Lead</Option>
              <Option value="qualified">Qualified</Option>
              <Option value="proposal">Proposal</Option>
              <Option value="negotiation">Negotiation</Option>
              <Option value="closed_won">Closed Won</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>
              Add Deal
            </Button>
          </Space>
        }
      >
        <Table dataSource={filteredDeals} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="Add New Deal"
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleAddDeal}>
          <Form.Item name="title" label="Deal Title" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="client" label="Client Name" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="Deal Value (RWF)" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stage" label="Stage" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="lead">Lead</Option>
                  <Option value="qualified">Qualified</Option>
                  <Option value="proposal">Proposal</Option>
                  <Option value="negotiation">Negotiation</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="probability" label="Win Probability (%)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="owner" label="Deal Owner" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expectedCloseDate" label="Expected Close Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setShowAddModal(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Add Deal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DealsPage;
