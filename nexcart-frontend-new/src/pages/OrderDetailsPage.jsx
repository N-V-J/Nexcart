import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Button,
  Space,
  Descriptions,
  List,
  Avatar,
  Tag,
  Divider,
  Row,
  Col,
  Spin,
  Empty,
  message,
  Modal
} from 'antd';
import { getValidImageUrl, handleImageError } from '../utils/imageUtils';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        if (!token) {
          message.error('Please login to view order details');
          navigate('/login');
          return;
        }

        // Fetch order details from API
        const response = await fetch(`http://localhost:8000/api/orders/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();

        // Log raw data for debugging
        console.log('Raw order data:', data);
        if (data.items && data.items.length > 0 && data.items[0].product) {
          console.log('First product image URL:', data.items[0].product.primary_image);
        }

        // Calculate expected delivery date (5 days from order date)
        const orderDate = new Date(data.created_at);
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 5);

        // Format delivery date with time
        const formattedDeliveryDate = `${deliveryDate.toLocaleDateString('en-IN')} by ${deliveryDate.getHours()}:${String(deliveryDate.getMinutes()).padStart(2, '0')}`;

        // Format order data
        const formattedOrder = {
          id: data.id,
          date: new Date(data.created_at).toISOString().split('T')[0],
          deliveryDate: formattedDeliveryDate,
          total: parseFloat(data.total_amount),
          status: data.status,
          items: data.items.map(item => {
            // Log each product's image URL
            if (item.product) {
              console.log(`Product ${item.product.name} image:`, item.product.primary_image);
            }

            return {
              id: item.id,
              name: item.product ? item.product.name : 'Product',
              quantity: item.quantity,
              price: parseFloat(item.price),
              image: item.product ? (item.product.image_url || item.product.primary_image) : null,
              product_id: item.product ? item.product.id : null,
              discount_price: item.product && item.product.discount_price ? parseFloat(item.product.discount_price) : null,
            };
          }),
          shipping: {
            name: data.shipping_address ? `${data.shipping_address.first_name} ${data.shipping_address.last_name}` : 'N/A',
            address: data.shipping_address ?
              `${data.shipping_address.street_address}${data.shipping_address.apartment_address ? ', ' + data.shipping_address.apartment_address : ''},
               ${data.shipping_address.city}, ${data.shipping_address.state}, ${data.shipping_address.zip_code}` :
              'No address provided',
            phone: data.shipping_address ? data.shipping_address.phone : 'N/A',
            email: data.shipping_address ? data.shipping_address.email : 'N/A',
            method: 'Standard Delivery'
          },
          payment: {
            method: data.payment_status ? 'Paid' : 'Pending',
            status: data.payment_status
          }
        };

        setOrder(formattedOrder);
      } catch (error) {
        console.error('Error fetching order details:', error);
        message.error('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  // Cancel order
  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Authentication error. Please login again.');
        navigate('/login');
        return;
      }

      // Call API to cancel order
      const response = await fetch(`http://localhost:8000/api/orders/${id}/cancel_order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel order');
      }

      message.success('Order cancelled successfully');
      setModalVisible(false);

      // Refresh order details
      const updatedResponse = await fetch(`http://localhost:8000/api/orders/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setOrder({
          ...order,
          status: updatedData.status
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      message.error(error.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Get status tag
  const getStatusTag = (status) => {
    switch (status) {
      case 'processing':
        return <Tag icon={<ClockCircleOutlined />} color="blue">Processing</Tag>;
      case 'shipped':
        return <Tag icon={<CarOutlined />} color="cyan">Shipped</Tag>;
      case 'delivered':
        return <Tag icon={<CheckCircleOutlined />} color="green">Delivered</Tag>;
      case 'cancelled':
        return <Tag icon={<ExclamationCircleOutlined />} color="red">Cancelled</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Show cancel confirmation modal
  const showCancelConfirm = () => {
    setModalVisible(true);
  };

  // Go back to orders page
  const handleGoBack = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Empty
        description="Order not found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={handleGoBack}>
          Back to Orders
        </Button>
      </Empty>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={handleGoBack}
        style={{ marginBottom: '20px', padding: 0 }}
      >
        Back to Orders
      </Button>

      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Title level={3}>
              <ShoppingOutlined /> Order Details
            </Title>
            <Space direction="vertical">
              <Text>Placed on {new Date(order.date).toLocaleDateString('en-IN')}</Text>
              <Text>Expected Delivery: {order.deliveryDate}</Text>
            </Space>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space direction="vertical" align="end">
              <div>
                <Text strong>Status: </Text>
                {getStatusTag(order.status)}
              </div>
              <Text strong>Total: ₹{order.total.toFixed(2)}</Text>
              {(order.status === 'pending' || order.status === 'processing') && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={showCancelConfirm}
                >
                  Cancel Order
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Shipping Information" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<><UserOutlined /> Name</>}>
                  {order.shipping.name}
                </Descriptions.Item>
                <Descriptions.Item label={<><HomeOutlined /> Address</>}>
                  {order.shipping.address}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                  {order.shipping.phone}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {order.shipping.email}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Payment Information" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Method">
                  {order.payment.method}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {order.payment.status ? 'Paid' : 'Pending'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>Ordered Items</Title>
        <Row gutter={[16, 16]}>
          {order.items.map(item => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                cover={
                  true ? (
                    <img
                      src={getValidImageUrl(item.image, item.name, 200, 200)}
                      alt={item.name}
                      style={{ height: 200, width: '100%', objectFit: 'cover' }}
                      onError={(e) => handleImageError(e, item.name, 200, 200)}
                    />
                  ) : (
                    <div style={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f0f0f0'
                    }}>
                      <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    </div>
                  )
                }
              >
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.name}</div>
                  <Space direction="vertical">
                    <Text>Quantity: {item.quantity}</Text>
                    <Text strong>₹{(item.price * item.quantity).toFixed(2)}</Text>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        title="Cancel Order"
        open={modalVisible}
        onOk={handleCancelOrder}
        confirmLoading={cancelLoading}
        onCancel={() => setModalVisible(false)}
        okText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to cancel this order?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default OrderDetailsPage;
