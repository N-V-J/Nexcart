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
import { API_URL } from '../../config/api';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Get category icon based on name
  const getCategoryIcon = (name) => {
    const icons = {
      'Electronics': <LaptopOutlined />,
      'Clothing': <SkinOutlined />,
      'Home & Kitchen': <HomeOutlined />,
      'Phones & Accessories': <MobileOutlined />,
      'Sports & Outdoors': <AppstoreOutlined />,
      'Books': <AppstoreOutlined />
    };

    return icons[name] || <AppstoreOutlined />;
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/`);
        console.log('Sidebar Categories API URL:', `${API_URL}/categories/`);

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        console.log('Sidebar Categories data:', data);

        // Check if data is an array or has a results property
        let categoriesData = [];
        if (Array.isArray(data)) {
          categoriesData = data;
        } else if (data.results && Array.isArray(data.results)) {
          categoriesData = data.results;
        }

        // Add icons to categories
        const categoriesWithIcons = categoriesData.map(category => ({
          ...category,
          icon: getCategoryIcon(category.name)
        }));

        setCategories(categoriesWithIcons);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories in Sidebar:', error);
        // Fallback to mock data if API fails
        setCategories([
          { id: 1, name: 'Electronics', icon: <LaptopOutlined /> },
          { id: 2, name: 'Clothing', icon: <SkinOutlined /> },
          { id: 3, name: 'Home & Kitchen', icon: <HomeOutlined /> },
          { id: 4, name: 'Phones & Accessories', icon: <MobileOutlined /> },
        ]);
        setLoading(false);
      }
    };

    fetchCategories();
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
