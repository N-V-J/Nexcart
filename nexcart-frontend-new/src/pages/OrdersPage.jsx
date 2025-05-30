import React, { useState, useEffect } from 'react';
import { Typography, Tag, Button, Space, Card, Empty, Spin, Tabs, message, Modal, Row, Col, Divider } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getValidImageUrl, handleImageError } from '../utils/imageUtils';
import { API_URL } from '../config/api';

const { Title, Text } = Typography;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Fetch orders data
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        // If not logged in, redirect to login
        message.info('Please login to view your orders');
        navigate('/login');
        return;
      }

      // Fetch orders from API
      const response = await fetch(`${API_URL}/orders/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();

      // Format orders data
      const formattedOrders = data.results.map(order => {
        // Format shipping address
        const shippingAddress = order.shipping_address ?
          `${order.shipping_address.street_address}${order.shipping_address.apartment_address ? ', ' + order.shipping_address.apartment_address : ''},
           ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.zip_code}` :
          'No address provided';

        // Log order items for debugging
        console.log('Order items:', order.items);
        if (order.items.length > 0 && order.items[0].product) {
          console.log('First product image URL:', order.items[0].product.primary_image);
        }

        return {
          id: order.id,
          date: new Date(order.created_at).toISOString().split('T')[0],
          total: parseFloat(order.total_amount),
          status: order.status,
          items: order.items.map(item => {
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
            address: shippingAddress,
            method: 'Standard Delivery'
          },
          payment: {
            method: order.payment_status ? 'Paid' : 'Pending',
            status: order.payment_status
          }
        };
      });

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

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
      const response = await fetch(`${API_URL}/orders/${selectedOrderId}/cancel_order/`, {
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

      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      message.error(error.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Show cancel confirmation modal
  const showCancelConfirm = (orderId) => {
    setSelectedOrderId(orderId);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

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

  // Render order card
  const renderOrderCard = (order) => {
    // Calculate expected delivery date (5 days from order date)
    const orderDate = new Date(order.date);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    // Format delivery date with time
    const formattedDeliveryDate = `${deliveryDate.toLocaleDateString('en-IN')} by ${deliveryDate.getHours()}:${String(deliveryDate.getMinutes()).padStart(2, '0')}`;

    return (
      <Card
        key={order.id}
        style={{ marginBottom: 16 }}
        hoverable
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <Text strong>Order Date:</Text>
                <Text>{new Date(order.date).toLocaleDateString('en-IN')}</Text>
                {getStatusTag(order.status)}
              </Space>

              <Space>
                <Text strong>Expected Delivery:</Text>
                <Text>{formattedDeliveryDate}</Text>
              </Space>

              <Space>
                <Text strong>Total:</Text>
                <Text>₹{order.total.toFixed(2)}</Text>
              </Space>

              <Space>
                <Text strong>Items:</Text>
                <Text>{order.items.length} {order.items.length === 1 ? 'product' : 'products'}</Text>
              </Space>

              <Space size="small">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  View Details
                </Button>

                {(order.status === 'pending' || order.status === 'processing') && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => showCancelConfirm(order.id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </Space>
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ textAlign: 'right' }}>
              <Text strong>Products:</Text>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={[16, 16]}>
          {order.items.map(item => (
            <Col xs={12} sm={8} md={6} lg={4} key={item.id}>
              <Card
                hoverable
                size="small"
                cover={
                  <div style={{ height: 120, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {true ? (
                      <img
                        src={getValidImageUrl(item.image, item.name, 150, 150)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => handleImageError(e, item.name, 150, 150)}
                      />
                    ) : (
                      <div style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f0f0f0'
                      }}>
                        <InboxOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
                      </div>
                    )}
                  </div>
                }
                styles={{ body: { padding: '8px', textAlign: 'center' } }}
              >
                <div style={{ fontSize: '12px', lineHeight: 1.2, height: '30px', overflow: 'hidden' }}>
                  {item.name}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Qty: {item.quantity}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  // Filter orders by status
  const getFilteredOrders = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>
        <ShoppingOutlined /> My Orders
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : orders.length > 0 ? (
        <Card>
          <Tabs
            defaultActiveKey="all"
            items={[
              {
                key: 'all',
                label: 'All Orders',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    {getFilteredOrders('all').map(order => renderOrderCard(order))}
                    {getFilteredOrders('all').length === 0 && (
                      <Empty description="No orders found" />
                    )}
                  </div>
                )
              },
              {
                key: 'processing',
                label: 'Processing',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    {getFilteredOrders('processing').map(order => renderOrderCard(order))}
                    {getFilteredOrders('processing').length === 0 && (
                      <Empty description="No processing orders" />
                    )}
                  </div>
                )
              },
              {
                key: 'shipped',
                label: 'Shipped',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    {getFilteredOrders('shipped').map(order => renderOrderCard(order))}
                    {getFilteredOrders('shipped').length === 0 && (
                      <Empty description="No shipped orders" />
                    )}
                  </div>
                )
              },
              {
                key: 'delivered',
                label: 'Delivered',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    {getFilteredOrders('delivered').map(order => renderOrderCard(order))}
                    {getFilteredOrders('delivered').length === 0 && (
                      <Empty description="No delivered orders" />
                    )}
                  </div>
                )
              },
              {
                key: 'cancelled',
                label: 'Cancelled',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    {getFilteredOrders('cancelled').map(order => renderOrderCard(order))}
                    {getFilteredOrders('cancelled').length === 0 && (
                      <Empty description="No cancelled orders" />
                    )}
                  </div>
                )
              }
            ]}
          />
        </Card>
      ) : (
        <Empty
          description="You haven't placed any orders yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </Empty>
      )}

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

export default OrdersPage;
