import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Divider,
  Upload,
  message,
  Avatar,
  Descriptions,
  Tag,
  Select,
  Alert,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  BankOutlined,
  SaveOutlined,
  UploadOutlined,
  CreditCardOutlined,
  SafetyOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface BankAccountInfo {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchName: string;
  accountType: 'savings' | 'checking';
  swiftCode?: string;
}

export const EmployeeProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [bankForm] = Form.useForm();

  const [employeeInfo] = useState({
    id: user?.id || 'emp-001',
    employeeNumber: user?.employee_number || 'EMP001',
    firstName: 'John',
    lastName: 'Employee',
    email: user?.email || 'employee@bigcompany.rw',
    phone: user?.phone || '250788200001',
    department: user?.department || 'Sales',
    position: user?.position || 'Sales Representative',
    dateOfJoining: '2023-01-15',
    address: '123 Main Street, Kigali, Rwanda',
    emergencyContact: '250788200002',
    emergencyContactName: 'Jane Employee',
    emergencyContactRelation: 'Spouse',
  });

  const [bankAccount, setBankAccount] = useState<BankAccountInfo>({
    accountHolderName: 'John Employee',
    bankName: 'Bank of Kigali',
    accountNumber: '1234567890',
    branchName: 'Kigali City Branch',
    accountType: 'savings',
    swiftCode: 'BKIGRWRW',
  });

  const [documents] = useState([
    { id: '1', name: 'National ID', status: 'verified', uploadDate: '2023-01-10' },
    { id: '2', name: 'Employment Contract', status: 'verified', uploadDate: '2023-01-15' },
    { id: '3', name: 'Tax Certificate', status: 'verified', uploadDate: '2023-01-20' },
  ]);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBankAccount = async (values: BankAccountInfo) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBankAccount(values);
      message.success('Bank account information updated successfully!');
      message.info('Direct deposit will be processed to this account for future payroll.');
    } catch (error) {
      message.error('Failed to update bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed`);
    }
  };

  return (
    <div>
      <Title level={2}>
        <UserOutlined /> My Profile
      </Title>

      {/* Profile Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar size={100} icon={<UserOutlined />} style={{ background: '#f59e0b' }} />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ margin: 0 }}>
              {employeeInfo.firstName} {employeeInfo.lastName}
            </Title>
            <Space direction="vertical" size="small">
              <Text type="secondary">
                {employeeInfo.position} • {employeeInfo.department}
              </Text>
              <Space>
                <Tag color="orange">Employee ID: {employeeInfo.employeeNumber}</Tag>
                <Tag color="green">Active</Tag>
              </Space>
            </Space>
          </Col>
          <Col>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUploadDocument}
            >
              <Button icon={<UploadOutlined />}>Change Photo</Button>
            </Upload>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Personal Information */}
        <Col xs={24} lg={12}>
          <Card title="Personal Information" extra={<UserOutlined />}>
            <Form
              form={form}
              layout="vertical"
              initialValues={employeeInfo}
              onFinish={handleUpdateProfile}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item name="address" label="Address">
                <TextArea rows={2} />
              </Form.Item>

              <Divider>Emergency Contact</Divider>

              <Form.Item name="emergencyContactName" label="Contact Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item name="emergencyContact" label="Contact Number" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item name="emergencyContactRelation" label="Relationship">
                <Select>
                  <Option value="Spouse">Spouse</Option>
                  <Option value="Parent">Parent</Option>
                  <Option value="Sibling">Sibling</Option>
                  <Option value="Child">Child</Option>
                  <Option value="Friend">Friend</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} block>
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Bank Account for Direct Deposit */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BankOutlined />
                <span>Bank Account (Direct Deposit)</span>
              </Space>
            }
            extra={<CreditCardOutlined />}
          >
            <Alert
              message="Direct Deposit Information"
              description="Your salary and automatic bill payments will be processed through this bank account. Ensure the information is accurate."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form
              form={bankForm}
              layout="vertical"
              initialValues={bankAccount}
              onFinish={handleUpdateBankAccount}
            >
              <Form.Item
                name="accountHolderName"
                label="Account Holder Name"
                rules={[{ required: true, message: 'Please enter account holder name' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="bankName"
                label="Bank Name"
                rules={[{ required: true, message: 'Please select bank name' }]}
              >
                <Select>
                  <Option value="Bank of Kigali">Bank of Kigali</Option>
                  <Option value="Equity Bank">Equity Bank Rwanda</Option>
                  <Option value="I&M Bank">I&M Bank Rwanda</Option>
                  <Option value="Access Bank">Access Bank Rwanda</Option>
                  <Option value="KCB Bank">KCB Bank Rwanda</Option>
                  <Option value="Cogebanque">Cogebanque</Option>
                  <Option value="Ecobank">Ecobank Rwanda</Option>
                  <Option value="GT Bank">GT Bank Rwanda</Option>
                  <Option value="BPR">Banque Populaire du Rwanda</Option>
                  <Option value="Urwego Bank">Urwego Opportunity Bank</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="accountNumber"
                label="Account Number"
                rules={[{ required: true, message: 'Please enter account number' }]}
              >
                <Input prefix={<BankOutlined />} />
              </Form.Item>

              <Form.Item
                name="branchName"
                label="Branch Name"
                rules={[{ required: true, message: 'Please enter branch name' }]}
              >
                <Input prefix={<HomeOutlined />} />
              </Form.Item>

              <Form.Item
                name="accountType"
                label="Account Type"
                rules={[{ required: true, message: 'Please select account type' }]}
              >
                <Select>
                  <Option value="savings">Savings Account</Option>
                  <Option value="checking">Checking Account</Option>
                </Select>
              </Form.Item>

              <Form.Item name="swiftCode" label="SWIFT Code (Optional)">
                <Input prefix={<SafetyOutlined />} placeholder="For international transfers" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} block>
                  Update Bank Account
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Current Bank Account Display */}
          <Card title="Current Bank Account" style={{ marginTop: 16 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Account Holder">{bankAccount.accountHolderName}</Descriptions.Item>
              <Descriptions.Item label="Bank">{bankAccount.bankName}</Descriptions.Item>
              <Descriptions.Item label="Account Number">**** **** {bankAccount.accountNumber.slice(-4)}</Descriptions.Item>
              <Descriptions.Item label="Branch">{bankAccount.branchName}</Descriptions.Item>
              <Descriptions.Item label="Account Type">
                <Tag color="blue">{bankAccount.accountType.toUpperCase()}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Employment Details */}
        <Col xs={24} lg={12}>
          <Card title="Employment Details" extra={<FileTextOutlined />}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Employee ID">{employeeInfo.employeeNumber}</Descriptions.Item>
              <Descriptions.Item label="Department">{employeeInfo.department}</Descriptions.Item>
              <Descriptions.Item label="Position">{employeeInfo.position}</Descriptions.Item>
              <Descriptions.Item label="Date of Joining">{employeeInfo.dateOfJoining}</Descriptions.Item>
              <Descriptions.Item label="Employment Status">
                <Tag color="green">Active</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Documents */}
        <Col xs={24} lg={12}>
          <Card
            title="Documents"
            extra={
              <Upload showUploadList={false} beforeUpload={() => false} onChange={handleUploadDocument}>
                <Button icon={<UploadOutlined />}>Upload Document</Button>
              </Upload>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {documents.map((doc) => (
                <Card key={doc.id} size="small">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <div>
                          <Text strong>{doc.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Uploaded: {doc.uploadDate}
                          </Text>
                        </div>
                      </Space>
                    </Col>
                    <Col>
                      <Tag color={doc.status === 'verified' ? 'success' : 'processing'}>
                        {doc.status.toUpperCase()}
                      </Tag>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeProfilePage;
