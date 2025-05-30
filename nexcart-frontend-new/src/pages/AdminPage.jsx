import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import {
  Layout,
  Menu,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Spin,
  message,
  Tabs
} from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TagOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined
} from '@ant-design/icons';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminUsers from '../components/admin/AdminUsers';
import AdminCategories from '../components/admin/AdminCategories';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        console.log('Checking admin status with token:', token ? 'Token exists' : 'No token');

        if (!token) {
          message.error('You must be logged in to access the admin page');
          navigate('/login?redirect=admin');
          return;
        }

        // First check user data from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('User data from localStorage:', userData);

            // Special case for username 'nvj' - your admin username
            if (userData.username === 'nvj') {
              console.log('User is nvj, granting admin access');
              setIsAdmin(true);
              fetchDashboardStats();
              return;
            }

            if (userData.is_staff || userData.is_superuser) {
              console.log('User is admin according to localStorage');
              setIsAdmin(true);
              fetchDashboardStats();
              return;
            }
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }

        // Now check with the backend
        console.log('Making request to check_admin endpoint...');
        const response = await fetch('http://localhost:8000/api/users/check_admin/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Admin check response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to verify admin status');
        }

        const data = await response.json();
        console.log('Admin check response data:', data);

        if (!data.is_admin) {
          message.error('You do not have permission to access the admin page');
          navigate('/');
          return;
        }

        console.log('Admin status confirmed, setting isAdmin to true');
        setIsAdmin(true);
        fetchDashboardStats();
      } catch (error) {
        console.error('Error checking admin status:', error);
        message.error('You do not have permission to access the admin page');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/admin/dashboard_stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      console.log('Dashboard stats data:', data);

      // Process recent orders to ensure user data is available
      if (data.recentOrders && Array.isArray(data.recentOrders)) {
        // Fetch user details for each order if not already included
        const ordersWithUserDetails = await Promise.all(
          data.recentOrders.map(async (order) => {
            if (!order.user && order.user_id) {
              try {
                const userResponse = await fetch(`http://localhost:8000/api/users/${order.user_id}/`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
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
        data.recentOrders = ordersWithUserDetails;
      }

      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    message.success('Logged out successfully');
    navigate('/login');
  };

  // Render dashboard content
  const renderDashboard = () => (
    <div>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Orders" style={{ marginTop: 16 }}>
        <Table
          dataSource={stats.recentOrders}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: 'Order ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: 'Customer',
              key: 'customer',
              render: (_, record) => {
                console.log('Order record in AdminPage dashboard:', record);
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
              render: (text) => new Date(text).toLocaleDateString('en-IN')
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => {
                let color = 'default';
                if (status === 'processing') color = 'blue';
                if (status === 'shipped') color = 'cyan';
                if (status === 'delivered') color = 'green';
                if (status === 'cancelled') color = 'red';

                return <Tag color={color}>{status.toUpperCase()}</Tag>;
              }
            },
            {
              title: 'Total',
              dataIndex: 'total_amount',
              key: 'total_amount',
              render: (text) => `₹${parseFloat(text).toFixed(2)}`
            },
          ]}
        />
      </Card>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'users':
        return <AdminUsers />;
      case 'categories':
        return <AdminCategories />;
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text strong style={{ color: 'white' }}>NexCart Admin</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            if (key === 'logout') {
              handleLogout();
            } else {
              setActiveTab(key);
            }
          }}
          items={[
            {
              key: 'home',
              icon: <HomeOutlined />,
              label: 'Home',
              onClick: () => navigate('/'),
            },
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'products',
              icon: <AppstoreOutlined />,
              label: 'Products',
            },
            {
              key: 'orders',
              icon: <ShoppingOutlined />,
              label: 'Orders',
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: 'Users',
            },
            {
              key: 'categories',
              icon: <TagOutlined />,
              label: 'Categories',
            },


            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Title>
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                style={{ marginLeft: 16 }}
              >
                Home
              </Button>
            </div>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/dashboard" element={renderContent()} />
            <Route path="*" element={renderContent()} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
