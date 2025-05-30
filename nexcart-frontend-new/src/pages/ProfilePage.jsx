import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Avatar,
  Form,
  Input,
  Button,
  Row,
  Col,
  Tabs,
  Divider,
  Upload,
  message,
  Spin
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  HomeOutlined,
  PhoneOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  LockOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    avatar: null,
    addresses: [],
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch real user data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        if (!token) {
          // Redirect to login if not authenticated
          message.error('Please login to view your profile');
          navigate('/login');
          return;
        }

        // Fetch user data from API
        const response = await fetch('http://localhost:8000/api/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Get default address if available
        let defaultAddress = null;
        if (userData.addresses && userData.addresses.length > 0) {
          defaultAddress = userData.addresses.find(addr => addr.default) || userData.addresses[0];
        }

        // Format user data for our component
        const formattedUserData = {
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
          email: userData.email,
          phone: userData.phone_number || '',
          avatar_url: userData.avatar_url, // Use the avatar_url from the API
          addresses: userData.addresses || [],
          address: defaultAddress ? {
            line1: defaultAddress.street_address || '',
            line2: defaultAddress.apartment_address || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            pincode: defaultAddress.zip_code || '',
            country: defaultAddress.country || ''
          } : {
            line1: '',
            line2: '',
            city: '',
            state: '',
            pincode: '',
            country: ''
          }
        };

        setUserData(formattedUserData);
        form.setFieldsValue({
          name: formattedUserData.name,
          email: formattedUserData.email,
          phone: formattedUserData.phone,
          addressLine1: formattedUserData.address.line1,
          addressLine2: formattedUserData.address.line2,
          city: formattedUserData.address.city,
          state: formattedUserData.address.state,
          pincode: formattedUserData.address.pincode,
          country: formattedUserData.address.country
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form, navigate]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Authentication error. Please login again.');
        navigate('/login');
        return;
      }

      // Split name into first_name and last_name
      let firstName = '';
      let lastName = '';

      if (values.name) {
        const nameParts = values.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      // Update user profile
      const userResponse = await fetch(`http://localhost:8000/api/users/${userData.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: values.email,
          phone_number: values.phone
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to update profile');
      }

      // Check if user has an address
      let addressId = null;
      let addressMethod = 'POST';
      let addressUrl = 'http://localhost:8000/api/addresses/';

      // Get updated user data to check for addresses
      const userDataResponse = await fetch('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userDataResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const currentUserData = await userDataResponse.json();

      if (currentUserData.addresses && currentUserData.addresses.length > 0) {
        // Update existing address
        addressId = currentUserData.addresses[0].id;
        addressMethod = 'PUT';
        addressUrl = `http://localhost:8000/api/addresses/${addressId}/`;
      }

      // Update or create address
      const addressResponse = await fetch(addressUrl, {
        method: addressMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          address_type: 'shipping',
          street_address: values.addressLine1,
          apartment_address: values.addressLine2,
          city: values.city,
          state: values.state,
          country: values.country,
          zip_code: values.pincode,
          default: true
        }),
      });

      if (!addressResponse.ok) {
        throw new Error('Failed to update address');
      }

      // Refresh user data
      const updatedUserResponse = await fetch('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!updatedUserResponse.ok) {
        throw new Error('Failed to fetch updated user data');
      }

      const updatedUserData = await updatedUserResponse.json();

      // Get default address if available
      let defaultAddress = null;
      if (updatedUserData.addresses && updatedUserData.addresses.length > 0) {
        defaultAddress = updatedUserData.addresses.find(addr => addr.default) || updatedUserData.addresses[0];
      }

      // Format user data for our component
      const formattedUserData = {
        id: updatedUserData.id,
        name: `${updatedUserData.first_name} ${updatedUserData.last_name}`.trim() || updatedUserData.username,
        email: updatedUserData.email,
        phone: updatedUserData.phone_number || '',
        avatar: null,
        addresses: updatedUserData.addresses || [],
        address: defaultAddress ? {
          line1: defaultAddress.street_address || '',
          line2: defaultAddress.apartment_address || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          pincode: defaultAddress.zip_code || '',
          country: defaultAddress.country || ''
        } : {
          line1: '',
          line2: '',
          city: '',
          state: '',
          pincode: '',
          country: ''
        }
      };

      setUserData(formattedUserData);
      setEditMode(false);
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values) => {
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Authentication error. Please login again.');
        navigate('/login');
        return;
      }

      // Change password
      const response = await fetch(`http://localhost:8000/api/users/${userData.id}/change_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: values.currentPassword,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to change password');
      }

      passwordForm.resetFields();
      message.success('Password changed successfully!');

      // Optionally, you can log the user out and redirect to login page
      // This is a good practice after password change
      const logoutAfterPasswordChange = window.confirm(
        'Your password has been changed successfully. For security reasons, would you like to log out and log in again with your new password?'
      );

      if (logoutAfterPasswordChange) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        message.info('Please log in with your new password');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        if (!token) {
          message.error('Authentication error. Please login again.');
          navigate('/login');
          return;
        }

        // Create form data for file upload
        const formData = new FormData();
        formData.append('avatar', info.file.originFileObj);

        // Upload avatar
        const response = await fetch(`http://localhost:8000/api/users/${userData.id}/upload_avatar/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }

        const data = await response.json();

        // Update user data with new avatar URL
        setUserData({
          ...userData,
          avatar_url: data.avatar_url
        });

        message.success('Avatar uploaded successfully!');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        message.error('Failed to upload avatar. Please try again.');
      } finally {
        setUploadLoading(false);
      }
    }
  };

  // Custom upload button
  const uploadButton = (
    <div>
      {uploadLoading ? <Spin /> : <UploadOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Render profile information in view mode
  const renderProfileInfo = () => (
    <Card>
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            customRequest={({ onSuccess }) => {
              // Call onSuccess to trigger the 'done' status
              setTimeout(() => onSuccess("ok"), 0);
            }}
            beforeUpload={(file) => {
              const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
              if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG files!');
              }
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error('Image must be smaller than 2MB!');
              }
              return isJpgOrPng && isLt2M;
            }}
            onChange={handleAvatarUpload}
          >
            {userData.avatar_url ? (
              <Avatar
                src={userData.avatar_url}
                size={100}
                style={{ marginBottom: '10px' }}
              />
            ) : (
              <Avatar
                icon={<UserOutlined />}
                size={100}
                style={{ backgroundColor: '#1677ff', marginBottom: '10px' }}
              />
            )}
            {uploadButton}
          </Upload>
        </Col>

        <Col xs={24} md={16}>
          <Title level={3}>{userData.name}</Title>
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary"><MailOutlined style={{ marginRight: '8px' }} />{userData.email}</Text>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary"><PhoneOutlined style={{ marginRight: '8px' }} />{userData.phone}</Text>
          </div>
          <Divider />
          <Title level={4}>Address</Title>
          <div style={{ marginBottom: '8px' }}>
            <Text>{userData.address.line1}</Text>
          </div>
          {userData.address.line2 && (
            <div style={{ marginBottom: '8px' }}>
              <Text>{userData.address.line2}</Text>
            </div>
          )}
          <div style={{ marginBottom: '8px' }}>
            <Text>{userData.address.city}, {userData.address.state}, {userData.address.pincode}</Text>
          </div>
          <div>
            <Text>{userData.address.country}</Text>
          </div>

          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditMode(true)}
            style={{ marginTop: '24px' }}
          >
            Edit Profile
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // Render edit form
  const renderEditForm = () => (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          addressLine1: userData.address.line1,
          addressLine2: userData.address.line2,
          city: userData.address.city,
          state: userData.address.state,
          pincode: userData.address.pincode,
          country: userData.address.country
        }}
      >
        <Title level={4}>Personal Information</Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="John Doe" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="john.doe@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+91 9876543210" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>Address Information</Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="addressLine1"
              label="Address Line 1"
              rules={[{ required: true, message: 'Please enter your address' }]}
            >
              <Input prefix={<HomeOutlined />} placeholder="123 Main Street" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="addressLine2"
              label="Address Line 2"
            >
              <Input placeholder="Apartment, suite, etc. (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'Please enter your city' }]}
            >
              <Input placeholder="Mumbai" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: 'Please enter your state' }]}
            >
              <Input placeholder="Maharashtra" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="pincode"
              label="PIN Code"
              rules={[{ required: true, message: 'Please enter your PIN code' }]}
            >
              <Input placeholder="400001" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: 'Please enter your country' }]}
            >
              <Input placeholder="India" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Save Changes
          </Button>
          <Button
            onClick={() => setEditMode(false)}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // Render password change form
  const renderPasswordForm = () => (
    <Card>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handlePasswordChange}
      >
        <Title level={4}>Change Password</Title>
        <p style={{ marginBottom: '20px' }}>
          For security reasons, please enter your current password and then your new password twice.
        </p>

        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Current Password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
            autoComplete="new-password"
          />
        </Form.Item>

        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">Password must:</Text>
          <ul style={{ color: 'rgba(0, 0, 0, 0.45)', marginLeft: '20px' }}>
            <li>Be at least 8 characters long</li>
            <li>Contain at least one uppercase letter</li>
            <li>Contain at least one lowercase letter</li>
            <li>Contain at least one number</li>
            <li>Contain at least one special character (@$!%*?&)</li>
          </ul>
        </div>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm New Password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            style={{ marginRight: '10px' }}
          >
            Update Password
          </Button>
          <Button
            onClick={() => passwordForm.resetFields()}
          >
            Reset Form
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>My Profile</Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="profile">
          <TabPane tab="Profile Information" key="profile">
            {editMode ? renderEditForm() : renderProfileInfo()}
          </TabPane>
          <TabPane tab="Security" key="security">
            {renderPasswordForm()}
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default ProfilePage;
