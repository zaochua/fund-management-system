'use client';
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FundName } from '@/lib/types';
import dayjs from 'dayjs';

export default function FundNamesPage() {
  const [data, setData] = useState<FundName[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FundName | null>(null);
  const [form] = Form.useForm();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fund-names');
      if (res.ok) {
        const jsonData = await res.json();
        setData(jsonData);
      } else {
        message.error('获取基金名称列表失败');
      }
    } catch (error) {
      message.error('获取数据出错');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (values: { name: string }) => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/fund-names/${editingItem.id}` : '/api/fund-names';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(editingItem ? '更新成功' : '添加成功');
        setIsModalOpen(false);
        form.resetFields();
        setEditingItem(null);
        fetchData();
      } else {
        const errorData = await res.json();
        message.error(errorData.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleEdit = (record: FundName) => {
    setEditingItem(record);
    form.setFieldsValue({ name: record.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/fund-names/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '基金名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: FundName) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>基金名称管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          新增基金名称
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingItem ? "编辑基金名称" : "新增基金名称"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item
            name="name"
            label="基金名称"
            rules={[{ required: true, message: '请输入基金名称' }]}
          >
            <Input placeholder="请输入基金名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
