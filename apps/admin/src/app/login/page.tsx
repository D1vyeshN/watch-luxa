'use client';

import { useState } from 'react';
import { useLogin } from '@refinedev/core';
import { Button, Card, Form, Input, Typography, Alert, Space } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

interface LoginFormValues {
  email: string;
  password: string;
}

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin<LoginFormValues>();
  const [formError, setFormError] = useState<string | null>(null);

  const onFinish = (values: LoginFormValues) => {
    setFormError(null);
    login(values);
  };

  // Extract error message from Refine's error shape
  const errorMessage =
    formError ||
    (error as { message?: string } | null)?.message ||
    null;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#0f2320',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
        styles={{ body: { padding: 40 } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Brand */}
          <div style={{ textAlign: 'center' }}>
            <Typography.Title
              level={2}
              style={{
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.25em',
                marginBottom: 8,
                color: '#0f2320',
              }}
            >
              LUXE
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Admin Portal
            </Typography.Text>
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              marginTop: 8,
            }}
          />

          {/* Heading */}
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              Sign in
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Enter your admin credentials to continue.
            </Typography.Text>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              closable
              onClose={() => setFormError(null)}
            />
          )}

          {/* Form */}
          <Form<LoginFormValues>
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                placeholder="admin@luxe.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                block
                size="large"
                style={{ height: 44 }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <Typography.Text
            type="secondary"
            style={{ fontSize: 11, textAlign: 'center', display: 'block' }}
          >
            Restricted area. Access is monitored and logged.
          </Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
