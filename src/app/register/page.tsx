'use client';
import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Need to add this type to types.ts later or just inline it here for simplicity
interface RegisterFormValues {
  username: string;
  password?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const onFinish = async (values: RegisterFormValues) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success('注册成功，请登录。');
        router.push('/login');
      } else {
        const data = await res.json();
        message.error(data.message || '注册失败');
      }
    } catch (error) {
      message.error('发生错误');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="用户注册" style={{ width: 300 }}>
        <Form
          name="register"
          className="login-form"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="用户名" 
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>
              注册
            </Button>
            或 <Link href="/login">立即登录!</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
