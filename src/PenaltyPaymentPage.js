import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  message,
  Spin,
  Alert,
  Typography,
  Space,
  Divider,
  Result,
  Descriptions,
  Tag,
  Avatar,
  Badge,
  Modal
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  CreditCardOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { mockPenaltyFees, mockPenaltyPayment, mockGetUserPenalties, mockWallet } from './mocks';

const { Title, Text } = Typography;

// Animation variants
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

function PenaltyPaymentPage({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [penalties, setPenalties] = useState([]);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [walletBalance, setWalletBalance] = useState(mockWallet.balance);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: select penalty, 1: confirm, 2: result

  // Get penalty ID from URL params or location state
  const penaltyId = new URLSearchParams(location.search).get('penaltyId') || location.state?.penaltyId;

  useEffect(() => {
    loadPenalties();
  }, [user]);

  const loadPenalties = () => {
    const userPenalties = mockGetUserPenalties(user?.email);
    setPenalties(userPenalties);
    
    // If penaltyId is provided, auto-select it
    if (penaltyId) {
      const penalty = userPenalties.find(p => p.id === parseInt(penaltyId));
      if (penalty) {
        setSelectedPenalty(penalty);
        setCurrentStep(1);
      }
    }
  };

  const handleBackToPortal = () => {
    const userRole = user?.role?.toLowerCase();
    switch (userRole) {
      case 'leader':
        navigate('/leader');
        break;
      case 'lecturer':
        navigate('/lecturer');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'member':
        navigate('/member');
        break;
      case 'academic':
        navigate('/academic');
        break;
      default:
        navigate('/');
    }
  };

  const handleSelectPenalty = (penalty) => {
    setSelectedPenalty(penalty);
    setCurrentStep(1);
  };

  const handleConfirmPayment = () => {
    setShowConfirmation(true);
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    setShowConfirmation(false);
    
    try {
      const result = await mockPenaltyPayment(user.id, selectedPenalty.id, walletBalance);
      
      if (result.success) {
        setPaymentResult(result);
        setWalletBalance(result.remainingBalance);
        
        // Update penalty status
        setPenalties(prev => prev.filter(p => p.id !== selectedPenalty.id));
        
        message.success('Penalty payment completed successfully!');
        setCurrentStep(2);
      }
    } catch (error) {
      message.error(error.message || 'Payment failed. Please try again.');
      setCurrentStep(0); // Go back to penalty selection
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    handleBackToPortal();
  };

  const getPenaltyTypeColor = (type) => {
    switch (type) {
      case 'late_return':
        return 'orange';
      case 'damage':
        return 'red';
      case 'overdue':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getPenaltyTypeText = (type) => {
    switch (type) {
      case 'late_return':
        return 'Late Return';
      case 'damage':
        return 'Damage';
      case 'overdue':
        return 'Overdue';
      default:
        return type;
    }
  };

  const isBalanceSufficient = () => {
    return walletBalance >= selectedPenalty?.amount;
  };

  const renderPenaltySelection = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card 
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
            <span>Select Penalty to Pay</span>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        {penalties.length > 0 ? (
          <Row gutter={[16, 16]}>
            {penalties.map((penalty) => (
              <Col xs={24} sm={12} lg={8} key={penalty.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hoverable
                    onClick={() => handleSelectPenalty(penalty)}
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Row gutter={[12, 12]} align="middle">
                      <Col>
                        <Avatar
                          size={48}
                          icon={<ExclamationCircleOutlined />}
                          style={{ 
                            background: penalty.amount > walletBalance ? '#ff4d4f' : '#fa8c16' 
                          }}
                        />
                      </Col>
                      <Col flex="auto">
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            {penalty.kitName}
                          </Text>
                          <br />
                          <Tag color={getPenaltyTypeColor(penalty.penaltyType)}>
                            {getPenaltyTypeText(penalty.penaltyType)}
                          </Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Due: {new Date(penalty.dueDate).toLocaleDateString()}
                          </Text>
                        </div>
                      </Col>
                      <Col>
                        <div style={{ textAlign: 'right' }}>
                          <Text strong style={{ 
                            fontSize: '18px', 
                            color: penalty.amount > walletBalance ? '#ff4d4f' : '#52c41a' 
                          }}>
                            {penalty.amount.toLocaleString()} VND
                          </Text>
                          <br />
                          {penalty.amount > walletBalance && (
                            <Tag color="red" size="small">Insufficient Balance</Tag>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Avatar
              size={64}
              icon={<CheckCircleOutlined />}
              style={{ 
                background: '#52c41a',
                marginBottom: '16px'
              }}
            />
            <Title level={4} style={{ color: '#52c41a' }}>
              No Pending Penalties
            </Title>
            <Text type="secondary">
              You don't have any pending penalty fees to pay.
            </Text>
            <div style={{ marginTop: '24px' }}>
              <Button
                type="primary"
                onClick={handleBackToPortal}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: 40,
                  padding: '0 24px',
                  fontWeight: 'bold'
                }}
              >
                Back to Portal
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card 
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Payment Confirmation</span>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <div style={{ padding: '24px' }}>
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Penalty Type" span={2}>
                    <Tag color={getPenaltyTypeColor(selectedPenalty.penaltyType)}>
                      {getPenaltyTypeText(selectedPenalty.penaltyType)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kit Name">
                    <Text strong>{selectedPenalty.kitName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Rental ID">
                    <Text code>{selectedPenalty.rentalId}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Amount">
                    <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                      {selectedPenalty.amount.toLocaleString()} VND
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Due Date">
                    <Text>{new Date(selectedPenalty.dueDate).toLocaleDateString()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Reason" span={2}>
                    <Text>{selectedPenalty.reason}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" style={{ 
                background: isBalanceSufficient() ? '#f0f9ff' : '#fff2f0', 
                border: `1px solid ${isBalanceSufficient() ? '#91d5ff' : '#ffccc7'}` 
              }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col>
                    <Avatar
                      size={48}
                      icon={<WalletOutlined />}
                      style={{ 
                        background: isBalanceSufficient() ? '#1890ff' : '#ff4d4f' 
                      }}
                    />
                  </Col>
                  <Col flex="auto">
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        Current Wallet Balance
                      </Text>
                      <br />
                      <Text strong style={{ 
                        fontSize: '18px', 
                        color: isBalanceSufficient() ? '#1890ff' : '#ff4d4f' 
                      }}>
                        {walletBalance.toLocaleString()} VND
                      </Text>
                    </div>
                  </Col>
                  <Col>
                    {isBalanceSufficient() ? (
                      <Tag color="green" style={{ fontSize: '14px' }}>
                        Sufficient Balance
                      </Tag>
                    ) : (
                      <Tag color="red" style={{ fontSize: '14px' }}>
                        Insufficient Balance
                      </Tag>
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>

            {!isBalanceSufficient() && (
              <Col span={24}>
                <Alert
                  message="Insufficient Balance"
                  description={`You need ${(selectedPenalty.amount - walletBalance).toLocaleString()} VND more to pay this penalty. Please top up your wallet first.`}
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  action={
                    <Button
                      size="small"
                      onClick={() => navigate('/top-up')}
                      style={{
                        background: '#ff4d4f',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      Top Up Wallet
                    </Button>
                  }
                />
              </Col>
            )}
          </Row>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Space size="large">
              <Button
                size="large"
                onClick={() => setCurrentStep(0)}
                style={{
                  borderRadius: '12px',
                  height: 48,
                  padding: '0 24px'
                }}
              >
                Back
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleConfirmPayment}
                disabled={!isBalanceSufficient()}
                style={{
                  borderRadius: '12px',
                  background: isBalanceSufficient() ? 
                    'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' : 
                    '#d9d9d9',
                  border: 'none',
                  height: 48,
                  padding: '0 32px',
                  fontWeight: 'bold'
                }}
              >
                Confirm Payment
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Result
        status="success"
        title="Payment Successful!"
        subTitle={`Penalty fee of ${selectedPenalty?.amount?.toLocaleString()} VND has been paid successfully`}
        extra={[
          <Button
            type="primary"
            key="back"
            onClick={handleComplete}
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              height: 48,
              padding: '0 32px',
              fontWeight: 'bold'
            }}
          >
            Back to Portal
          </Button>
        ]}
      >
        <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Text type="secondary">Payment ID:</Text>
              </Col>
              <Col span={16}>
                <Text strong>{paymentResult?.paymentId}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Amount Paid:</Text>
              </Col>
              <Col span={16}>
                <Text strong>{paymentResult?.amount?.toLocaleString()} VND</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Remaining Balance:</Text>
              </Col>
              <Col span={16}>
                <Text strong>{paymentResult?.remainingBalance?.toLocaleString()} VND</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Status:</Text>
              </Col>
              <Col span={16}>
                <Tag color="green">Completed</Tag>
              </Col>
            </Row>
          </Card>
        </div>
      </Result>
    </motion.div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPenaltySelection();
      case 1:
        return renderConfirmation();
      case 2:
        return renderSuccess();
      default:
        return renderPenaltySelection();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Select Penalty';
      case 1:
        return 'Confirm Payment';
      case 2:
        return 'Payment Success';
      default:
        return 'Penalty Payment';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '24px' }}
        >
          <Card style={{ 
            borderRadius: '16px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Space size="large">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToPortal}
                    style={{ fontSize: '18px' }}
                  >
                    Back to Portal
                  </Button>
                  <div>
                    <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                      <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                      Penalty Payment
                    </Title>
                    <Text type="secondary">
                      Pay your pending penalty fees
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Avatar 
                    icon={<CreditCardOutlined />} 
                    size={48}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: '3px solid rgba(255,255,255,0.3)'
                    }}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Spin 
              spinning={loading}
              indicator={
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <LoadingOutlined style={{ fontSize: 24 }} />
                </motion.div>
              }
            >
              {getStepContent()}
            </Spin>
          </motion.div>
        </AnimatePresence>

        {/* Confirmation Modal */}
        <Modal
          title="Confirm Payment"
          open={showConfirmation}
          onCancel={() => setShowConfirmation(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={handleProcessPayment}
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none'
              }}
            >
              Confirm Payment
            </Button>
          ]}
        >
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Avatar
              size={64}
              icon={<ExclamationCircleOutlined />}
              style={{ 
                background: '#fa8c16',
                marginBottom: '16px'
              }}
            />
            <Title level={4}>Are you sure?</Title>
            <Text>
              You are about to pay <Text strong>{selectedPenalty?.amount?.toLocaleString()} VND</Text> for the penalty fee.
            </Text>
            <br />
            <Text type="secondary">
              This action cannot be undone.
            </Text>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default PenaltyPaymentPage;
