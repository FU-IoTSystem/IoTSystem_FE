import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
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
  Alert,
  Descriptions,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Divider
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoadingOutlined,
  WalletOutlined,
  DollarOutlined,
  BellOutlined,
  PlusOutlined,
  UserAddOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockWallet, mockGroups } from './mocks';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

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

function MemberPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const [wallet, setWallet] = useState(mockWallet);
  
  // Testing toggle state
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [testMemberHasGroup, setTestMemberHasGroup] = useState(false);
  
  // Group management states
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [joinGroupModalVisible, setJoinGroupModalVisible] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [form] = Form.useForm();

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
  }, [isTestingMode, testMemberHasGroup]);

  // Group management functions
  const handleCreateGroup = async (values) => {
    try {
      const newGroup = {
        id: mockGroups.length + 1,
        name: values.name,
        leader: user.email,
        members: [],
        lecturer: values.lecturer,
        maxMembers: values.maxMembers || 4,
        description: values.description,
        status: 'active'
      };
      
      // In a real app, this would be an API call
      mockGroups.push(newGroup);
      
      // Update user role to leader
      const updatedUser = { ...user, role: 'leader' };
      
      setGroup(newGroup);
      setCreateGroupModalVisible(false);
      form.resetFields();
      message.success('Group created successfully! You are now the leader.');
      
      // Reload data to reflect changes
      loadData();
    } catch (error) {
      message.error('Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const targetGroup = mockGroups.find(g => g.id === groupId);
      if (targetGroup && targetGroup.members.length < targetGroup.maxMembers) {
        targetGroup.members.push(user.email);
        setGroup(targetGroup);
        setJoinGroupModalVisible(false);
        message.success('Successfully joined the group!');
        loadData();
      } else {
        message.error('Group is full or not available');
      }
    } catch (error) {
      message.error('Failed to join group');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      setWallet(mockWallet);
      
      // Find group where user is a member or leader
      let foundGroup = mockGroups.find(g => 
        g.members.includes(user?.email) || g.leader === user?.email
      );
      
      // For testing mode, simulate different scenarios
      if (isTestingMode) {
        if (testMemberHasGroup) {
          // Simulate member has a group
          foundGroup = mockGroups[0]; // Use first group for testing
        } else {
          // Simulate member has no group
          foundGroup = null;
        }
      }
      
      setGroup(foundGroup || null);
      
      // Load available groups for joining
      const openGroups = mockGroups.filter(g => 
        g.status === 'open' && 
        !g.members.includes(user?.email) && 
        g.leader !== user?.email
      );
      setAvailableGroups(openGroups);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'group', icon: <TeamOutlined />, label: 'Group Info' },
    { key: 'wallet', icon: <WalletOutlined />, label: 'Wallet' },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
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
            {collapsed ? 'MBR' : 'Member Portal'}
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
              {/* Testing Toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Text style={{ 
                    fontSize: '13px', 
                    color: '#666',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Testing Mode
                  </Text>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Switch
                      size="small"
                      checked={isTestingMode}
                      onChange={setIsTestingMode}
                      style={{ 
                        background: isTestingMode ? '#52c41a' : '#d9d9d9',
                        boxShadow: isTestingMode ? '0 2px 4px rgba(82, 196, 26, 0.3)' : 'none'
                      }}
                    />
                    
                    {isTestingMode && (
                      <>
                        <Text style={{ 
                          fontSize: '11px', 
                          color: '#666',
                          margin: 0,
                          minWidth: '60px'
                        }}>
                          Has Group
                        </Text>
                        <Switch
                          size="small"
                          checked={testMemberHasGroup}
                          onChange={setTestMemberHasGroup}
                          style={{ 
                            background: testMemberHasGroup ? '#1890ff' : '#d9d9d9',
                            boxShadow: testMemberHasGroup ? '0 2px 4px rgba(24, 144, 255, 0.3)' : 'none'
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge count={1} size="small" style={{ cursor: 'pointer' }}>
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
                  icon={<UserOutlined />} 
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
                                 {selectedKey === 'dashboard' && <DashboardContent group={group} wallet={wallet} />}
                 {selectedKey === 'group' && <GroupInfo 
                   group={group} 
                   onCreateGroup={() => setCreateGroupModalVisible(true)}
                   onJoinGroup={() => setJoinGroupModalVisible(true)}
                   availableGroups={availableGroups}
                 />}
                 {selectedKey === 'wallet' && <WalletManagement wallet={wallet} />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

      {/* Create Group Modal */}
      <Modal
        title="Create New Group"
        open={createGroupModalVisible}
        onCancel={() => setCreateGroupModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter group description' }]}
          >
            <Input.TextArea 
              placeholder="Describe your group's purpose and goals" 
              rows={3}
            />
          </Form.Item>
          
          <Form.Item
            name="lecturer"
            label="Lecturer"
            rules={[{ required: true, message: 'Please select a lecturer' }]}
          >
            <Select placeholder="Select lecturer">
              <Select.Option value="lecturer@fpt.edu.vn">Dr. Nguyen Van Lecturer</Select.Option>
              <Select.Option value="iot.specialist@fpt.edu.vn">Dr. IoT Specialist</Select.Option>
              <Select.Option value="sensor.expert@fpt.edu.vn">Dr. Sensor Expert</Select.Option>
              <Select.Option value="embedded.systems@fpt.edu.vn">Dr. Embedded Systems</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="maxMembers"
            label="Maximum Members"
            rules={[{ required: true, message: 'Please set maximum members' }]}
          >
            <Select placeholder="Select maximum members">
              <Select.Option value={2}>2 members</Select.Option>
              <Select.Option value={3}>3 members</Select.Option>
              <Select.Option value={4}>4 members</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateGroupModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Group
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        title="Join Existing Group"
        open={joinGroupModalVisible}
        onCancel={() => setJoinGroupModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <Text>Select a group to join:</Text>
          <Divider />
          <Row gutter={[16, 16]}>
            {availableGroups.map(group => (
              <Col xs={24} sm={12} key={group.id}>
                <Card 
                  hoverable
                  style={{ borderRadius: '12px' }}
                  actions={[
                    <Button 
                      type="primary" 
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.members.length >= group.maxMembers}
                    >
                      {group.members.length >= group.maxMembers ? 'Full' : 'Join Group'}
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={group.name}
                    description={group.description}
                  />
                  <div style={{ marginTop: '12px' }}>
                    <Text type="secondary">
                      Members: {group.members.length}/{group.maxMembers}
                    </Text>
                    <br />
                    <Text type="secondary">
                      Lecturer: {group.lecturer}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          {availableGroups.length === 0 && (
            <Empty description="No available groups to join" />
          )}
        </div>
      </Modal>
      
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ group, wallet }) => (
  <div>
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="My Group"
              value={group ? group.name : 'No Group'}
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
              title="Group Members"
              value={group ? group.members.length + 1 : 0}
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
          <Card title="Group Information" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {group ? (
              <Descriptions column={1}>
                <Descriptions.Item label="Group Name">{group.name}</Descriptions.Item>
                <Descriptions.Item label="Leader">{group.leader}</Descriptions.Item>
                <Descriptions.Item label="Total Members">{group.members.length + 1} (including you)</Descriptions.Item>
                <Descriptions.Item label="Members">{group.members.join(', ')}</Descriptions.Item>
                {group.lecturer && (
                  <Descriptions.Item label="Lecturer">{group.lecturer}</Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Empty description="No group found for this member" />
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

// Group Info Component
const GroupInfo = ({ group, onCreateGroup, onJoinGroup, availableGroups }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card title="Group Information" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {group ? (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="Basic Info" size="small">
                <Descriptions column={1}>
                  <Descriptions.Item label="Group Name">{group.name}</Descriptions.Item>
                  <Descriptions.Item label="Leader">{group.leader}</Descriptions.Item>
                  <Descriptions.Item label="Total Members">{group.members.length + 1}</Descriptions.Item>
                  {group.description && (
                    <Descriptions.Item label="Description">{group.description}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Members" size="small">
                <List
                  size="small"
                  dataSource={group.members}
                  renderItem={(member) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={member}
                        description="Group Member"
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            {group.lecturer && (
              <Col xs={24}>
                <Card title="Lecturer" size="small">
                  <Descriptions column={1}>
                    <Descriptions.Item label="Lecturer">{group.lecturer}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            )}
          </Row>
        ) : (
          <div>
            <Alert 
              message="No Group Found" 
              description="You are not assigned to any group yet. You can create a new group or join an existing one."
              type="warning" 
              showIcon 
              style={{ marginBottom: '24px' }}
            />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    hoverable
                    style={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textAlign: 'center'
                    }}
                    onClick={onCreateGroup}
                  >
                    <PlusOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <Title level={4} style={{ color: 'white', margin: 0 }}>Create New Group</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Start your own project group and become the leader
                    </Text>
                  </Card>
                </motion.div>
              </Col>
              
              <Col xs={24} sm={12}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    hoverable
                    style={{ 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      color: 'white',
                      textAlign: 'center'
                    }}
                    onClick={onJoinGroup}
                  >
                    <UserAddOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <Title level={4} style={{ color: 'white', margin: 0 }}>Join Existing Group</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Join an available group ({availableGroups.length} groups available)
                    </Text>
                  </Card>
                </motion.div>
              </Col>
            </Row>
            
            {availableGroups.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <Title level={4}>Available Groups</Title>
                <Row gutter={[16, 16]}>
                  {availableGroups.map(group => (
                    <Col xs={24} sm={12} md={8} key={group.id}>
                      <Card 
                        hoverable
                        style={{ borderRadius: '12px' }}
                        actions={[
                          <Button 
                            type="primary" 
                            onClick={() => onJoinGroup(group.id)}
                            disabled={group.members.length >= group.maxMembers}
                          >
                            Join Group
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          title={group.name}
                          description={group.description}
                        />
                        <div style={{ marginTop: '12px' }}>
                          <Text type="secondary">
                            Members: {group.members.length}/{group.maxMembers}
                          </Text>
                          <br />
                          <Text type="secondary">
                            Lecturer: {group.lecturer}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  </div>
);





// Wallet Management Component
const WalletManagement = ({ wallet }) => (
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



export default MemberPortal; 