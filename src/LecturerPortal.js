import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Input,
  Form,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Avatar,
  Badge,
  List,
  Steps,
  Alert,
  Descriptions,
  Empty,
  Spin,
  notification,
  Modal,
  Select,
  DatePicker,
  Switch
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoadingOutlined,
  RollbackOutlined,
  WalletOutlined,
  DollarOutlined,
  BookOutlined,
  BellOutlined,
  ArrowLeftOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockWallet, mockKits, mockGroups, mockLecturerFines, mockLecturerRefunds, mockLecturerBorrowStatus } from './mocks';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Helper functions
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'available':
    case 'approved':
    case 'active':
      return 'success';
    case 'pending_approval':
    case 'pending':
      return 'warning';
    case 'rejected':
    case 'damaged':
      return 'error';
    default:
      return 'default';
  }
};

function LecturerPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [kits, setKits] = useState([]);
  const [lecturerGroups, setLecturerGroups] = useState([]);
  const [wallet, setWallet] = useState(mockWallet);
  const [refundRequests, setRefundRequests] = useState([]);
  const [newRefundModal, setNewRefundModal] = useState(false);
  const [refundForm] = Form.useForm();
  const [groupDetailModal, setGroupDetailModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // New state for fines/refunds and borrow status
  const [lecturerFines, setLecturerFines] = useState([]);
  const [lecturerRefunds, setLecturerRefunds] = useState([]);
  const [borrowStatus, setBorrowStatus] = useState([]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setKits(mockKits);
      setWallet(mockWallet);
      const foundGroups = mockGroups.filter(g => g.lecturer === user?.email);
      setLecturerGroups(foundGroups);
      setRefundRequests([
        {
          id: 1,
          kitName: 'Raspberry Pi Kit',
          requester: user?.email,
          requestDate: '2024-01-10',
          refundDate: '2024-01-12',
          status: 'pending_approval',
          reason: 'Kit malfunction',
          purpose: 'Project completion'
        }
      ]);
      
      // Load lecturer-specific data
      const lecturerFinesData = mockLecturerFines.filter(fine => fine.lecturerEmail === user?.email);
      const lecturerRefundsData = mockLecturerRefunds.filter(refund => refund.lecturerEmail === user?.email);
      const borrowStatusData = mockLecturerBorrowStatus.filter(borrow => borrow.lecturerEmail === user?.email);
      
      setLecturerFines(lecturerFinesData);
      setLecturerRefunds(lecturerRefundsData);
      setBorrowStatus(borrowStatusData);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'groups', icon: <TeamOutlined />, label: 'My Groups' },
    { key: 'kits', icon: <ToolOutlined />, label: 'Kit Rental' },
    { key: 'borrow-status', icon: <ShoppingOutlined />, label: 'Borrow Status' },
    { key: 'fines-refunds', icon: <DollarOutlined />, label: 'Fines & Refunds' },
    { key: 'refunds', icon: <RollbackOutlined />, label: 'Refund Requests' },
    { key: 'wallet', icon: <WalletOutlined />, label: 'Wallet' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const handleTopUp = () => {
    navigate('/top-up');
  };

  const handlePayPenalties = () => {
    navigate('/penalty-payment');
  };

  const handleRent = (kit) => {
    navigate('/rental-request', { 
      state: { kit: kit, user: user } 
    });
  };

  const handleNewRefund = () => {
    setNewRefundModal(true);
  };

  const handleViewGroupDetails = (group) => {
    setSelectedGroup(group);
    setGroupDetailModal(true);
  };

  const handleRefundSubmit = async (values) => {
    const newRefund = {
      id: Date.now(),
      kitName: values.kitName,
      requester: user?.email,
      requestDate: new Date().toISOString().split('T')[0],
      refundDate: values.refundDate,
      status: 'pending_approval'
    };
    
    setRefundRequests(prev => [...prev, newRefund]);
    setNewRefundModal(false);
    refundForm.resetFields();
    message.success('Refund request submitted successfully!');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          left: 0,
          top: 0,
          borderRight: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Logo Section */}
        <motion.div 
          style={{ 
            height: 80, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>
            {collapsed ? 'LCT' : 'Lecturer Portal'}
          </Title>
        </motion.div>
        
        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            background: 'transparent',
            padding: '0 16px'
          }}
        />
      </Sider>
      
      {/* Main Content Area */}
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200, 
        transition: 'margin-left 0.3s ease-in-out',
        background: 'transparent'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Header style={{ 
            padding: '0 32px', 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            height: 80
          }}>
            {/* Left Section */}
            <Space size="large">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ 
                    fontSize: '18px', 
                    width: 48, 
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea'
                  }}
                />
              </motion.div>
              <motion.div
                key={selectedKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Title level={2} style={{ margin: 0, color: '#2c3e50', fontWeight: 'bold' }}>
                  {menuItems.find(item => item.key === selectedKey)?.label}
                </Title>
              </motion.div>
            </Space>
            
            {/* Right Section */}
            <Space size="large">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge count={2} size="small" style={{ cursor: 'pointer' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BellOutlined />
                  </div>
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar 
                  icon={<BookOutlined />} 
                  size={48}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="primary"
                  icon={<LogoutOutlined />} 
                  onClick={onLogout}
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    height: 40,
                    padding: '0 20px',
                    fontWeight: 'bold'
                  }}
                >
                  Logout
                </Button>
              </motion.div>
            </Space>
          </Header>
        </motion.div>
        
        {/* Content Area */}
        <Content style={{ 
          margin: '24px', 
          padding: '32px', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          minHeight: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Spin 
            spinning={loading}
            tip="Loading data..."
            size="large"
            indicator={
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <LoadingOutlined style={{ fontSize: 24 }} />
              </motion.div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedKey}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                {selectedKey === 'dashboard' && <DashboardContent lecturerGroups={lecturerGroups} wallet={wallet} kits={kits} />}
                {selectedKey === 'groups' && <GroupsManagement lecturerGroups={lecturerGroups} onViewGroupDetails={handleViewGroupDetails} />}
                {selectedKey === 'kits' && <KitRental kits={kits} user={user} onRent={handleRent} />}
                {selectedKey === 'borrow-status' && <BorrowStatus borrowStatus={borrowStatus} />}
                {selectedKey === 'fines-refunds' && <FinesRefunds lecturerFines={lecturerFines} lecturerRefunds={lecturerRefunds} />}
                {selectedKey === 'refunds' && <RefundRequests refundRequests={refundRequests} setRefundRequests={setRefundRequests} user={user} onNewRefund={handleNewRefund} />}
                {selectedKey === 'wallet' && <WalletManagement wallet={wallet} setWallet={setWallet} onTopUp={handleTopUp} onPayPenalties={handlePayPenalties} />}
                {selectedKey === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

      {/* New Refund Request Modal */}
      <Modal
        title="New Refund Request"
        open={newRefundModal}
        onCancel={() => setNewRefundModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={refundForm}
          layout="vertical"
          onFinish={handleRefundSubmit}
        >
          <Form.Item
            name="kitName"
            label="Kit Name"
            rules={[{ required: true, message: 'Please select a kit' }]}
          >
            <Select placeholder="Select a kit">
              <Option value="Arduino Starter Kit">Arduino Starter Kit</Option>
              <Option value="Raspberry Pi Kit">Raspberry Pi Kit</Option>
              <Option value="IoT Sensor Kit">IoT Sensor Kit</Option>
              <Option value="ESP32 Development Kit">ESP32 Development Kit</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="refundDate"
            label="Refund Date"
            rules={[{ required: true, message: 'Please select refund date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Select refund date"
            />
          </Form.Item>


          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit Request
              </Button>
              <Button onClick={() => setNewRefundModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Group Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>Group Details</span>
          </div>
        }
        open={groupDetailModal}
        onCancel={() => setGroupDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setGroupDetailModal(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedGroup && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedGroup.name}</span>
                      <Tag color="blue">Group ID: {selectedGroup.id}</Tag>
                    </div>
                  }
                  style={{ marginBottom: '16px' }}
                >
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Group Name" span={2}>
                      <Text strong>{selectedGroup.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Group Leader">
                      <Tag color="blue" icon={<UserOutlined />}>
                        {selectedGroup.leader}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Members">
                      <Badge count={selectedGroup.members.length + 1} showZero color="#52c41a" />
                    </Descriptions.Item>
                    <Descriptions.Item label="Lecturer">
                      <Tag color="purple" icon={<UserOutlined />}>
                        {selectedGroup.lecturer}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Group Status">
                      <Tag color="success">Active</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Group Members" style={{ marginBottom: '16px' }}>
                  <List
                    header={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Members List</span>
                        <Badge count={selectedGroup.members.length + 1} showZero color="#52c41a" />
                      </div>
                    }
                    dataSource={[
                      { 
                        email: selectedGroup.leader, 
                        role: 'Leader',
                        avatar: <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                      },
                      ...selectedGroup.members.map(member => ({
                        email: member,
                        role: 'Member',
                        avatar: <Avatar style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} />
                      }))
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={item.avatar}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{item.email}</span>
                              <Tag color={item.role === 'Leader' ? 'blue' : 'green'} size="small">
                                {item.role}
                              </Tag>
                            </div>
                          }
                          description={`Email: ${item.email}`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Group Statistics">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic
                        title="Total Members"
                        value={selectedGroup.members.length + 1}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Leader"
                        value={1}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Members"
                        value={selectedGroup.members.length}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ lecturerGroups, wallet, kits }) => (
  <div>
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="My Groups"
              value={lecturerGroups.length}
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ color: '#667eea', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Total Students"
              value={lecturerGroups.reduce((total, group) => total + group.members.length + 1, 0)}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Available Kits"
              value={kits.filter(kit => kit.status === 'AVAILABLE').length}
              prefix={<ToolOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Wallet Balance"
              value={wallet.balance}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              suffix="VND"
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>

    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      <Col xs={24} lg={12}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="My Groups" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {lecturerGroups.length > 0 ? (
              <List
                size="small"
                dataSource={lecturerGroups}
                renderItem={(group) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} />}
                      title={group.name}
                      description={`Leader: ${group.leader} | Members: ${group.members.length + 1}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No groups assigned yet" />
            )}
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} lg={12}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="Recent Transactions" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <List
              size="small"
              dataSource={wallet.transactions.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<DollarOutlined style={{ color: '#52c41a' }} />}
                    title={item.type}
                    description={item.date}
                  />
                  <div>{item.amount.toLocaleString()} VND</div>
                </List.Item>
              )}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>
  </div>
);

// Groups Management Component
const GroupsManagement = ({ lecturerGroups, onViewGroupDetails }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card title="My Groups" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {lecturerGroups.length > 0 ? (
          <Row gutter={[24, 24]}>
            {lecturerGroups.map((group) => (
              <Col xs={24} md={12} lg={8} key={group.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    title={group.name} 
                    size="small"
                    hoverable
                    onClick={() => onViewGroupDetails(group)}
                    style={{ cursor: 'pointer' }}
                    extra={
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewGroupDetails(group);
                        }}
                      >
                        View Details
                      </Button>
                    }
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Leader">
                        <Tag color="blue">{group.leader}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Members">
                        <Badge count={group.members.length + 1} showZero color="#52c41a" />
                      </Descriptions.Item>
                      <Descriptions.Item label="Members">
                        <div style={{ maxHeight: '60px', overflow: 'hidden' }}>
                          {group.members.length > 0 ? (
                            group.members.map((member, index) => (
                              <Tag key={index} color="green" style={{ marginBottom: '4px' }}>
                                {member}
                              </Tag>
                            ))
                          ) : (
                            <Text type="secondary">No members yet</Text>
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No groups assigned yet" />
        )}
      </Card>
    </motion.div>
  </div>
);

// Kit Rental Component
const KitRental = ({ kits, user, onRent }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card title="Available Kits" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Table
          dataSource={kits.filter(kit => kit.status === 'AVAILABLE')}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Category', dataIndex: 'category', key: 'category' },
            { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
            { 
              title: 'Price', 
              dataIndex: 'price', 
              key: 'price',
              render: (price) => price ? `${price.toLocaleString()} VND` : 'N/A'
            },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (status) => <Tag color="success">{status}</Tag>
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button type="primary" size="small" onClick={() => onRent(record)}>
                    Rent
                  </Button>
                  <Button size="small">Details</Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);

// Refund Requests Component
const RefundRequests = ({ refundRequests, setRefundRequests, user, onNewRefund }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card 
        title="Refund Requests" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={onNewRefund}>
            New Refund Request
          </Button>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Table
          dataSource={refundRequests}
          columns={[
            { title: 'Kit Name', dataIndex: 'kitName', key: 'kitName' },
            { 
              title: 'Request Date', 
              dataIndex: 'requestDate', 
              key: 'requestDate',
              render: (date) => formatDate(date)
            },
            { 
              title: 'Refund Date', 
              dataIndex: 'refundDate', 
              key: 'refundDate',
              render: (date) => formatDate(date)
            },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (status) => (
                <Tag color={getStatusColor(status)}>
                  {status.replace('_', ' ').toUpperCase()}
                </Tag>
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              render: () => <Button size="small">Details</Button>
            },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);

// Wallet Management Component
const WalletManagement = ({ wallet, setWallet, onTopUp, onPayPenalties }) => (
  <div>
    <Row gutter={[24, 24]}>
      <Col xs={24} md={8}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card 
            style={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title="Current Balance"
              value={wallet.balance}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
            <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
              <Button 
                type="primary" 
                onClick={onTopUp}
                style={{ 
                  width: '100%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                Top Up
              </Button>
              <Button 
                onClick={onPayPenalties}
                style={{ 
                  width: '100%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white'
                }}
              >
                Pay Penalties
              </Button>
            </Space>
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} md={16}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="Transaction History" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Table
              dataSource={wallet.transactions}
              columns={[
                {
                  title: 'Type',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type) => <Tag color={type === 'Top-up' ? 'success' : 'primary'}>{type}</Tag>
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount) => `${amount.toLocaleString()} VND`
                },
                { title: 'Date', dataIndex: 'date', key: 'date' },
              ]}
              rowKey={(record, index) => index}
              pagination={false}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>
  </div>
);

// Borrow Status Component
const BorrowStatus = ({ borrowStatus }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card title="Borrow Status Tracking" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Table
          dataSource={borrowStatus}
          columns={[
            { title: 'Kit Name', dataIndex: 'kitName', key: 'kitName' },
            { title: 'Rental ID', dataIndex: 'rentalId', key: 'rentalId' },
            { 
              title: 'Borrow Date', 
              dataIndex: 'borrowDate', 
              key: 'borrowDate',
              render: (date) => formatDate(date)
            },
            { 
              title: 'Due Date', 
              dataIndex: 'dueDate', 
              key: 'dueDate',
              render: (date) => formatDate(date)
            },
            { 
              title: 'Return Date', 
              dataIndex: 'returnDate', 
              key: 'returnDate',
              render: (date) => date ? formatDate(date) : 'Not returned'
            },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (status) => {
                const color = status === 'returned' ? 'success' : 
                            status === 'borrowed' ? 'processing' : 'error';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
              }
            },
            { 
              title: 'Duration (days)', 
              dataIndex: 'duration', 
              key: 'duration' 
            },
            { 
              title: 'Total Cost', 
              dataIndex: 'totalCost', 
              key: 'totalCost',
              render: (cost) => `${cost.toLocaleString()} VND`
            },
            { title: 'Group', dataIndex: 'groupName', key: 'groupName' },
          ]}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </motion.div>
  </div>
);

// Fines & Refunds Component
const FinesRefunds = ({ lecturerFines, lecturerRefunds }) => (
  <div>
    <Row gutter={[24, 24]}>
      {/* Fines Section */}
      <Col xs={24} lg={12}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="My Fines" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Table
              dataSource={lecturerFines}
              columns={[
                { title: 'Kit Name', dataIndex: 'kitName', key: 'kitName' },
                { title: 'Rental ID', dataIndex: 'rentalId', key: 'rentalId' },
                { 
                  title: 'Fine Type', 
                  dataIndex: 'fineType', 
                  key: 'fineType',
                  render: (type) => <Tag color="orange">{type.replace('_', ' ').toUpperCase()}</Tag>
                },
                { 
                  title: 'Amount', 
                  dataIndex: 'fineAmount', 
                  key: 'fineAmount',
                  render: (amount) => `${amount.toLocaleString()} VND`
                },
                { 
                  title: 'Status', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'paid' ? 'success' : 'warning'}>
                      {status.toUpperCase()}
                    </Tag>
                  )
                },
                { 
                  title: 'Due Date', 
                  dataIndex: 'dueDate', 
                  key: 'dueDate',
                  render: (date) => formatDate(date)
                },
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </motion.div>
      </Col>

      {/* Refunds Section */}
      <Col xs={24} lg={12}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="My Refunds" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Table
              dataSource={lecturerRefunds}
              columns={[
                { title: 'Kit Name', dataIndex: 'kitName', key: 'kitName' },
                { title: 'Rental ID', dataIndex: 'rentalId', key: 'rentalId' },
                { 
                  title: 'Refund Type', 
                  dataIndex: 'refundType', 
                  key: 'refundType',
                  render: (type) => <Tag color="blue">{type.replace('_', ' ').toUpperCase()}</Tag>
                },
                { 
                  title: 'Original Amount', 
                  dataIndex: 'originalAmount', 
                  key: 'originalAmount',
                  render: (amount) => `${amount.toLocaleString()} VND`
                },
                { 
                  title: 'Refund Amount', 
                  dataIndex: 'refundAmount', 
                  key: 'refundAmount',
                  render: (amount) => `${amount.toLocaleString()} VND`
                },
                { 
                  title: 'Status', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'approved' ? 'success' : 'warning'}>
                      {status.toUpperCase()}
                    </Tag>
                  )
                },
                { 
                  title: 'Request Date', 
                  dataIndex: 'requestDate', 
                  key: 'requestDate',
                  render: (date) => formatDate(date)
                },
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </motion.div>
      </Col>
    </Row>

    {/* Summary Cards */}
    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      <Col xs={24} sm={8}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Total Fines"
              value={lecturerFines.reduce((sum, fine) => sum + fine.fineAmount, 0)}
              prefix={<DollarOutlined style={{ color: '#ff4d4f' }} />}
              suffix="VND"
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} sm={8}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Total Refunds"
              value={lecturerRefunds.reduce((sum, refund) => sum + refund.refundAmount, 0)}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} sm={8}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Pending Items"
              value={lecturerFines.filter(f => f.status === 'pending').length + lecturerRefunds.filter(r => r.status === 'pending').length}
              prefix={<BellOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>
  </div>
);

// Settings Component
const Settings = () => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card title="Settings" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Notifications" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><Text>Email Notifications</Text><Switch defaultChecked style={{ marginLeft: '16px' }} /></div>
                <div><Text>Push Notifications</Text><Switch defaultChecked style={{ marginLeft: '16px' }} /></div>
                <div><Text>Group Updates</Text><Switch defaultChecked style={{ marginLeft: '16px' }} /></div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Privacy" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><Text>Show Profile to Students</Text><Switch defaultChecked style={{ marginLeft: '16px' }} /></div>
                <div><Text>Allow Direct Messages</Text><Switch defaultChecked style={{ marginLeft: '16px' }} /></div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </motion.div>
  </div>
);

export default LecturerPortal; 