import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  Steps,
  message,
  Spin,
  Alert,
  Typography,
  Space,
  Divider,
  Modal,
  InputNumber,
  Avatar,
  Tag,
  Result
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftOutlined,
  WalletOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { mockVietnameseBanks, mockOTPVerification, mockTopUpTransaction } from './mocks';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

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

function TopUpPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Predefined amount options
  const amountOptions = [
    { label: '50,000 VND', value: 50000 },
    { label: '100,000 VND', value: 100000 },
    { label: '200,000 VND', value: 200000 },
    { label: '500,000 VND', value: 500000 },
    { label: '1,000,000 VND', value: 1000000 },
    { label: '2,000,000 VND', value: 2000000 }
  ];

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const handleBankSelect = (bankId) => {
    const bank = mockVietnameseBanks.find(b => b.id === bankId);
    setSelectedBank(bank);
    setCurrentStep(1);
  };

  const handleAmountSelect = (amount) => {
    setTopUpAmount(amount);
    form.setFieldsValue({ amount });
  };

  const handleCustomAmountChange = (value) => {
    setTopUpAmount(value || 0);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      message.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await mockOTPVerification.sendOTP(phoneNumber);
      if (result.success) {
        setGeneratedOTP(result.otp);
        setOtpSent(true);
        setCountdown(60); // 60 seconds countdown
        message.success('OTP sent successfully!');
        setCurrentStep(2);
      }
    } catch (error) {
      message.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      message.error('Please enter the OTP code');
      return;
    }

    if (mockOTPVerification.verifyOTP(otpCode, generatedOTP)) {
      setOtpVerified(true);
      message.success('OTP verified successfully! Processing top-up...');
      
      // Auto-confirm and process the top-up
      setLoading(true);
      try {
        const result = await mockTopUpTransaction(user.id, topUpAmount, selectedBank.code, otpCode);
        if (result.success) {
          setTransactionResult(result);
          message.success('Top-up completed successfully!');
          setCurrentStep(3); // Skip confirmation step, go directly to success
        }
      } catch (error) {
        message.error(error.message || 'Top-up failed. Please try again.');
        setCurrentStep(1); // Go back to amount selection if failed
      } finally {
        setLoading(false);
      }
    } else {
      message.error('Invalid OTP code. Please try again.');
    }
  };


  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const result = await mockOTPVerification.sendOTP(phoneNumber);
      if (result.success) {
        setGeneratedOTP(result.otp);
        setCountdown(60);
        message.success('OTP resent successfully!');
      }
    } catch (error) {
      message.error('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    handleBackToPortal();
  };

  const renderBankSelection = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card 
        title={
          <Space>
            <BankOutlined style={{ color: '#1890ff' }} />
            <span>Select Bank</span>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Row gutter={[16, 16]}>
          {mockVietnameseBanks.map((bank) => (
            <Col xs={24} sm={12} md={8} lg={6} key={bank.id}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  hoverable
                  onClick={() => handleBankSelect(bank.id)}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: '16px', textAlign: 'center' }}
                >
                  <Avatar
                    size={48}
                    src={bank.logo}
                    style={{ marginBottom: '12px' }}
                  >
                    {bank.shortName.charAt(0)}
                  </Avatar>
                  <div>
                    <Text strong style={{ fontSize: '14px' }}>
                      {bank.shortName}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {bank.code}
                    </Text>
                  </div>
                  {bank.supported && (
                    <Tag color="green" style={{ marginTop: '8px' }}>
                      Supported
                    </Tag>
                  )}
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Card>
    </motion.div>
  );

  const renderAmountSelection = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card 
        title={
          <Space>
            <DollarOutlined style={{ color: '#52c41a' }} />
            <span>Select Amount</span>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            {amountOptions.map((option) => (
              <Col xs={12} sm={8} md={6} key={option.value}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hoverable
                    onClick={() => handleAmountSelect(option.value)}
                    style={{
                      borderRadius: '12px',
                      border: topUpAmount === option.value ? '2px solid #1890ff' : '2px solid #f0f0f0',
                      cursor: 'pointer',
                      background: topUpAmount === option.value ? '#f6ffed' : 'white'
                    }}
                    bodyStyle={{ padding: '16px', textAlign: 'center' }}
                  >
                    <Text strong style={{ fontSize: '16px' }}>
                      {option.label}
                    </Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
          
          <Divider>Or enter custom amount</Divider>
          
          <Form.Item
            name="amount"
            label="Custom Amount (VND)"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', min: 10000, max: 10000000, message: 'Amount must be between 10,000 and 10,000,000 VND' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter amount"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              onChange={handleCustomAmountChange}
              min={10000}
              max={10000000}
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^[0-9]{10,11}$/, message: 'Please enter valid phone number' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSendOTP}
              loading={loading}
              disabled={!topUpAmount || !phoneNumber}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: 48,
                padding: '0 32px',
                fontWeight: 'bold'
              }}
            >
              Send OTP
            </Button>
          </div>
        </Form>
      </Card>
    </motion.div>
  );

  const renderOTPVerification = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card 
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#fa8c16' }} />
            <span>Verify OTP & Complete</span>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Avatar
            size={64}
            icon={<PhoneOutlined />}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              marginBottom: '16px'
            }}
          />
          
          <Title level={4}>Enter OTP Code</Title>
          <Text type="secondary">
            We've sent a 6-digit code to {phoneNumber}
          </Text>
          
          <div style={{ margin: '24px 0' }}>
            <Input
              size="large"
              placeholder="Enter OTP code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              style={{
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '2px',
                borderRadius: '12px'
              }}
            />
          </div>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleVerifyOTP}
              disabled={!otpCode || otpCode.length !== 6}
              loading={loading}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: 48,
                padding: '0 32px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Processing...' : 'Verify & Complete Top-up'}
            </Button>

            <div>
              <Text type="secondary">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <Text type="secondary">Resend in {countdown}s</Text>
                ) : (
                  <Button
                    type="link"
                    onClick={handleResendOTP}
                    loading={loading}
                    style={{ padding: 0 }}
                  >
                    Resend OTP
                  </Button>
                )}
              </Text>
            </div>
          </Space>

          {/* Demo OTP Display */}
          <Alert
            message="Demo Mode"
            description={`For demo purposes, use this OTP: ${generatedOTP}`}
            type="info"
            style={{ marginTop: '16px' }}
            showIcon
          />
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
        title="Top-up Successful!"
        subTitle={`Your wallet has been topped up with ${topUpAmount.toLocaleString()} VND`}
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
                <Text type="secondary">Transaction ID:</Text>
              </Col>
              <Col span={16}>
                <Text strong>{transactionResult?.transactionId}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Amount:</Text>
              </Col>
              <Col span={16}>
                <Text strong>{transactionResult?.amount?.toLocaleString()} VND</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Bank:</Text>
              </Col>
              <Col span={16}>
                <Text strong>{selectedBank?.shortName}</Text>
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
        return renderBankSelection();
      case 1:
        return renderAmountSelection();
      case 2:
        return renderOTPVerification();
      case 3:
        return renderSuccess();
      default:
        return renderBankSelection();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Select Bank';
      case 1:
        return 'Enter Amount';
      case 2:
        return 'Verify OTP & Complete';
      case 3:
        return 'Success';
      default:
        return 'Top-up Wallet';
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
                      <WalletOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                      Top-up Wallet
                    </Title>
                    <Text type="secondary">
                      Secure and convenient wallet top-up
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

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <Card style={{ 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Steps
              current={currentStep}
              size="small"
              style={{ padding: '16px 0' }}
            >
              <Step title="Bank" icon={<BankOutlined />} />
              <Step title="Amount" icon={<DollarOutlined />} />
              <Step title="OTP & Complete" icon={<SafetyCertificateOutlined />} />
              <Step title="Success" icon={<CheckCircleOutlined />} />
            </Steps>
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
      </div>
    </div>
  );
}

export default TopUpPage;
