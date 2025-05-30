import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Input, Drawer, Space, Avatar, message, Divider } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  MenuOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import './UserMenu.css';

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const navigate = useNavigate();

  // Get cart data from context
  const { cartCount } = useCart();

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    // If logged in, fetch user data
    if (loggedIn) {
      const fetchUserData = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const response = await fetch(`${apiUrl}/users/me/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Clear tokens and any user data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');

    // Update state
    setIsLoggedIn(false);
    setUserData(null);

    // Redirect to home page
    navigate('/');

    // Show success message
    message.success('Logged out successfully');
  };

  // No longer needed with offcanvas menu

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  const showUserMenu = () => {
    console.log('Opening user menu');
    setUserMenuVisible(true);
  };

  const closeUserMenu = () => {
    setUserMenuVisible(false);
  };

  const handleSearch = (value) => {
    if (value) {
      navigate(`/products?search=${value}`);
    }
  };

  // Check if user is admin
  const isAdmin = userData && (userData.is_staff || userData.is_superuser || userData.username === 'nvj');

  const menuItems = [
    {
      key: 'home',
      label: <Link to="/" style={{ color: 'white' }}>Home</Link>,
    },
    {
      key: 'products',
      label: <Link to="/products" style={{ color: 'white' }}>Products</Link>,
    },
    // Add admin link if user is admin
    ...(isAdmin ? [{
      key: 'admin',
      label: <Link to="/admin" style={{ color: 'white' }}>Admin</Link>,
    }] : []),
  ];

  // User menu items are now directly in the offcanvas menu

  // We've moved these elements directly into the header layout

  return (
    <>
      <AntHeader style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Logo and Main Menu */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo" style={{ marginRight: '20px' }}>
              <Link to="/">
                <h1 style={{ color: 'white', margin: 0 }}>NexCart</h1>
              </Link>
            </div>

            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['home']}
              items={menuItems}
              style={{ border: 'none' }}
            />
          </div>

          {/* Search, Cart and User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {!isLoggedIn && (
              <Link to="/login">
                <Button type="primary">
                  Login
                </Button>
              </Link>
            )}
            <Search
              placeholder="Search products"
              onSearch={handleSearch}
              style={{ width: 200 }}
            />

            <Link to="/cart">
              <Badge count={cartCount} size="small" showZero={false}>
                <ShoppingCartOutlined style={{ fontSize: '20px', color: 'white' }} />
              </Badge>
            </Link>

            <Avatar
              icon={<UserOutlined />}
              src={userData?.avatar_url}
              style={{
                cursor: 'pointer',
                backgroundColor: isLoggedIn ? (userData?.avatar_url ? 'transparent' : '#1677ff') : '#d9d9d9',
                color: 'white',
                fontSize: '18px'
              }}
              size="large"
              onClick={() => {
                console.log('Avatar clicked');
                showUserMenu();
              }}
            />
          </div>
        </div>

        {/* Mobile Menu Button - Hidden on desktop */}
        <div className="mobile-menu-button" style={{ display: 'none' }}>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={showMobileMenu}
          />
        </div>
      </AntHeader>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeMobileMenu}
        open={mobileMenuVisible}
        styles={{ body: { padding: 0 } }}
      >
        <Menu mode="vertical" defaultSelectedKeys={['home']}>
          {menuItems.map(item => (
            <Menu.Item key={item.key} onClick={closeMobileMenu}>
              {item.label}
            </Menu.Item>
          ))}
          <Menu.Item key="search">
            <Search
              placeholder="Search products"
              onSearch={(value) => {
                handleSearch(value);
                closeMobileMenu();
              }}
              style={{ width: '100%', margin: '10px 0' }}
            />
          </Menu.Item>
          <Menu.Item key="cart" onClick={closeMobileMenu}>
            <Link to="/cart">
              <Space>
                <ShoppingCartOutlined />
                Cart ({cartCount})
              </Space>
            </Link>
          </Menu.Item>
          {!isLoggedIn && (
            <Menu.Item key="login" onClick={closeMobileMenu}>
              <Link to="/login">
                <Button type="primary" block>
                  Login
                </Button>
              </Link>
            </Menu.Item>
          )}

          <Menu.Item key="about" onClick={closeMobileMenu}>
            <Link to="/about">
              <Space>
                <InfoCircleOutlined />
                About Us
              </Space>
            </Link>
          </Menu.Item>

          {isLoggedIn && (
            <>
              <Menu.Item key="profile" onClick={closeMobileMenu}>
                <Link to="/profile">
                  <Space>
                    <UserOutlined />
                    My Profile
                  </Space>
                </Link>
              </Menu.Item>
              <Menu.Item key="orders" onClick={closeMobileMenu}>
                <Link to="/orders">
                  <Space>
                    <ShoppingOutlined />
                    My Orders
                  </Space>
                </Link>
              </Menu.Item>
              <Menu.Item key="logout" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                <Space>
                  <LogoutOutlined />
                  Logout
                </Space>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Drawer>

      {/* Custom User Menu Offcanvas */}
      <div
        className={`user-menu-overlay ${userMenuVisible ? 'visible' : ''}`}
        onClick={closeUserMenu}
      ></div>
      <div className={`user-menu ${userMenuVisible ? 'visible' : ''}`}>
        <div className="user-menu-header">
          <h3>User Menu</h3>
          <button className="user-menu-close" onClick={closeUserMenu}>×</button>
        </div>

        {isLoggedIn ? (
          <>
            <div className="user-menu-profile">
              <Avatar
                size={64}
                src={userData?.avatar_url}
                icon={<UserOutlined />}
                style={{ backgroundColor: userData?.avatar_url ? 'transparent' : '#1677ff' }}
              />
              <h3>{userData ? `${userData.first_name} ${userData.last_name}`.trim() || userData.username : 'User'}</h3>
              <p style={{ color: '#666' }}>{userData?.email || ''}</p>
            </div>

            <ul className="user-menu-items">
              {/* Account Section */}
              <li className="user-menu-section-title">My Account</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <UserOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>Profile</span>
                </Link>
              </li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/orders" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ShoppingOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>View My Orders</span>
                </Link>
              </li>

              {/* Shopping Section */}
              <li className="user-menu-divider"></li>
              <li className="user-menu-section-title">Shopping</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ShoppingCartOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>My Cart</span>
                  {cartCount > 0 && (
                    <Badge
                      count={cartCount}
                      size="small"
                      style={{ marginLeft: '8px' }}
                    />
                  )}
                </Link>
              </li>

              {/* Other Section */}
              <li className="user-menu-divider"></li>
              <li className="user-menu-section-title">More</li>
              {isAdmin && (
                <li className="user-menu-item" onClick={closeUserMenu}>
                  <Link to="/admin" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <SettingOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                    <span style={{ fontWeight: '500' }}>Admin Panel</span>
                  </Link>
                </li>
              )}
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/about" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <InfoCircleOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>About Us</span>
                </Link>
              </li>
              <li className="user-menu-divider"></li>
              <li
                className="user-menu-item danger"
                onClick={() => {
                  handleLogout();
                  closeUserMenu();
                }}
                style={{ marginTop: '10px' }}
              >
                <LogoutOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                <span style={{ fontWeight: '500' }}>Logout</span>
              </li>
            </ul>
          </>
        ) : (
          <>


            <ul className="user-menu-items">
              {/* Account Section */}
              <li className="user-menu-section-title">My Account</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <UserOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>Profile</span>
                </Link>
              </li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ShoppingOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>View My Orders</span>
                </Link>
              </li>

              {/* Shopping Section */}
              <li className="user-menu-divider"></li>
              <li className="user-menu-section-title">Shopping</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ShoppingCartOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>My Cart</span>
                  {cartCount > 0 && (
                    <Badge
                      count={cartCount}
                      size="small"
                      style={{ marginLeft: '8px' }}
                    />
                  )}
                </Link>
              </li>

              {/* Other Section */}
              <li className="user-menu-divider"></li>
              <li className="user-menu-section-title">More</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link to="/about" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <InfoCircleOutlined style={{ marginRight: '10px', fontSize: '18px' }} />
                  <span style={{ fontWeight: '500' }}>About Us</span>
                </Link>
              </li>
              <li className="user-menu-divider"></li>
              <li
                className="user-menu-item"
                onClick={() => {
                  navigate('/login');
                  closeUserMenu();
                }}
                style={{ marginTop: '10px' }}
              >
                <LogoutOutlined
                  style={{
                    marginRight: '10px',
                    fontSize: '18px'
                  }}
                />
                <span style={{ fontWeight: '500' }}>Logout</span>
              </li>
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default Header;
