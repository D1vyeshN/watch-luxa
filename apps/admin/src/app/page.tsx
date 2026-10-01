'use client';

import { Button, Card, Space, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

export default function Step0VerificationPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card style={{ maxWidth: 560, width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 8 }}>
              <CheckCircleOutlined style={{ color: '#059669', marginRight: 8 }} />
              Step 0 — Foundation Ready
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Next.js 16, Refine v5, and Ant Design v5 are wired up. Custom
              providers come in Steps 1-3.
            </Typography.Paragraph>
          </div>

          <Space wrap>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button danger>Danger</Button>
          </Space>

          <Card size="small" title="Verification Checklist">
            <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              <li>Ant Design theme applied (forest primary, gray canvas)</li>
              <li>Inter font loaded</li>
              <li>AntdRegistry mounted (no FOUC)</li>
              <li>Folder structure created</li>
              <li>Performance tuning applied</li>
            </ul>
          </Card>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            If this renders correctly, say "Step 1" to build the dataProvider.
          </Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
