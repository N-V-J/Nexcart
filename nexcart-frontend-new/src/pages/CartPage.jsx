import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  Table,
  Button,
  InputNumber,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Empty,
  Image,
  Popconfirm,
  message
} from 'antd';
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowRightOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { getValidImageUrl, handleImageError } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';

const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  // Handle quantity change
  const handleQuantityChange = (productId, quantity) => {
    updateQuantity(productId, quantity);
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    message.success('Item removed from cart');
  };

  // Handle clear cart
  const handleClearCart = () => {
    clearCart();
    message.success('Cart cleared');
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Table columns
  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <Image
            src={getValidImageUrl(record.image_url || record.image || record.primary_image, text, 80, 80)}
            alt={text}
            width={80}
            height={80}
            style={{ objectFit: 'cover' }}
            preview={false}
            onError={(e) => handleImageError(e, text, 80, 80)}
          />
          <Link to={`/products/${record.id}`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <Text>
          {record.discount_price ? (
            <>
              <Text delete>₹{parseFloat(price).toFixed(2)}</Text>
              <br />
              <Text strong>₹{parseFloat(record.discount_price).toFixed(2)}</Text>
            </>
          ) : (
            <Text>₹{parseFloat(price).toFixed(2)}</Text>
          )}
        </Text>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.inventory || 10}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => {
        const price = record.discount_price || record.price;
        return <Text strong>₹{(parseFloat(price) * record.quantity).toFixed(2)}</Text>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Remove this item?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Shopping Cart</Title>

      {cartItems.length > 0 ? (
        <>
          <Table
            columns={columns}
            dataSource={cartItems.map(item => ({ ...item, key: item.id }))}
            pagination={false}
            rowKey="id"
          />

          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col xs={24} md={16}>
              <Space>
                <Popconfirm
                  title="Are you sure you want to clear your cart?"
                  onConfirm={handleClearCart}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger>Clear Cart</Button>
                </Popconfirm>
                <Button type="primary" icon={<ShoppingOutlined />}>
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Title level={4}>Order Summary</Title>
                <Divider />
                <Row justify="space-between" style={{ marginBottom: '10px' }}>
                  <Col>
                    <Text>Subtotal:</Text>
                  </Col>
                  <Col>
                    <Text strong>₹{cartTotal.toFixed(2)}</Text>
                  </Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '10px' }}>
                  <Col>
                    <Text>Shipping:</Text>
                  </Col>
                  <Col>
                    <Text>Free</Text>
                  </Col>
                </Row>
                <Divider />
                <Row justify="space-between" style={{ marginBottom: '20px' }}>
                  <Col>
                    <Text strong>Total:</Text>
                  </Col>
                  <Col>
                    <Text strong style={{ fontSize: '18px' }}>₹{cartTotal.toFixed(2)}</Text>
                  </Col>
                </Row>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ArrowRightOutlined />}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Empty
          description="Your cart is empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </Empty>
      )}
    </div>
  );
};

export default CartPage;
