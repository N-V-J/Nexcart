import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin, Alert } from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
    activeProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [systemInfo, setSystemInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        // Fetch products count
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const productsResponse = await fetch(`${apiUrl}/products/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch users count
        const usersResponse = await fetch(`${apiUrl}/users/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch orders
        const ordersResponse = await fetch(`${apiUrl}/orders/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!productsResponse.ok || !usersResponse.ok || !ordersResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const productsData = await productsResponse.json();
        const usersData = await usersResponse.json();
        const ordersData = await ordersResponse.json();

        console.log('Orders data:', ordersData);

        // Calculate total revenue from orders
        const totalRevenue = ordersData.results.reduce(
          (sum, order) => sum + parseFloat(order.total_amount),
          0
        );

        // Fetch categories for additional stats
        const categoriesResponse = await fetch(`${apiUrl}/categories/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : { count: 0, results: [] };

        // Calculate additional stats
        const activeProducts = productsData.results ?
          productsData.results.filter(product => product.is_active).length : 0;
        const pendingOrders = ordersData.results ?
          ordersData.results.filter(order => order.status === 'pending').length : 0;
        const completedOrders = ordersData.results ?
          ordersData.results.filter(order => order.status === 'completed').length : 0;

        setStats({
          totalProducts: productsData.count || 0,
          totalUsers: usersData.count || 0,
          totalOrders: ordersData.count || 0,
          totalRevenue: totalRevenue,
          totalCategories: categoriesData.count || 0,
          activeProducts: activeProducts,
          pendingOrders: pendingOrders,
          completedOrders: completedOrders,
        });

        // Get recent orders (last 5)
        const recentOrdersData = ordersData.results.slice(0, 5);
        console.log('Recent orders:', recentOrdersData);

        // Fetch user details for each order if not already included
        const ordersWithUserDetails = await Promise.all(
          recentOrdersData.map(async (order) => {
            if (!order.user && order.user_id) {
              try {
                const userResponse = await fetch(`${apiUrl}/users/${order.user_id}/`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  return { ...order, user: userData };
                }
              } catch (error) {
                console.error(`Error fetching user for order ${order.id}:`, error);
              }
            }
            return order;
          })
        );

        setRecentOrders(ordersWithUserDetails);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      key: 'user',
      render: (_, record) => {
        console.log('Order record:', record); // Debug log
        if (record.user && record.user.username) {
          return `@${record.user.username}`;
        } else if (record.user_id) {
          return `User ${record.user_id}`;
        } else {
          return 'Guest';
        }
      },
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'delivered') color = 'green';
        if (status === 'cancelled') color = 'red';
        if (status === 'processing') color = 'orange';
        if (status === 'shipped') color = 'cyan';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `₹${parseFloat(amount).toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={`Failed to load dashboard data: ${error}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>

      {/* Main Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix={<>
                <CreditCardOutlined style={{ marginRight: 4 }} />
                <span>₹</span>
              </>}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={stats.totalCategories}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Products"
              value={stats.activeProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={stats.pendingOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Orders"
              value={stats.completedOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Title level={4}>Recent Orders</Title>
        <Table
          columns={orderColumns}
          dataSource={recentOrders.map(order => ({ ...order, key: order.id }))}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
