import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
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
  SafetyCertificateOutlined,
  DollarOutlined,
  CreditCardOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { walletAPI, paymentAPI } from './api';


const { Title, Text } = Typography;
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
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [transactionResult, setTransactionResult] = useState(null);

  // Predefined amount options
  const amountOptions = [
    { label: '50,000 VND', value: 50000 },
    { label: '100,000 VND', value: 100000 },
    { label: '200,000 VND', value: 200000 },
    { label: '500,000 VND', value: 500000 },
    { label: '1,000,000 VND', value: 1000000 },
    { label: '2,000,000 VND', value: 2000000 }
  ];

  // Handle PayPal return callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');

    // Check if this is a PayPal return
    if (paymentId && payerId) {
      handlePayPalReturn(paymentId, payerId);
    } else if (urlParams.get('cancel') === 'true') {
      handlePayPalCancel();
    }
  }, []);

  const handlePayPalReturn = async (paymentId, payerId) => {
    try {
      // Get stored payment info
      const storedPayment = sessionStorage.getItem('pendingPayPalPayment');
      if (!storedPayment) {
        message.error('Payment information not found');
        return;
      }

      const paymentInfo = JSON.parse(storedPayment);

      // Execute PayPal payment
      const response = await paymentAPI.executePayPalPayment(
        paymentId,
        payerId,
        paymentInfo.transactionId
      );

      if (response && response.data) {
        message.success('Payment successful! Wallet balance has been updated.');

        // Clear stored payment info
        sessionStorage.removeItem('pendingPayPalPayment');

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to portal after 1 second
        setTimeout(() => {
          handleBackToPortal();
        }, 1000);
      } else {
        message.error('Payment execution failed. Please try again.');
      }
    } catch (error) {
      console.error('PayPal payment execution error:', error);
      message.error(error.message || 'Payment execution failed. Please try again.');
      sessionStorage.removeItem('pendingPayPalPayment');
    }
  };

  const handlePayPalCancel = () => {
    message.warning('Payment was cancelled');
    sessionStorage.removeItem('pendingPayPalPayment');
    window.history.replaceState({}, document.title, window.location.pathname);
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


  const handleAmountSelect = (amount) => {
    setTopUpAmount(amount);
    form.setFieldsValue({ amount });
  };

  const handleCustomAmountChange = (value) => {
    setTopUpAmount(value || 0);
  };

  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount < 10000) {
      message.error('Số tiền nạp tối thiểu là 10,000 VND');
      return;
    }
    if (topUpAmount > 10000000) {
      message.error('Số tiền nạp tối đa là 10,000,000 VND');
      return;
    }

    setLoading(true);
    try {
      const description = `Top-up IoT Wallet - ${topUpAmount.toLocaleString()} VND`;

      // Convert VND to USD (approximate rate: 1 USD = 24,000 VND)
      const exchangeRate = 24000;
      const amountUSD = (topUpAmount / exchangeRate).toFixed(2);

      // Get return URL based on user role
      const userRole = user?.role?.toLowerCase();
      let returnPath = '/member'; // default
      switch (userRole) {
        case 'leader':
          returnPath = '/leader';
          break;
        case 'lecturer':
          returnPath = '/lecturer';
          break;
        case 'admin':
          returnPath = '/admin';
          break;
        case 'member':
          returnPath = '/member';
          break;
        case 'academic':
          returnPath = '/academic';
          break;
        default:
          returnPath = '/';
      }

      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}${returnPath}`;
      const cancelUrl = `${baseUrl}${returnPath}`;

      // Create PayPal payment with role-specific return URLs
      const response = await paymentAPI.createPayPalPayment(
        parseFloat(amountUSD),
        description,
        returnUrl,
        cancelUrl
      );

      if (response && response.data) {
        const { approvalUrl, paymentId, transactionId } = response.data;

        if (approvalUrl) {
          // Store transaction info in sessionStorage for callback handling
          sessionStorage.setItem('pendingPayPalPayment', JSON.stringify({
            paymentId,
            transactionId,
            amount: parseFloat(amountUSD),
            originalAmountVND: topUpAmount
          }));

          // Redirect to PayPal approval page
          window.location.href = approvalUrl;
        } else {
          message.error('Không thể tạo PayPal payment. Vui lòng thử lại.');
        }
      } else {
        message.error('Không thể tạo PayPal payment. Vui lòng thử lại.');
      }

    } catch (error) {
      console.error('PayPal payment creation error:', error);
      message.error(error.message || 'Không thể tạo PayPal payment. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // Clear form and state
    form.resetFields();
    setTopUpAmount(0);
    setTransactionResult(null);
    setCurrentStep(0);

    // Return to portal
    handleBackToPortal();
  };


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

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => setCurrentStep(1)}
              disabled={!topUpAmount}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: 48,
                padding: '0 32px',
                fontWeight: 'bold'
              }}
            >
              Tiếp tục
            </Button>
          </div>
        </Form>
      </Card>
    </motion.div>
  );

  const renderPaymentInfo = () => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
            <span>Xác Nhận Nạp Tiền</span>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: '24px' }}>
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Text type="secondary">Số tiền:</Text>
              </Col>
              <Col span={16}>
                <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                  {topUpAmount.toLocaleString()} VND
                </Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Phương thức:</Text>
              </Col>
              <Col span={16}>
                <Text strong>PayPal</Text>
              </Col>
            </Row>
          </Card>

          <Alert
            message="Thông Tin"
            description="Nhấn xác nhận để hoàn tất giao dịch nạp tiền"
            type="info"
            style={{ marginBottom: '24px' }}
            showIcon
          />

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
              Quay lại
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleTopUp}
              loading={loading}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                height: 48,
                padding: '0 32px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Đang xử lý...' : 'Xác Nhận Nạp Tiền'}
            </Button>
          </Space>
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
                <Text type="secondary">Payment Method:</Text>
              </Col>
              <Col span={16}>
                <Text strong>PayPal</Text>
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
        return renderAmountSelection();
      case 1:
        return renderPaymentInfo();
      default:
        return renderAmountSelection();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Nhập Số Tiền';
      case 1:
        return 'Thanh Toán';
      default:
        return 'Nạp Tiền Ví';
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
                      Nạp Tiền Ví
                    </Title>
                    <Text type="secondary">
                      Nạp tiền an toàn và tiện lợi qua PayPal
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
              <Step title="Số Tiền" icon={<DollarOutlined />} />
              <Step title="Thanh Toán" icon={<SafetyCertificateOutlined />} />
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
