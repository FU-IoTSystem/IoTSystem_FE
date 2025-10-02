import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tooltip,
  Avatar,
  Badge,
  Divider,
  List,
  Timeline,
  Progress,
  Switch,
  DatePicker,
  Upload,
  Drawer,
  Tabs,
  Alert,
  Descriptions,
  Steps,
  Result,
  Empty,
  Skeleton,
  Spin,
  notification
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  BellOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  BugOutlined,
  BuildOutlined,
  CarOutlined,
  HomeOutlined,
  BookOutlined,
  ExperimentOutlined,
  RobotOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  DislikeOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  StopOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  ShuffleOutlined,
  RetweetOutlined,
  SwapOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoadingOutlined,
  RollbackOutlined,
  WalletOutlined,
  GiftOutlined,
  TrophyOutlined as TrophyIcon,
  GroupOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined as TeamIcon,
  CrownOutlined,
  StarOutlined as StarIcon,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined as ThunderIcon,
  BulbOutlined as BulbIcon,
  ExperimentOutlined as ExperimentIcon,
  RobotOutlined as RobotIcon,
  WifiOutlined as WifiIcon,
  CarOutlined as CarIcon,
  HomeOutlined as HomeIcon,
  BookOutlined as BookIcon,
  EnvironmentOutlined as EnvironmentIcon,
  SafetyCertificateOutlined as SafetyIcon,
  BugOutlined as BugIcon,
  BuildOutlined as BuildIcon,
  ToolOutlined as ToolIcon,
  ShoppingOutlined as ShoppingIcon,
  FileTextOutlined as FileTextIcon,
  SettingOutlined as SettingIcon,
  DashboardOutlined as DashboardIcon,
  UserOutlined as UserIcon,
  TeamOutlined as TeamIcon2,
  LogoutOutlined as LogoutIcon,
  PlusOutlined as PlusIcon,
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  EyeOutlined as EyeIcon,
  CheckCircleOutlined as CheckCircleIcon,
  CloseCircleOutlined as CloseCircleIcon,
  ClockCircleOutlined as ClockCircleIcon,
  ExclamationCircleOutlined as ExclamationCircleIcon,
  ReloadOutlined as ReloadIcon,
  DownloadOutlined as DownloadIcon,
  UploadOutlined as UploadIcon,
  SearchOutlined as SearchIcon,
  FilterOutlined as FilterIcon,
  BarChartOutlined as BarChartIcon,
  PieChartOutlined as PieChartIcon,
  LineChartOutlined as LineChartIcon,
  BellOutlined as BellIcon,
  MailOutlined as MailIcon,
  CalendarOutlined as CalendarIcon,
  DollarOutlined as DollarIcon,
  HeartOutlined as HeartIcon,
  StarOutlined as StarIcon2,
  LikeOutlined as LikeIcon,
  DislikeOutlined as DislikeIcon,
  QuestionCircleOutlined as QuestionCircleIcon,
  InfoCircleOutlined as InfoCircleIcon,
  WarningOutlined as WarningIcon,
  CheckOutlined as CheckIcon,
  StopOutlined as StopIcon,
  PlayCircleOutlined as PlayCircleIcon,
  PauseCircleOutlined as PauseCircleIcon,
  StepForwardOutlined as StepForwardIcon,
  StepBackwardOutlined as StepBackwardIcon,
  FastForwardOutlined as FastForwardIcon,
  FastBackwardOutlined as FastBackwardIcon,
  ShuffleOutlined as ShuffleIcon,
  RetweetOutlined as RetweetIcon,
  SwapOutlined as SwapIcon
} from '@ant-design/icons';
import { mockWallet, mockKits, mockGroups } from './mocks';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Helper functions accessible to all components
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
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
    case 'in progress':
      return 'warning';
    case 'rejected':
    case 'damaged':
    case 'missing':
    case 'suspended':
      return 'error';
    case 'in-use':
    case 'borrowed':
      return 'processing';
    default:
      return 'default';
  }
};

function LeaderPortal({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [kits, setKits] = useState([]);
  const [group, setGroup] = useState(null);
  const [wallet, setWallet] = useState(mockWallet);
  const [refundRequests, setRefundRequests] = useState([]);
  
  // Modal states
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [rentalModalVisible, setRentalModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form instances
  const [kitForm] = Form.useForm();
  const [rentalForm] = Form.useForm();

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

  const sidebarVariants = {
    open: { width: 200, transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { width: 80, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    hover: {
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls with mock data
      console.log('Loading leader data...');
      setKits(mockKits);
      setWallet(mockWallet);
      
      // Find group where user is the leader
      const foundGroup = mockGroups.find(g => g.leader === user?.email);
      setGroup(foundGroup || null);
      
      // Mock refund requests
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
      
      console.log('Leader data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'group',
      icon: <TeamOutlined />,
      label: 'Group Management',
    },
    {
      key: 'kits',
      icon: <ToolOutlined />,
      label: 'Kit Rental',
    },
    {
      key: 'refunds',
      icon: <RollbackOutlined />,
      label: 'Refund Requests',
    },
    {
      key: 'wallet',
      icon: <WalletOutlined />,
      label: 'Wallet',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const showNotification = (type, message, description = '') => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
    });
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
            {collapsed ? 'LDR' : 'Leader Portal'}
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
          className="custom-menu"
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
                <Badge count={3} size="small" style={{ cursor: 'pointer' }}>
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
                  icon={<CrownOutlined />} 
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
                {selectedKey === 'dashboard' && <DashboardContent group={group} wallet={wallet} kits={kits} />}
                {selectedKey === 'group' && <GroupManagement group={group} />}
                {selectedKey === 'kits' && <KitRental kits={kits} user={user} />}
                {selectedKey === 'refunds' && <RefundRequests refundRequests={refundRequests} setRefundRequests={setRefundRequests} user={user} />}
                {selectedKey === 'wallet' && <WalletManagement wallet={wallet} setWallet={setWallet} />}
                {selectedKey === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ group, wallet, kits }) => (
  <div>
    <Row gutter={[24, 24]}>
      {/* Group Stats */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Group Members"
              value={group ? group.members.length + 1 : 0}
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ color: '#667eea', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Wallet Balance"
              value={wallet.balance}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
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
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Active Rentals"
              value={2}
              prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>

    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      <Col xs={24} lg={12}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card 
            title="Group Information" 
            style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            {group ? (
              <div>
                <Title level={4}>{group.name}</Title>
                <Text strong>Leader:</Text> {group.leader}<br />
                <Text strong>Members:</Text> {group.members.join(', ')}<br />
                {group.lecturer && (
                  <>
                    <Text strong>Lecturer:</Text> {group.lecturer}
                  </>
                )}
              </div>
            ) : (
              <Empty description="No group information available" />
            )}
          </Card>
        </motion.div>
      </Col>
      
      <Col xs={24} lg={12}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card 
            title="Recent Transactions" 
            style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <List
              size="small"
              dataSource={wallet.transactions.slice(0, 5)}
              renderItem={(item, index) => (
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

// Group Management Component
const GroupManagement = ({ group }) => (
  <div>
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card 
        title="Group Management" 
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        {group ? (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="Group Details" size="small">
                <Descriptions column={1}>
                  <Descriptions.Item label="Group Name">{group.name}</Descriptions.Item>
                  <Descriptions.Item label="Leader">{group.leader}</Descriptions.Item>
                  <Descriptions.Item label="Total Members">{group.members.length + 1}</Descriptions.Item>
                  {group.lecturer && (
                    <Descriptions.Item label="Lecturer">{group.lecturer}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Group Members" size="small">
                <List
                  size="small"
                  dataSource={group.members}
                  renderItem={(member, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={member}
                        description={`Member ${index + 1}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        ) : (
          <Empty description="No group information available" />
        )}
      </Card>
    </motion.div>
  </div>
);

// Kit Rental Component
const KitRental = ({ kits, user }) => {
  const navigate = useNavigate();

  const handleRent = (kit) => {
    navigate('/rental-request', { 
      state: { 
        kit: kit, 
        user: user 
      } 
    });
  };

  return (
    <div>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card 
          title="Available Kits" 
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Table
            dataSource={kits.filter(kit => kit.status === 'AVAILABLE')}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
              },
              {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
              },
              {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
                render: (price) => price ? `${price.toLocaleString()} VND` : 'N/A',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color="success">{status}</Tag>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => handleRent(record)}
                    >
                      Rent
                    </Button>
                    <Button size="small">
                      Details
                    </Button>
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
};



// Refund Requests Component
const RefundRequests = ({ refundRequests, setRefundRequests, user }) => {
  const [newRefundModal, setNewRefundModal] = useState(false);
  const [refundForm] = Form.useForm();

  const handleNewRefund = () => {
    setNewRefundModal(true);
  };

  const handleRefundSubmit = (values) => {
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
    <div>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card 
          title="Refund Requests" 
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleNewRefund}
            >
              New Refund Request
            </Button>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Table
            dataSource={refundRequests}
            columns={[
              {
                title: 'Kit Name',
                dataIndex: 'kitName',
                key: 'kitName',
              },
              {
                title: 'Request Date',
                dataIndex: 'requestDate',
                key: 'requestDate',
                render: (date) => formatDate(date),
              },
              {
                title: 'Refund Date',
                dataIndex: 'refundDate',
                key: 'refundDate',
                render: (date) => formatDate(date),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={getStatusColor(status)}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button size="small">
                      Details
                    </Button>
                  </Space>
                ),
              },
            ]}
            rowKey="id"
          />
        </Card>
      </motion.div>

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
    </div>
  );
};

// Wallet Management Component
const WalletManagement = ({ wallet, setWallet }) => {
  const navigate = useNavigate();

  const handleTopUp = () => {
    navigate('/top-up');
  };

  const handlePayPenalties = () => {
    navigate('/penalty-payment');
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
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
                  onClick={handleTopUp}
                  style={{ 
                    width: '100%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  Top Up
                </Button>
                <Button 
                  onClick={handlePayPenalties}
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
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Card 
              title="Transaction History" 
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <Table
                dataSource={wallet.transactions}
                columns={[
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type) => (
                      <Tag color={type === 'Top-up' ? 'success' : 'primary'}>
                        {type}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount) => `${amount.toLocaleString()} VND`,
                  },
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    key: 'date',
                  },
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
};

// Settings Component
const Settings = () => (
  <div>
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card 
        title="Settings" 
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Notifications" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Email Notifications</Text>
                  <Switch defaultChecked style={{ marginLeft: '16px' }} />
                </div>
                <div>
                  <Text>Push Notifications</Text>
                  <Switch defaultChecked style={{ marginLeft: '16px' }} />
                </div>
                <div>
                  <Text>Rental Alerts</Text>
                  <Switch defaultChecked style={{ marginLeft: '16px' }} />
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Privacy" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Show Profile to Members</Text>
                  <Switch defaultChecked style={{ marginLeft: '16px' }} />
                </div>
                <div>
                  <Text>Allow Direct Messages</Text>
                  <Switch defaultChecked style={{ marginLeft: '16px' }} />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </motion.div>
  </div>
);

export default LeaderPortal; 