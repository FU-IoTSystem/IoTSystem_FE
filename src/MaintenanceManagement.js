import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Tag, Space, Card, message, Tabs, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { maintenanceAPI, kitAPI, kitComponentAPI } from './api';

const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const MaintenanceManagement = ({ currentUser }) => {
    console.log('MaintenanceManagement currentUser:', currentUser);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
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

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                scheduledDate: values.scheduledDate.toISOString(),
            };

            if (isEditing) {
                await maintenanceAPI.updatePlan(editingPlanId, payload);
                message.success('Maintenance plan updated successfully');
            } else {
                await maintenanceAPI.createPlan(payload);
                message.success('Maintenance plan created successfully');
            }

            setModalVisible(false);
            setIsEditing(false);
            setEditingPlanId(null);
            form.resetFields();
            loadPlans();
        } catch (error) {
            console.error('Error saving maintenance plan:', error);
            message.error('Failed to save maintenance plan');
        }
    };

    const handleEdit = (record) => {
        setIsEditing(true);
        setEditingPlanId(record.id);
        form.setFieldsValue({
            ...record,
            scheduledDate: dayjs(record.scheduledDate),
            // targetId removed
        });
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
        setIsEditing(false);
        setEditingPlanId(null);
        form.resetFields();
    };

    const handleDelete = (id) => {
        confirm({
            title: 'Are you sure you want to delete this maintenance plan?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await maintenanceAPI.deletePlan(id);
                    message.success('Maintenance plan deleted successfully');
                    loadPlans();
                } catch (error) {
                    console.error('Error deleting maintenance plan:', error);
                    message.error('Failed to delete maintenance plan');
                }
            },
        });
    };

    const handleSingleExport = async (plan) => {
        try {
            message.loading({ content: 'Preparing export...', key: 'exportLoading' });
            // Fetch issues for the plan
            const issuesData = await maintenanceAPI.getIssuesByPlan(plan.id);
            const issues = Array.isArray(issuesData) ? issuesData : (issuesData?.data || []);

            let dataToExport = [];

            if (issues.length > 0) {
                dataToExport = issues.map(issue => {
                    const comp = components.find(c => c.id === issue.componentId);
                    const componentName = comp ? comp.componentName : (issue.componentId || 'N/A');

                    return {
                        'Plan ID': plan.id,
                        'Scope': plan.scope,
                        'Scheduled Date': dayjs(plan.scheduledDate).format('YYYY-MM-DD'),
                        'Reason': plan.reason || 'N/A',
                        'Plan Status': plan.status,
                        'Created By': plan.createdBy,
                        'Issue ID': issue.id,
                        'Component': componentName,
                        'Issue Type': issue.issueType,
                        'Issue Quantity': issue.quantity
                    };
                });
            } else {
                dataToExport = [{
                    'Plan ID': plan.id,
                    'Scope': plan.scope,
                    'Scheduled Date': dayjs(plan.scheduledDate).format('YYYY-MM-DD'),
                    'Reason': plan.reason || 'N/A',
                    'Plan Status': plan.status,
                    'Created By': plan.createdBy,
                    'Issue ID': 'N/A',
                    'Component': 'N/A',
                    'Issue Type': 'N/A',
                    'Issue Quantity': 'N/A'
                }];
            }

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            saveAs(dataBlob, `MaintenancePlan_${plan.id}_${dayjs().format('YYYYMMDD')}.xlsx`);
            message.success({ content: 'Export successful', key: 'exportLoading' });
        } catch (error) {
            console.error('Error exporting maintenance plan:', error);
            message.error({ content: 'Failed to export maintenance plan', key: 'exportLoading' });
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
        // Target Name column removed
        {
            title: 'Scheduled Date',
            dataIndex: 'scheduledDate',
            key: 'scheduledDate',
            render: (date) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            render: (text) => text || 'N/A',
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
                    <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} />
                    <Button size="small" onClick={() => openIssueModal(record.id)}>Issues</Button>
                    <Button icon={<ExportOutlined />} size="small" onClick={() => handleSingleExport(record)} />
                </Space>
            )
        }
    ];

    const issueColumns = [
        {
            title: 'Component',
            key: 'component',
            render: (_, record) => {
                const comp = components.find(c => c.id === record.componentId);
                return comp ? comp.componentName : (record.componentId || 'N/A');
            }
        },
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

            {/* Create/Edit Plan Modal */}
            <Modal
                title={isEditing ? "Edit Maintenance Plan" : "Create Maintenance Plan"}
                visible={modalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ scope: 'COMPONENT', status: 'PLANNED' }}>
                    <Form.Item name="scope" label="Scope" hidden>
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="scheduledDate" label="Scheduled Date" rules={[{ required: true }]}>
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>
                    <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter a reason' }]}>
                        <Input.TextArea placeholder="Enter maintenance reason" rows={3} />
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
                width={900}
                footer={null}
            >
                <Card type="inner" title="Report New Issue">
                    <Form form={issueForm} layout="inline" onFinish={handleIssueCreate}>
                        <Form.Item name="componentId" rules={[{ required: true, message: 'Please select a component' }]}>
                            <Select placeholder="Select Component" showSearch optionFilterProp="children" style={{ width: 250 }}>
                                {components.map(comp => (
                                    <Option key={comp.id} value={comp.id}>{comp.componentName}</Option>
                                ))}
                            </Select>
                        </Form.Item>
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
