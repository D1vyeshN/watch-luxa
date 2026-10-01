'use client';

import { useList } from '@refinedev/core';
import { Card, Table, Tag, Typography, Space, Alert, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useLogout } from '@refinedev/core';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  basePrice: number;
  brand?: { name: string };
  category?: string;
}

export default function DashboardPage() {
  const { mutate: logout } = useLogout();
  const { data, isLoading, isError, error } = useList<ProductRow>({
    resource: 'products',
    pagination: { currentPage: 1, pageSize: 5 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 8 }}>
              LUXE Admin Dashboard
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Products from your Express backend via Refine's dataProvider
            </Typography.Paragraph>
          </div>
          <Button icon={<LogoutOutlined />} onClick={() => logout()}>
            Logout
          </Button>
        </div>

        {isError && (
          <Alert
            type="error"
            showIcon
            message="Failed to fetch products"
            description={
              error?.message ??
              'Is the backend running on port 5000?'
            }
          />
        )}

        <Card
          title={
            <Space>
              <span>Products</span>
              {data && (
                <Tag color="blue">Total: {data.total}</Tag>
              )}
            </Space>
          }
          loading={isLoading}
        >
          <Table<ProductRow>
            dataSource={data?.data ?? []}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Brand',
                key: 'brand',
                render: (_, row) => row.brand?.name ?? '—',
              },
              {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
                render: (v) => v ?? '—',
              },
              {
                title: 'Price',
                dataIndex: 'basePrice',
                key: 'basePrice',
                render: (v: number) =>
                  `₹${(v / 100).toLocaleString('en-IN')}`,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (v: string) => (
                  <Tag color={v === 'active' ? 'green' : 'default'}>
                    {v}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Auth and dataProvider working. Step 2 complete.
        </Typography.Text>
      </Space>
    </div>
  );
}
