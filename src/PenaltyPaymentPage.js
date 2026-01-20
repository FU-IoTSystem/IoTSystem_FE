import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { penaltiesAPI, penaltyDetailAPI, walletAPI, borrowingRequestAPI, penaltyPoliciesAPI, damageReportAPI } from './api';
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
  Modal,
  Empty,
  Table,
  Image
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
// Removed mock data - using real API calls

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
  const [penaltyDetails, setPenaltyDetails] = useState([]);
  const [borrowRequest, setBorrowRequest] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: select penalty, 1: confirm, 2: result
  const [damagedComponents, setDamagedComponents] = useState([]);
  const [damageReports, setDamageReports] = useState([]);

  // Get penalty ID from URL params or location state
  const penaltyId = new URLSearchParams(location.search).get('penaltyId') || location.state?.penaltyId;

  const loadWalletBalance = useCallback(async () => {
    try {
      const walletResponse = await walletAPI.getMyWallet();
      const walletData = walletResponse?.data || walletResponse || {};
      setWalletBalance(walletData.balance || 0);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(0);
    }
  }, []);

  // Define loadPenaltyDetails and loadBorrowRequest before loadPenalties
  const loadPenaltyDetails = async (penaltyId) => {
    if (!penaltyId) {
      console.warn('No penaltyId provided for loading penalty details');
      setPenaltyDetails([]);
      return;
    }

    try {
      console.log('=== Loading penalty details for penaltyId:', penaltyId);
      console.log('PenaltyId type:', typeof penaltyId);

      const response = await penaltyDetailAPI.findByPenaltyId(penaltyId);
      console.log('=== Raw penalty details response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      console.log('Is array:', Array.isArray(response));

      let detailsData = [];

      // Check if response has ApiResponse wrapper structure
      if (response && typeof response === 'object') {
        // Check for ApiResponse format: { status, message, data }
        if (response.data !== undefined) {
          if (Array.isArray(response.data)) {
            detailsData = response.data;
            console.log('Found data array in ApiResponse:', detailsData.length, 'items');
          } else if (response.data && typeof response.data === 'object' && response.data.id) {
            // Single object wrapped in data
            detailsData = [response.data];
            console.log('Found single object in ApiResponse.data');
          } else if (response.data === null || response.data === undefined) {
            detailsData = [];
            console.log('ApiResponse.data is null or undefined');
          }
        }
        // Check if response itself is array
        else if (Array.isArray(response)) {
          detailsData = response;
          console.log('Response is direct array:', detailsData.length, 'items');
        }
        // Check if response is a single PenaltyDetail object
        else if (response.id) {
          detailsData = [response];
          console.log('Response is single PenaltyDetail object');
        }
        // Check nested structure
        else if (response.response && response.response.data) {
          if (Array.isArray(response.response.data)) {
            detailsData = response.response.data;
          } else {
            detailsData = [response.response.data];
          }
          console.log('Found nested response structure');
        }
      }

      console.log('=== Parsed penalty details data:', detailsData);
      console.log('=== Number of penalty details:', detailsData.length);

      if (detailsData.length > 0) {
        console.log('First penalty detail sample:', detailsData[0]);
        console.log('Image URL fields check:', {
          imageUrl: detailsData[0].imageUrl,
          img_url: detailsData[0].img_url,
          image_url: detailsData[0].image_url
        });
      }

      // Filter out rental fee penalty details (they are handled in payment logic, not displayed)
      const filteredDetails = detailsData.filter(detail => {
        const description = detail.description || '';
        return !description.includes('Trả tiền thuê kit') && !description.includes('rental fee');
      });

      // Fetch penalty policy info for each detail if policiesId exists
      if (filteredDetails.length > 0) {
        const detailsWithPolicies = await Promise.all(
          filteredDetails.map(async (detail) => {
            if (detail.policiesId) {
              try {
                const policyResponse = await penaltyPoliciesAPI.getById(detail.policiesId);
                let policyData = null;
                if (policyResponse) {
                  if (policyResponse.data) {
                    policyData = policyResponse.data;
                  } else if (policyResponse.id) {
                    policyData = policyResponse;
                  }
                }
                return { ...detail, policy: policyData };
              } catch (error) {
                console.error(`Error loading policy for detail ${detail.id}:`, error);
                return { ...detail, policy: null };
              }
            }
            return { ...detail, policy: null };
          })
        );
        setPenaltyDetails(detailsWithPolicies);

        // Extract damaged components after penalty details are loaded
        if (damageReports.length > 0) {
          extractDamagedComponents(damageReports, detailsWithPolicies);
        }
      } else {
        setPenaltyDetails(filteredDetails);
        if (damageReports.length > 0) {
          extractDamagedComponents(damageReports, filteredDetails);
        }
      }
    } catch (error) {
      console.error('=== Error loading penalty details:', error);
      console.error('Error message:', error.message);
      setPenaltyDetails([]);
    }
  };

  const loadBorrowRequest = async (borrowRequestId) => {
    if (!borrowRequestId || borrowRequestId === 'N/A') {
      setBorrowRequest(null);
      setDamagedComponents([]);
      setDamageReports([]);
      return;
    }

    try {
      const response = await borrowingRequestAPI.getById(borrowRequestId);
      console.log('Borrow request response:', response);

      let requestData = null;
      if (response) {
        if (response.data) {
          requestData = response.data;
        } else if (response.id) {
          requestData = response;
        }
      }

      setBorrowRequest(requestData);

      // Load damage reports for this borrow request
      try {
        const damageReportsResponse = await damageReportAPI.getByBorrowRequestId(borrowRequestId);
        let reportsData = [];
        if (Array.isArray(damageReportsResponse)) {
          reportsData = damageReportsResponse;
        } else if (damageReportsResponse?.data && Array.isArray(damageReportsResponse.data)) {
          reportsData = damageReportsResponse.data;
        }
        setDamageReports(reportsData);

        // Extract damaged components from damage reports and penalty details
        extractDamagedComponents(reportsData);
      } catch (damageError) {
        console.error('Error loading damage reports:', damageError);
        setDamageReports([]);
        setDamagedComponents([]);
      }
    } catch (error) {
      console.error('Error loading borrow request:', error);
      setBorrowRequest(null);
      setDamagedComponents([]);
      setDamageReports([]);
    }
  };

  // Extract damaged components from damage reports and penalty details
  const extractDamagedComponents = useCallback((reports = [], penaltyDetailsData = null) => {
    const components = [];
    const detailsToUse = penaltyDetailsData || penaltyDetails;

    // Extract from penalty details (they often contain component damage info)
    if (detailsToUse && detailsToUse.length > 0) {
      detailsToUse.forEach((detail) => {
        const description = detail.description || '';
        // Check if description mentions component damage
        if (description && (description.toLowerCase().includes('damage') ||
          description.toLowerCase().includes('component') ||
          description.toLowerCase().includes('hư hỏng'))) {
          // Try to extract component name and amount from description
          const componentName = detail.policy?.policyName ||
            description.split('to')[1]?.trim() ||
            description.split('cho')[1]?.trim() ||
            'Unknown Component';

          components.push({
            id: detail.id || `detail-${components.length}`,
            componentName: componentName,
            description: description,
            damageAmount: detail.amount || 0,
            policyName: detail.policy?.policyName || 'N/A',
            createdAt: detail.createdAt
          });
        }
      });
    }

    // Extract from damage reports
    if (reports && reports.length > 0) {
      reports.forEach((report) => {
        if (report.description) {
          // Parse description to extract component information
          // Format might be: "Damage to ComponentName: Amount VND"
          const desc = report.description;
          const damageValue = report.totalDamageValue || 0;

          // Try to extract component name from description
          let componentName = 'Unknown Component';
          if (desc.includes('to')) {
            componentName = desc.split('to')[1]?.split(':')[0]?.trim() || 'Unknown Component';
          } else if (desc.includes('cho')) {
            componentName = desc.split('cho')[1]?.split(':')[0]?.trim() || 'Unknown Component';
          } else {
            // Try to find component name in description
            const matches = desc.match(/([A-Z][a-zA-Z\s]+)/);
            if (matches && matches[1]) {
              componentName = matches[1].trim();
            }
          }

          components.push({
            id: report.id || `report-${components.length}`,
            componentName: componentName,
            description: desc,
            damageAmount: damageValue,
            status: report.status || 'PENDING',
            createdAt: report.createdAt || report.created_at
          });
        }
      });
    }

    // Remove duplicates based on component name
    const uniqueComponents = components.reduce((acc, current) => {
      const existing = acc.find(item => item.componentName === current.componentName);
      if (!existing) {
        acc.push(current);
      } else {
        // Merge amounts if duplicate
        existing.damageAmount = (existing.damageAmount || 0) + (current.damageAmount || 0);
      }
      return acc;
    }, []);

    setDamagedComponents(uniqueComponents);
  }, [penaltyDetails]);

  const loadPenalties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await penaltiesAPI.getPenByAccount();
      console.log('Penalties by account response:', response);

      // Handle response format
      let penaltiesData = [];
      if (Array.isArray(response)) {
        penaltiesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        penaltiesData = response.data;
      }

      // Map to expected format, keep original data for update
      // Load kitName from borrowRequest for each penalty
      const mappedPenalties = await Promise.all(
        penaltiesData.map(async (penalty) => {
          let kitName = 'Unknown Kit';
          let penaltyType = 'other';

          // Try to get kitName from borrowRequest if available
          if (penalty.borrowRequestId) {
            try {
              const borrowRequest = await borrowingRequestAPI.getById(penalty.borrowRequestId);
              const requestData = borrowRequest?.data || borrowRequest;
              if (requestData?.kit?.kitName) {
                kitName = requestData.kit.kitName;
              } else if (requestData?.kitName) {
                kitName = requestData.kitName;
              }
            } catch (error) {
              console.warn(`Failed to load kit name for penalty ${penalty.id}:`, error);
            }
          }

          // Determine penalty type from policyName or kitType
          if (penalty.policyName) {
            // Map policy name to penalty type
            const policyLower = penalty.policyName.toLowerCase();
            if (policyLower.includes('late') || policyLower.includes('return')) {
              penaltyType = 'late_return';
            } else if (policyLower.includes('damage')) {
              penaltyType = 'damage';
            } else if (policyLower.includes('overdue')) {
              penaltyType = 'overdue';
            }
          } else if (penalty.kitType) {
            // Use kitType as fallback
            penaltyType = penalty.kitType.toLowerCase().replace('_', '_');
          }

          return {
            id: penalty.id,
            penaltyId: penalty.id,
            kitName: kitName,
            rentalId: penalty.borrowRequestId || 'N/A',
            amount: penalty.totalAmount || 0,
            penaltyType: penaltyType,
            dueDate: penalty.takeEffectDate || new Date().toISOString(),
            reason: penalty.note || 'Penalty fee',
            status: penalty.resolved ? 'resolved' : 'pending',
            // Keep original data for update
            originalData: penalty
          };
        })
      );

      // Filter only unresolved penalties
      const pendingPenalties = mappedPenalties.filter(p => p.status === 'pending');
      setPenalties(pendingPenalties);

      // If penaltyId is provided, auto-select it
      if (penaltyId) {
        const penalty = pendingPenalties.find(p => p.id === penaltyId || p.penaltyId === penaltyId);
        if (penalty) {
          setSelectedPenalty(penalty);
          loadPenaltyDetails(penalty.id);
          // Load borrow request if available
          if (penalty.rentalId && penalty.rentalId !== 'N/A') {
            loadBorrowRequest(penalty.rentalId);
          } else {
            const originalData = penalty.originalData;
            if (originalData && originalData.borrowRequestId) {
              loadBorrowRequest(originalData.borrowRequestId);
            }
          }
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error('Error loading penalties:', error);
      setPenalties([]);
    } finally {
      setLoading(false);
    }
  }, [penaltyId]);

  useEffect(() => {
    if (user) {
      loadPenalties();
      loadWalletBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    loadPenaltyDetails(penalty.id);
    // Load borrow request if available
    if (penalty.rentalId && penalty.rentalId !== 'N/A') {
      loadBorrowRequest(penalty.rentalId);
    } else {
      // Try to get from original data
      const originalData = penalty.originalData;
      if (originalData && originalData.borrowRequestId) {
        loadBorrowRequest(originalData.borrowRequestId);
      } else {
        setBorrowRequest(null);
      }
    }
    setCurrentStep(1);
  };

  const handleConfirmPayment = () => {
    setShowConfirmation(true);
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    setShowConfirmation(false);
    try {
      // Get current penalty from penalties list to have full data
      const currentPenalty = penalties.find(p => p.id === selectedPenalty.id || p.penaltyId === selectedPenalty.id);
      if (!currentPenalty) {
        throw new Error('Penalty not found');
      }

      // Save wallet balance before payment
      const balanceBeforePayment = walletBalance;
      const rentalAmount = borrowRequest?.depositAmount || 0;

      // Gọi đúng endpoint confirm-payment BE
      await penaltiesAPI.confirmPenaltyPayment(selectedPenalty.id);

      // Sau khi BE xử lý (trừ tiền phạt + hoàn deposit nếu có), load lại số dư ví mới
      const walletResponse = await walletAPI.getMyWallet();
      const walletData = walletResponse?.data || walletResponse || {};
      const updatedBalance = walletData.balance || 0;
      setWalletBalance(updatedBalance);

      // Reload lại danh sách penalties
      await loadPenalties();

      // Set payment result với số dư ví thực tế sau khi BE xử lý
      setPaymentResult({
        success: true,
        paymentId: `PAY-${Date.now()}`,
        penaltyId: selectedPenalty.id,
        amount: selectedPenalty.amount,
        timestamp: new Date().toISOString(),
        status: 'completed',
        // remainingBalance = số dư ví mới (đã bao gồm: số dư cũ + tiền refund từ deposit - tiền phạt)
        remainingBalance: updatedBalance,
        balanceBeforePayment: balanceBeforePayment,
        rentalAmount: rentalAmount
      });
      message.success('Thanh toán penalty thành công!');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error processing payment:', error);
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
      case 'other':
        return 'Other';
      case 'STUDENT_KIT':
        return 'Student Kit';
      case 'LECTURER_KIT':
        return 'Lecturer Kit';
      default:
        return type || 'Other';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'completed':
      case 'active':
        return 'success';
      case 'pending':
      case 'pending_approval':
        return 'warning';
      case 'rejected':
      case 'cancelled':
      case 'inactive':
        return 'error';
      default:
        return 'default';
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

            {/* Penalty Details - Always show this section */}
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined />
                    <span>Penalty Details</span>
                    {penaltyDetails && penaltyDetails.length > 0 && (
                      <Tag color="blue">{penaltyDetails.length} item(s)</Tag>
                    )}
                  </Space>
                }
                size="small"
                style={{ background: '#fffbe6', border: '1px solid #ffe58f' }}
              >
                {penaltyDetails && penaltyDetails.length > 0 ? (
                  <Descriptions column={1} bordered size="small">
                    {penaltyDetails.map((detail, index) => (
                      <React.Fragment key={detail.id || index}>
                        <Descriptions.Item label={`Detail ${index + 1}`}>
                          <div style={{ marginBottom: 8 }}>
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <div>
                                <Text strong style={{ fontSize: 14 }}>
                                  {detail.description || 'Penalty Detail'}
                                </Text>
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                  x{detail.quantity || 1}
                                </Tag>
                              </div>
                              <div>
                                <Text>Amount: </Text>
                                <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                                  {detail.amount ? detail.amount.toLocaleString() : 0} VND
                                </Text>
                              </div>
                              {detail.createdAt && (
                                <div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Created: {new Date(detail.createdAt).toLocaleString('vi-VN')}
                                  </Text>
                                </div>
                              )}
                              {detail.policiesId && (
                                <div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Policy ID: <Text code>{detail.policiesId}</Text>
                                  </Text>
                                </div>
                              )}
                              {(detail.imageUrl || detail.img_url || detail.image_url) && (
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                    Evidence Image:
                                  </Text>
                                  <Image
                                    width={150}
                                    src={detail.imageUrl || detail.img_url || detail.image_url}
                                    alt="Damage Evidence"
                                    style={{ borderRadius: 8, border: '1px solid #d9d9d9' }}
                                    fallback="data:image/png;base64,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"
                                    preview={{
                                      mask: <div>View Evidence</div>
                                    }}
                                  />
                                </div>
                              )}
                              {detail.policy && (
                                <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                  <Text strong style={{ fontSize: 12, color: '#1890ff' }}>Policy Information:</Text>
                                  <div style={{ marginTop: 4 }}>
                                    <Text style={{ fontSize: 12 }}>
                                      <Text strong>Policy Name: </Text>
                                      {detail.policy.policyName || 'N/A'}
                                    </Text>
                                  </div>
                                  {detail.policy.type && (
                                    <div>
                                      <Text style={{ fontSize: 12 }}>
                                        <Text strong>Type: </Text>
                                        <Tag color="blue" size="small">{detail.policy.type}</Tag>
                                      </Text>
                                    </div>
                                  )}
                                  {detail.policy.amount && (
                                    <div>
                                      <Text style={{ fontSize: 12 }}>
                                        <Text strong>Policy Amount: </Text>
                                        {detail.policy.amount.toLocaleString()} VND
                                      </Text>
                                    </div>
                                  )}
                                  {detail.policy.issuedDate && (
                                    <div>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        Issued: {new Date(detail.policy.issuedDate).toLocaleDateString('vi-VN')}
                                      </Text>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Space>
                          </div>
                        </Descriptions.Item>
                        {index < penaltyDetails.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Descriptions>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Empty
                      description="No penalty details found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                      This penalty does not have any details yet.
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Penalty ID: {selectedPenalty?.id || 'N/A'}
                      </Text>
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            {/* Borrow Request Information */}
            {borrowRequest && (
              <Col span={24}>
                <Card
                  title={<Space><ShoppingOutlined /> Borrow Request Information</Space>}
                  size="small"
                  style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}
                >
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Request ID">
                      <Text code>{borrowRequest.id || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={getStatusColor(borrowRequest.status)}>
                        {borrowRequest.status || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    {borrowRequest.kit && (
                      <>
                        <Descriptions.Item label="Kit Name">
                          <Text strong>{borrowRequest.kit.kitName || borrowRequest.kitName || 'N/A'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Kit Type">
                          <Text>{borrowRequest.kit.type || borrowRequest.kitType || 'N/A'}</Text>
                        </Descriptions.Item>
                      </>
                    )}
                    {borrowRequest.requestType && (
                      <Descriptions.Item label="Request Type">
                        <Tag>{borrowRequest.requestType}</Tag>
                      </Descriptions.Item>
                    )}
                    {borrowRequest.reason && (
                      <Descriptions.Item label="Reason" span={2}>
                        <Text>{borrowRequest.reason}</Text>
                      </Descriptions.Item>
                    )}
                    {borrowRequest.requestDate && (
                      <Descriptions.Item label="Request Date">
                        <Text>{new Date(borrowRequest.requestDate).toLocaleString('vi-VN')}</Text>
                      </Descriptions.Item>
                    )}
                    {borrowRequest.createdAt && (
                      <Descriptions.Item label="Created Date">
                        <Text>{new Date(borrowRequest.createdAt).toLocaleString('vi-VN')}</Text>
                      </Descriptions.Item>
                    )}
                    {borrowRequest.expectReturnDate && (
                      <Descriptions.Item label="Expected Return Date">
                        <Text>{new Date(borrowRequest.expectReturnDate).toLocaleString('vi-VN')}</Text>
                      </Descriptions.Item>
                    )}
                    {borrowRequest.approvedDate && (
                      <Descriptions.Item label="Approved Date">
                        <Text>{new Date(borrowRequest.approvedDate).toLocaleString('vi-VN')}</Text>
                      </Descriptions.Item>
                    )}
                    {borrowRequest.depositAmount !== undefined && (
                      <Descriptions.Item label="Deposit Amount">
                        <Text strong>{borrowRequest.depositAmount?.toLocaleString() || 0} VND</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            )}

            {/* Damaged Kit Components Table */}
            {damagedComponents && damagedComponents.length > 0 && (
              <Col span={24}>
                <Card
                  title={
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span>Damaged Kit Components</span>
                      <Tag color="error">{damagedComponents.length} component(s)</Tag>
                    </Space>
                  }
                  size="small"
                  style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}
                >
                  <Table
                    dataSource={damagedComponents}
                    rowKey={(record) => record.id || `component-${record.componentName}`}
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Component Name',
                        dataIndex: 'componentName',
                        key: 'componentName',
                        render: (text) => (
                          <Text strong style={{ color: '#ff4d4f' }}>{text || 'Unknown Component'}</Text>
                        )
                      },
                      {
                        title: 'Description',
                        dataIndex: 'description',
                        key: 'description',
                        render: (text) => (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {text || 'No description available'}
                          </Text>
                        )
                      },
                      {
                        title: 'Damage Amount',
                        dataIndex: 'damageAmount',
                        key: 'damageAmount',
                        align: 'right',
                        render: (amount) => (
                          <Text strong style={{ color: '#ff4d4f', fontSize: '14px' }}>
                            {amount ? amount.toLocaleString() : 0} VND
                          </Text>
                        )
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                          if (!status) return <Tag color="default">N/A</Tag>;
                          const statusLower = (status || '').toLowerCase();
                          if (statusLower === 'approved' || statusLower === 'completed') {
                            return <Tag color="success">{status}</Tag>;
                          } else if (statusLower === 'pending') {
                            return <Tag color="warning">{status}</Tag>;
                          } else if (statusLower === 'rejected') {
                            return <Tag color="error">{status}</Tag>;
                          }
                          return <Tag color="default">{status}</Tag>;
                        }
                      },
                      {
                        title: 'Reported Date',
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (date) => {
                          if (!date) return <Text type="secondary">N/A</Text>;
                          try {
                            return (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {new Date(date).toLocaleString('vi-VN')}
                              </Text>
                            );
                          } catch {
                            return <Text type="secondary">N/A</Text>;
                          }
                        }
                      }
                    ]}
                    summary={(pageData) => {
                      const total = pageData.reduce((sum, record) => {
                        return sum + (Number(record.damageAmount) || 0);
                      }, 0);

                      return (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={2}>
                              <Text strong style={{ fontSize: '14px' }}>Total Damage Amount:</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">
                              <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                                {total.toLocaleString()} VND
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} colSpan={2} />
                          </Table.Summary.Row>
                        </Table.Summary>
                      );
                    }}
                  />
                </Card>
              </Col>
            )}

            <Col span={24}>
              <Card size="small" style={{
                background: '#f0f9ff',
                border: '1px solid #91d5ff'
              }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col>
                    <Avatar
                      size={48}
                      icon={<WalletOutlined />}
                      style={{
                        background: '#1890ff'
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
                        color: '#1890ff'
                      }}>
                        {walletBalance.toLocaleString()} VND
                      </Text>
                    </div>
                  </Col>
                  <Col>
                    <Tag color="blue" style={{ fontSize: '14px' }}>
                      Wallet Balance
                    </Tag>
                  </Col>
                </Row>
              </Card>
            </Col>

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
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
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
      </Card >
    </motion.div >
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
        <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
          <Card
            size="small"
            style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '12px'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Payment ID */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={8}>
                  <Text type="secondary">Payment ID:</Text>
                </Col>
                <Col span={16}>
                  <Text strong style={{ color: '#000' }}>{paymentResult?.paymentId}</Text>
                </Col>
              </Row>

              <Divider style={{ margin: '12px 0' }} />

              {/* Total Amount Before Paid Penalty - Black */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={12}>
                  <Text strong style={{ fontSize: '14px' }}>Total Amount Before Paid Penalty:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '16px', color: '#000' }}>
                    {(paymentResult?.balanceBeforePayment || 0).toLocaleString()} VND
                  </Text>
                </Col>
              </Row>

              {/* Rental Amount - Black */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={12}>
                  <Text style={{ fontSize: '14px' }}>Rental Amount:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '16px', color: '#000' }}>
                    {(paymentResult?.rentalAmount || 0).toLocaleString()} VND
                  </Text>
                </Col>
              </Row>

              {/* Penalty Amount - Red */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={12}>
                  <Text style={{ fontSize: '14px' }}>Penalty Amount:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                    -{(paymentResult?.amount || 0).toLocaleString()} VND
                  </Text>
                </Col>
              </Row>

              {/* Refund Amount - Rental Amount - Penalty Amount */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={12}>
                  <Text style={{ fontSize: '14px' }}>Refund Amount:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '16px', color: ((paymentResult?.rentalAmount || 0) - (paymentResult?.amount || 0)) >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {((paymentResult?.rentalAmount || 0) - (paymentResult?.amount || 0)).toLocaleString()} VND
                  </Text>
                </Col>
              </Row>

              <Divider style={{ margin: '12px 0', borderColor: '#d9d9d9' }} />

              {/* Total Balance After Paid - Green */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={12}>
                  <Text strong style={{ fontSize: '15px' }}>Total Balance After Paid:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                    {(paymentResult?.remainingBalance || 0).toLocaleString()} VND
                  </Text>
                </Col>
              </Row>

              {/* Total Balance in Wallet - Black */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={12}>
                  <Text style={{ fontSize: '14px' }}>Total Balance in Wallet:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '16px', color: '#000' }}>
                    {(paymentResult?.remainingBalance || 0).toLocaleString()} VND
                  </Text>
                </Col>
              </Row>

              <Divider style={{ margin: '12px 0' }} />

              {/* Status */}
              <Row gutter={[16, 8]} align="middle">
                <Col span={8}>
                  <Text type="secondary">Status:</Text>
                </Col>
                <Col span={16}>
                  <Tag color="green" style={{ fontSize: '13px', padding: '4px 12px' }}>Completed</Tag>
                </Col>
              </Row>
            </Space>
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
