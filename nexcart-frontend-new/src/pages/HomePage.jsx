import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Divider,
  Tabs,
  Badge,
  Input,
  Form,
  Spin,
  message,
  Statistic,
  Empty
} from 'antd';
import {
  ShoppingOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  RocketOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  HomeOutlined,
  LaptopOutlined,
  MobileOutlined,
  SkinOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import { handleImageError } from '../utils/imageUtils';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;
const { Search } = Input;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const { addToCart } = useCart();

  // Set a deadline for the flash sale (24 hours from now)
  const deadline = Date.now() + 1000 * 60 * 60 * 24;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/categories/');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();

        // Check if data is an array or has a results property
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products
        const response = await fetch('http://localhost:8000/api/products/?no_pagination=true');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        let allProducts = [];

        if (Array.isArray(data)) {
          allProducts = data;
        } else if (data.results && Array.isArray(data.results)) {
          allProducts = data.results;
        }

        setProducts(allProducts);

        // Filter for featured products (random selection of 8)
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 8));

        // Filter for new arrivals (most recent 8 products)
        const sorted = [...allProducts].sort((a, b) =>
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setNewArrivals(sorted.slice(0, 8));

        // Filter for discounted products
        const discounted = allProducts.filter(product =>
          product.discount_price && parseFloat(product.discount_price) > 0
        ).slice(0, 8);
        setDiscountedProducts(discounted);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        message.error('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle newsletter signup
  const handleNewsletterSignup = () => {
    if (!email || !email.includes('@')) {
      message.error('Please enter a valid email address');
      return;
    }

    message.success('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart(product);
    message.success(`${product.name} added to cart!`);
  };

  // Get category icon based on name
  const getCategoryIcon = (name) => {
    const icons = {
      'Electronics': <LaptopOutlined />,
      'Clothing': <SkinOutlined />,
      'Home & Kitchen': <HomeOutlined />,
      'Phones & Accessories': <MobileOutlined />,
      'Sports & Outdoors': <RocketOutlined />,
      'Books': <ShoppingOutlined />
    };

    return icons[name] || <ShoppingOutlined />;
  };

  // Get category color based on name
  const getCategoryColor = (name) => {
    const colors = {
      'Electronics': '#2196F3',
      'Clothing': '#4CAF50',
      'Home & Kitchen': '#FF9800',
      'Phones & Accessories': '#009688',
      'Sports & Outdoors': '#F44336',
      'Books': '#9C27B0'
    };

    return colors[name] || '#607D8B';
  };

  // Render product card
  const renderProductCard = (product) => (
    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
      <Badge.Ribbon
        text={product.discount_price ? 'SALE' : (product.inventory <= 0 ? 'OUT OF STOCK' : null)}
        color={product.discount_price ? 'red' : 'grey'}
        style={{ display: !product.discount_price && product.inventory > 0 ? 'none' : 'block' }}
      >
        <Card
          hoverable
          className="product-card"
          cover={
            <div style={{ height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                alt={product.name}
                src={product.image_url || product.primary_image || `https://placehold.co/300x200/${getCategoryColor(product.category_name).replace('#', '')}/FFFFFF?text=${product.category_name}`}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                onError={(e) => handleImageError(e, product.name, 300, 200)}
              />
            </div>
          }
          actions={[
            <Link to={`/products/${product.id}`} key="view">View Details</Link>,
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              key="add"
              onClick={() => handleAddToCart(product)}
              disabled={product.inventory <= 0}
            >
              Add to Cart
            </Button>,
          ]}
        >
          <Meta
            title={product.name}
            description={
              <>
                <div>
                  {product.discount_price ? (
                    <>
                      <Text delete>₹{parseFloat(product.price).toFixed(2)}</Text>
                      <Text strong style={{ marginLeft: 8, color: '#f5222d' }}>
                        ₹{parseFloat(product.discount_price).toFixed(2)}
                      </Text>
                    </>
                  ) : (
                    <Text strong>₹{parseFloat(product.price).toFixed(2)}</Text>
                  )}
                </div>
                <div>
                  <Text type="secondary">{product.category_name}</Text>
                </div>
                {product.inventory <= 0 && (
                  <div>
                    <Text type="danger">Out of Stock</Text>
                  </div>
                )}
              </>
            }
          />
        </Card>
      </Badge.Ribbon>
    </Col>
  );

  return (
    <div>
      {/* Hero Section */}
      <Carousel autoplay effect="fade">
        <div>
          <div style={{
            height: '500px',
            background: 'linear-gradient(rgba(127, 178, 230, 0.85), rgba(0, 21, 41, 0.85)), url(/images/LAPTOPS.png) center/cover no-repeat',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 20px', position: 'relative', zIndex: 2 }}>
              <Title style={{ color: '#fff', fontSize: '48px', marginBottom: '24px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Welcome to NexCart</Title>
              <Paragraph style={{ color: '#fff', fontSize: '20px', marginBottom: '32px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                Your one-stop shop for all your shopping needs
              </Paragraph>
              <Button type="primary" size="large" style={{ height: '50px', fontSize: '18px', padding: '0 40px' }}>
                <Link to="/products">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div style={{
            height: '500px',
            background: 'linear-gradient(rgba(250, 118, 125, 0.85), rgba(130, 0, 20, 0.85)), url(/images/IPHONES.jpg) center/cover no-repeat',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 20px', position: 'relative', zIndex: 2 }}>
              <Title style={{ color: '#fff', fontSize: '48px', marginBottom: '24px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Flash Sale</Title>
              <Paragraph style={{ color: '#fff', fontSize: '20px', marginBottom: '32px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                Up to 50% off on selected items. Limited time only!
              </Paragraph>
              <Button type="primary" size="large" style={{ height: '50px', fontSize: '18px', padding: '0 40px', background: '#fff', borderColor: '#fff', color: '#f5222d' }}>
                <Link to="/products" style={{ color: '#f5222d' }}>View Deals</Link>
              </Button>
            </div>
          </div>
        </div>
      </Carousel>

      {/* Categories Section */}
      <div style={{ padding: '60px 20px', background: '#f5f5f5' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          Shop by Category
        </Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : categories.length > 0 ? (
          <Row gutter={[24, 24]} justify="center">
            {categories.map(category => (
              <Col xs={12} sm={8} md={6} lg={4} key={category.id}>
                <Link to={`/products?category=${category.id}`}>
                  <Card
                    hoverable
                    style={{ textAlign: 'center', borderRadius: '8px', overflow: 'hidden' }}
                    cover={
                      <div style={{
                        height: '120px',
                        background: getCategoryColor(category.name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        color: 'white'
                      }}>
                        {getCategoryIcon(category.name)}
                      </div>
                    }
                  >
                    <Card.Meta
                      title={category.name}
                      style={{ textAlign: 'center' }}
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No categories found" />
        )}
      </div>

      {/* Featured Products Section */}
      <div style={{ padding: '60px 20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          Featured Products
        </Title>

        <Tabs
          defaultActiveKey="featured"
          centered
          size="large"
          style={{ marginBottom: '30px' }}
          items={[
            {
              key: 'featured',
              label: 'Featured',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                </div>
              ) : featuredProducts.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {featuredProducts.map(product => renderProductCard(product))}
                </Row>
              ) : (
                <Empty description="No featured products found" />
              )
            },
            {
              key: 'new',
              label: 'New Arrivals',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                </div>
              ) : newArrivals.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {newArrivals.map(product => renderProductCard(product))}
                </Row>
              ) : (
                <Empty description="No new arrivals found" />
              )
            },
            {
              key: 'sale',
              label: 'On Sale',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                </div>
              ) : discountedProducts.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {discountedProducts.map(product => renderProductCard(product))}
                </Row>
              ) : (
                <Empty description="No products on sale" />
              )
            }
          ]}
        />

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Button type="primary" size="large">
            <Link to="/products">View All Products</Link>
          </Button>
        </div>
      </div>

      {/* Flash Sale Section */}
      <div style={{
        padding: '60px 20px',
        background: 'linear-gradient(rgba(248, 113, 113, 0.9), rgba(246, 114, 114, 0.9)), url(/images/IPHONES.jpg) center/cover no-repeat',
        color: 'white',
        position: 'relative'
      }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <FireOutlined style={{ fontSize: '48px', marginBottom: '16px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }} />
            <Title level={2} style={{ color: 'white', marginBottom: '16px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Flash Sale</Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '24px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Hurry up! These deals won't last long.
            </Paragraph>
            <Statistic.Timer
              type="countdown"
              value={deadline}
              format="DD:HH:mm:ss"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            />
          </Col>

          <Col xs={24} md={16}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : discountedProducts.length > 0 ? (
              <Carousel autoplay slidesToShow={discountedProducts.length < 3 ? discountedProducts.length : 3}
                responsive={[
                  {
                    breakpoint: 992,
                    settings: {
                      slidesToShow: discountedProducts.length < 2 ? discountedProducts.length : 2,
                    }
                  },
                  {
                    breakpoint: 576,
                    settings: {
                      slidesToShow: 1,
                    }
                  }
                ]}
                style={{ padding: '0 40px' }}
              >
                {discountedProducts.map(product => (
                  <div key={product.id} style={{ padding: '0 10px' }}>
                    <Card
                      hoverable
                      style={{ background: 'white', borderRadius: '8px' }}
                      cover={
                        <div style={{ height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                          <img
                            alt={product.name}
                            src={product.image_url || product.primary_image || `https://placehold.co/300x200/${getCategoryColor(product.category_name).replace('#', '')}/FFFFFF?text=${product.category_name}`}
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            onError={(e) => handleImageError(e, product.name, 300, 200)}
                          />
                        </div>
                      }
                    >
                      <Meta
                        title={product.name}
                        description={
                          <>
                            <div>
                              <Text delete>₹{parseFloat(product.price).toFixed(2)}</Text>
                              <Text strong style={{ marginLeft: 8, color: '#f5222d' }}>
                                ₹{parseFloat(product.discount_price).toFixed(2)}
                              </Text>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                              <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                onClick={() => handleAddToCart(product)}
                                block
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </>
                        }
                      />
                    </Card>
                  </div>
                ))}
              </Carousel>
            ) : (
              <Empty description="No products on sale" style={{ color: 'black' }} />
            )}
          </Col>
        </Row>
      </div>

      {/* Newsletter Section */}
      <div style={{
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Row justify="center">
          <Col xs={24} md={16} lg={12}>
            <MailOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
              Subscribe to Our Newsletter
            </Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
              Get 10% off your first order and stay updated with our latest offers and promotions.
            </Paragraph>

            <Row gutter={16} justify="center">
              <Col xs={24} sm={16}>
                <Input
                  size="large"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={8} style={{ marginTop: { xs: '10px', sm: '0' } }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNewsletterSignup}
                  style={{ width: '100%' }}
                >
                  Subscribe
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Features Section */}
      <div style={{ padding: '60px 20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          Why Choose Us
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
              <div style={{ padding: '20px 0' }}>
                <ShoppingOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={4}>Wide Selection</Title>
                <Paragraph>
                  Thousands of products to choose from across multiple categories.
                </Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
              <div style={{ padding: '20px 0' }}>
                <SafetyOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4}>Secure Payments</Title>
                <Paragraph>
                  Your transactions are secure with our advanced payment system.
                </Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
              <div style={{ padding: '20px 0' }}>
                <RocketOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
                <Title level={4}>Fast Delivery</Title>
                <Paragraph>
                  Quick and reliable shipping to get your products to you faster.
                </Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
              <div style={{ padding: '20px 0' }}>
                <CustomerServiceOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
                <Title level={4}>24/7 Support</Title>
                <Paragraph>
                  Our customer service team is always ready to assist you.
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HomePage;
