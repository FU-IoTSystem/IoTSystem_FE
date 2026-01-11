import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Tag, Space, Card, message, Tabs, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { maintenanceAPI, kitAPI, kitComponentAPI } from './api';

const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

const MaintenanceManagement = ({ currentUser }) => {
    console.log('MaintenanceManagement currentUser:', currentUser);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [kits, setKits] = useState([]);
    const [components, setComponents] = useState([]);
    const [targetType, setTargetType] = useState('COMPONENT');

    // Issue Modal State
    const [issueModalVisible, setIssueModalVisible] = useState(false);
    const [issueForm] = Form.useForm();
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [planIssues, setPlanIssues] = useState([]);
    const [issueLoading, setIssueLoading] = useState(false);

    useEffect(() => {
        loadPlans();
        loadTargets();
    }, []);

    useEffect(() => {
        if (currentUser) {
            form.setFieldsValue({ createdBy: currentUser.email || currentUser.fullName || currentUser.username });
        }
    }, [currentUser, form, modalVisible]);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await maintenanceAPI.getAllPlans();
            // Handle potential API variations
            const plansData = Array.isArray(data) ? data : (data?.data || []);
            setPlans(plansData);
        } catch (error) {
            console.error('Error loading maintenance plans:', error);
            message.error('Failed to load maintenance plans');
        } finally {
            setLoading(false);
        }
    };

    const loadTargets = async () => {
        try {
            // Fetch components
            const compsData = await kitComponentAPI.getAllComponents();
            setComponents(Array.isArray(compsData) ? compsData : (compsData?.data || []));
        } catch (error) {
            console.error('Error loading targets:', error);
        }
    };

    const handleCreate = async (values) => {
        try {
            const payload = {
                ...values,
                scheduledDate: values.scheduledDate.toISOString(),
            };
            await maintenanceAPI.createPlan(payload);
            message.success('Maintenance plan created successfully');
            setModalVisible(false);
            form.resetFields();
            loadPlans();
        } catch (error) {
            console.error('Error creating maintenance plan:', error);
            message.error('Failed to create maintenance plan');
        }
    };

    const loadIssues = async (planId) => {
        setIssueLoading(true);
        try {
            const issues = await maintenanceAPI.getIssuesByPlan(planId);
            setPlanIssues(Array.isArray(issues) ? issues : (issues?.data || []));
        } catch (error) {
            console.error('Error loading issues:', error);
            message.error('Failed to load issues for this plan');
        } finally {
            setIssueLoading(false);
        }
    }

    const handleIssueCreate = async (values) => {
        try {
            const payload = {
                ...values,
                maintenancePlanId: selectedPlanId
            };
            await maintenanceAPI.createIssue(payload);
            message.success('Issue reported successfully');
            issueForm.resetFields();
            loadIssues(selectedPlanId); // Reload issues
        } catch (error) {
            console.error("Error creating issue", error);
            message.error("Failed to report issue");
        }
    }

    const openIssueModal = (planId) => {
        setSelectedPlanId(planId);
        loadIssues(planId);
        setIssueModalVisible(true);
    }

    const columns = [
        {
            title: 'Scope',
            dataIndex: 'scope',
            key: 'scope',
            render: (scope) => <Tag color={scope === 'KIT' ? 'blue' : 'purple'}>{scope}</Tag>,
        },
        {
            title: 'Target Name',
            key: 'targetName',
            render: (_, record) => {
                if (record.scope === 'COMPONENT') {
                    const comp = components.find(c => c.id === record.targetId);
                    return comp ? comp.componentName : record.targetId;
                }
                return record.targetId;
            },
        },
        {
            title: 'Scheduled Date',
            dataIndex: 'scheduledDate',
            key: 'scheduledDate',
            render: (date) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'PLANNED') color = 'orange';
                if (status === 'IN_PROGRESS') color = 'processing';
                if (status === 'DONE') color = 'success';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openIssueModal(record.id)}>Issues</Button>
                </Space>
            )
        }
    ];

    const issueColumns = [
        {
            title: 'Issue Type',
            dataIndex: 'issueType',
            key: 'issueType',
            render: (type) => <Tag color="error">{type}</Tag>
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        }
    ];

    return (
        <Card title="Maintenance Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>Create Plan</Button>}>
            <Table
                columns={columns}
                dataSource={plans}
                rowKey="id"
                loading={loading}
            />

            {/* Create Plan Modal */}
            <Modal
                title="Create Maintenance Plan"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ scope: 'COMPONENT', status: 'PLANNED' }}>
                    <Form.Item name="scope" label="Scope" hidden>
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="targetId" label="Target Component" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children">
                            {components.map(comp => (
                                <Option key={comp.id} value={comp.id}>{comp.componentName}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="scheduledDate" label="Scheduled Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select>
                            <Option value="PLANNED">PLANNED</Option>
                            <Option value="IN_PROGRESS">IN_PROGRESS</Option>
                            <Option value="DONE">DONE</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="createdBy" label="Created By" rules={[{ required: true }]}>
                        <Input disabled />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Issues Modal */}
            <Modal
                title="Maintenance Issues"
                visible={issueModalVisible}
                onCancel={() => setIssueModalVisible(false)}
                width={800}
                footer={null}
            >
                <Card type="inner" title="Report New Issue">
                    <Form form={issueForm} layout="inline" onFinish={handleIssueCreate}>
                        <Form.Item name="issueType" rules={[{ required: true }]}>
                            <Select placeholder="Select Issue Type" style={{ width: 150 }}>
                                <Option value="DAMAGED">DAMAGED</Option>
                                <Option value="LOST">LOST</Option>
                                <Option value="EXPIRED">EXPIRED</Option>
                                <Option value="MISSING">MISSING</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="quantity" rules={[{ required: true }]}>
                            <InputNumber placeholder="Qty" style={{ width: 80 }} min={1} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Report</Button>
                        </Form.Item>
                    </Form>
                </Card>
                <Table
                    style={{ marginTop: 16 }}
                    columns={issueColumns}
                    dataSource={planIssues}
                    rowKey="id"
                    loading={issueLoading}
                    pagination={false}
                />
            </Modal>

        </Card>
    );
};

export default MaintenanceManagement;
