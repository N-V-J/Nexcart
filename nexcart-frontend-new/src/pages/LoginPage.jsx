import React, { useState } from 'react';
import { Typography, Form, Input, Button, Card, Checkbox, Divider, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Make a real API call to the Django backend
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username, // The serializer still expects 'username' field but will use it as email
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error response:', errorData);

        // Format error messages from the API response
        let errorMessage = 'Login failed';
        if (typeof errorData === 'object') {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
            const messages = [];
            for (const [key, value] of Object.entries(errorData)) {
              if (Array.isArray(value)) {
                messages.push(`${key}: ${value.join(', ')}`);
              } else if (typeof value === 'string') {
                messages.push(`${key}: ${value}`);
              }
            }
            if (messages.length > 0) {
              errorMessage = messages.join('; ');
            }
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store the JWT tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('isLoggedIn', 'true');

      // Get user info
      const userResponse = await fetch('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${data.access}`,
        },
      });

      let isAdmin = false;
      let userData = null;

      if (userResponse.ok) {
        userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));

        // Check if user is admin (staff or superuser)
        isAdmin = userData.is_staff || userData.is_superuser;
        console.log('User data:', userData);
        console.log('Is admin:', isAdmin);

        // Force redirect to admin page if username is nvj (your admin username)
        if (values.username === 'nvj') {
          console.log('Username is nvj, forcing admin redirect');
          message.success('Login successful! Redirecting to admin panel...');
          navigate('/admin');
          return;
        }
      }

      message.success('Login successful!');

      // Explicitly check admin status with the backend
      try {
        const adminCheckResponse = await fetch('http://localhost:8000/api/users/check_admin/', {
          headers: {
            'Authorization': `Bearer ${data.access}`,
          },
        });

        if (adminCheckResponse.ok) {
          const adminCheckData = await adminCheckResponse.json();
          console.log('Admin check response:', adminCheckData);

          if (adminCheckData.is_admin) {
            // User is confirmed as admin by the backend
            message.info('You are logged in as an admin. Redirecting to admin panel.');
            navigate('/admin');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }

      // If we get here, either the admin check failed or the user is not an admin
      // Fallback to the original logic
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      // Check if the user data indicates admin status
      if (userData && (userData.is_staff || userData.is_superuser)) {
        console.log('User is admin according to user data, redirecting to admin page');
        message.info('You are logged in as an admin. Redirecting to admin panel.');
        navigate('/admin');
        return;
      }

      if (redirect === 'admin' && isAdmin) {
        navigate('/admin');
      } else if (isAdmin) {
        // If user is admin, go to admin page
        message.info('You are logged in as an admin. You can access the admin panel.');
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px - 70px)' }}>
      <Card className="auth-form" style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Welcome Back</Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Log in
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Text>Don't have an account? </Text>
            <Link to="/register">Register now</Link>
          </div>

          <Divider>or login with</Divider>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Button
              icon={<GoogleOutlined />}
              size="large"
              onClick={() => message.info('Google login not implemented in this demo')}
            >
              Google
            </Button>
            <Button
              icon={<FacebookOutlined />}
              size="large"
              onClick={() => message.info('Facebook login not implemented in this demo')}
            >
              Facebook
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;