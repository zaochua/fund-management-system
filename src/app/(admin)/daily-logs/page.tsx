'use client';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, List, Card, Typography, DatePicker, Modal, Popconfirm, Space } from 'antd';
import { SendOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FundLog } from '@/lib/types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

export default function DailyLogsPage() {
  const [logs, setLogs] = useState<FundLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FundLog | null>(null);
  const [editForm] = Form.useForm();

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        message.error('获取记录失败');
      }
    } catch (error) {
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onFinish = async (values: { content: string; date: dayjs.Dayjs }) => {
    setSubmitting(true);
    try {
      const payload = {
        content: values.content,
        date: values.date.format('YYYY-MM-DD'),
      };

      const res = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success('发布成功');
        form.resetFields();
        form.setFieldsValue({ date: dayjs() }); // Reset date to today
        fetchLogs();
      } else {
        const data = await res.json();
        message.error(data.message || '发布失败');
      }
    } catch (error) {
      message.error('发布出错');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/daily-logs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchLogs();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleEditClick = (item: FundLog) => {
    setEditingLog(item);
    editForm.setFieldsValue({
      content: item.content,
      date: item.log_date ? dayjs(item.log_date) : dayjs(item.created_at),
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (values: { content: string; date: dayjs.Dayjs }) => {
    if (!editingLog) return;
    try {
      const payload = {
        content: values.content,
        date: values.date.format('YYYY-MM-DD'),
      };

      const res = await fetch(`/api/daily-logs/${editingLog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success('更新成功');
        setIsModalOpen(false);
        setEditingLog(null);
        fetchLogs();
      } else {
        message.error('更新失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>每日操作记录</h2>
      
      <Card title="发布记录" style={{ marginBottom: 24 }}>
        <Form 
          form={form} 
          onFinish={onFinish} 
          layout="vertical"
          initialValues={{ date: dayjs() }}
        >
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入记录内容' }]}
          >
            <TextArea rows={4} placeholder="记录基金操作心得..." maxLength={1000} showCount />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting}>
              发布
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="历史记录">
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={logs}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="text" icon={<EditOutlined />} key="edit" onClick={() => handleEditClick(item)}>编辑</Button>,
                <Popconfirm title="确认删除这条记录吗?" onConfirm={() => handleDelete(item.id)} key="delete">
                  <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>
                      {item.log_date ? dayjs(item.log_date).format('YYYY-MM-DD') : dayjs(item.created_at).format('YYYY-MM-DD')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (创建于: {dayjs(item.created_at).format('MM-DD HH:mm')})
                    </Text>
                  </Space>
                }
                description={<div style={{ whiteSpace: 'pre-wrap', color: '#333', marginTop: 8, fontSize: 15 }}>{item.content}</div>}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="编辑记录"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入记录内容' }]}
          >
            <TextArea rows={4} maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
