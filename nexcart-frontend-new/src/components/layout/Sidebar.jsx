import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Spin } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  LaptopOutlined,
  MobileOutlined,
  HomeOutlined,
  SkinOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Mock categories - in a real app, these would be fetched from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories([
        { id: 1, name: 'Electronics', icon: <LaptopOutlined /> },
        { id: 2, name: 'Clothing', icon: <SkinOutlined /> },
        { id: 3, name: 'Home & Kitchen', icon: <HomeOutlined /> },
        { id: 4, name: 'Phones & Accessories', icon: <MobileOutlined /> },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const categoryItems = categories.map(category => ({
    key: `category-${category.id}`,
    icon: category.icon,
    label: (
      <Link to={`/products?category=${category.id}`}>
        {category.name}
      </Link>
    ),
  }));

  const menuItems = [
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: 'Categories',
      children: categoryItems,
    },
  ];

  // Always show sidebar for better navigation
  // We'll adjust the content based on the current page

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        overflow: 'auto',
        height: '100%',
      }}
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div style={{ padding: '16px' }}>
        <Title level={4}>Shop By</Title>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : (
        <Menu
          mode="inline"
          defaultSelectedKeys={['categories']}
          defaultOpenKeys={['categories']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      )}
    </Sider>
  );
};

export default Sidebar;
