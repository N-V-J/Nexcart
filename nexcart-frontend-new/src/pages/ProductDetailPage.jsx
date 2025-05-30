import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  InputNumber,
  Tabs,
  Breadcrumb,
  Image,
  Spin,
  message
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useCart } from '../context/CartContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Helper function to get a color based on category name
const getCategoryColor = (categoryName) => {
  const categoryColors = {
    'Electronics': '2196F3',
    'Clothing': '4CAF50',
    'Home & Kitchen': 'FF9800',
    'Books': '9C27B0',
    'Sports & Outdoors': 'F44336',
    'Phone & Accessories': '009688',
  };

  // Return the color for the category or a default color
  return categoryColors[categoryName] || '607D8B';
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Add request headers to ensure we get proper URLs
        const headers = {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/products/${id}/`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        console.log('Product detail data:', data);

        // Log image-related fields
        console.log('Images array:', data.images);
        console.log('Primary image:', data.primary_image);

        // Make sure we have an image_url
        if (!data.image_url) {
          // If we have an image field but no image_url, construct it
          if (data.image && !data.image.startsWith('http')) {
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
            data.image_url = `${baseUrl}${data.image}`;
          }
          // Add placeholder image if needed
          else {
            const categoryName = data.category ? data.category.name : 'Product';
            const categoryColor = getCategoryColor(categoryName);
            data.image_url = `https://placehold.co/600x400/${categoryColor}/FFFFFF?text=${encodeURIComponent(categoryName)}`;
          }
        }

        // For backward compatibility, set primary_image to image_url
        if (data.image_url && !data.primary_image) {
          data.primary_image = data.image_url;
        }

        setProduct(data);

        // Fetch related products from the same category
        if (data.category && data.category.id) {
          fetchRelatedProducts(data.category.id, data.id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        message.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async (categoryId, productId) => {
      try {
        // Add request headers to ensure we get proper URLs
        const headers = {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/products/?category=${categoryId}`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }
        const data = await response.json();
        // Filter out the current product and limit to 4 related products
        let filtered = (data.results || data)
          .filter(p => p.id !== parseInt(productId))
          .slice(0, 4);

        // For each related product, fetch its detailed information to get images
        const relatedProductsWithImages = await Promise.all(
          filtered.map(async (product) => {
            // If product has no primary_image, try to fetch detailed product info
            if (!product.primary_image) {
              try {
                // Fetch product details to get images
                const detailResponse = await fetch(`${apiUrl}/products/${product.id}/`, { headers });
                if (detailResponse.ok) {
                  const detailData = await detailResponse.json();

                  // Check if the product has image_url
                  if (detailData.image_url) {
                    // Use the image URL
                    product.image_url = detailData.image_url;
                    // For backward compatibility
                    product.primary_image = detailData.image_url;
                  } else {
                    // If no image, use a placeholder
                    const categoryName = product.category_name || 'Product';
                    const categoryColor = getCategoryColor(categoryName);
                    product.image_url = `https://placehold.co/600x400/${categoryColor}/FFFFFF?text=${encodeURIComponent(categoryName)}`;
                    product.primary_image = product.image_url;
                  }
                }
              } catch (err) {
                console.error(`Error fetching details for related product ${product.id}:`, err);
                // Use placeholder if error occurs
                const categoryName = product.category_name || 'Product';
                const categoryColor = getCategoryColor(categoryName);
                product.image_url = `https://placehold.co/600x400/${categoryColor}/FFFFFF?text=${encodeURIComponent(categoryName)}`;
                product.primary_image = product.image_url;
              }
            }
            return product;
          })
        );

        setRelatedProducts(relatedProductsWithImages);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  // Get cart functions from context
  const { addToCart: addToCartContext } = useCart();

  const addToCart = () => {
    if (product) {
      addToCartContext(product, quantity);
      message.success(`${quantity} ${product.name}(s) added to cart!`);
    }
  };





  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Product not found</Title>
        <Button type="primary" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">Products</Link>
        </Breadcrumb.Item>
        {product.category && (
          <Breadcrumb.Item>
            <Link to={`/products?category=${product.category.id}`}>
              {product.category.name}
            </Link>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Product Details */}
      <Row gutter={[32, 32]}>
        {/* Product Images */}
        <Col xs={24} md={12}>
          <Card>
            <Image
              src={
                product.image_url ||
                product.primary_image ||
                "https://placehold.co/500x500/lightgray/darkgray?text=No+Image"
              }
              alt={product.name}
              style={{ width: '100%', height: 'auto' }}
            />
          </Card>
        </Col>

        {/* Product Info */}
        <Col xs={24} md={12}>
          <Title level={2}>{product.name}</Title>

          {/* Price */}
          <div style={{ margin: '20px 0' }}>
            {product.discount_price ? (
              <>
                <Text delete style={{ fontSize: '18px' }}>
                  ₹{parseFloat(product.price || 0).toFixed(2)}
                </Text>
                <Text strong style={{ fontSize: '24px', marginLeft: 16, color: '#f5222d' }}>
                  ₹{parseFloat(product.discount_price || 0).toFixed(2)}
                </Text>
              </>
            ) : (
              <Text strong style={{ fontSize: '24px' }}>
                ₹{parseFloat(product.price || 0).toFixed(2)}
              </Text>
            )}
          </div>

          {/* Category */}
          <div style={{ margin: '10px 0' }}>
            <Text type="secondary">
              Category: {product.category ? (
                <Link to={`/products?category=${product.category.id}`}>
                  {product.category.name}
                </Link>
              ) : 'Uncategorized'}
            </Text>
          </div>

          {/* Inventory */}
          <div style={{ margin: '10px 0' }}>
            {product.inventory !== undefined && product.inventory > 0 ? (
              <Text type="success">In Stock ({product.inventory} available)</Text>
            ) : (
              <Text type="danger">Out of Stock</Text>
            )}
          </div>

          {/* Short Description */}
          <Paragraph style={{ margin: '20px 0' }}>
            {product.description ? product.description.split('\n')[0] : 'No description available.'}
          </Paragraph>

          {/* Quantity and Add to Cart */}
          <div style={{ margin: '20px 0' }}>
            <Row gutter={16} align="middle">
              <Col>
                <InputNumber
                  min={1}
                  max={product.inventory}
                  defaultValue={1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={product.inventory <= 0}
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  onClick={addToCart}
                  disabled={product.inventory <= 0}
                >
                  Add to Cart
                </Button>
              </Col>

            </Row>
          </div>
        </Col>
      </Row>

      {/* Product Tabs */}
      <div style={{ margin: '40px 0' }}>
        <Tabs defaultActiveKey="description">
          <TabPane tab="Description" key="description">
            <Paragraph style={{ whiteSpace: 'pre-line' }}>
              {product.description || 'No description available.'}
            </Paragraph>
          </TabPane>
          <TabPane tab="Specifications" key="specifications">
            <p>Product specifications would be displayed here.</p>
          </TabPane>
          <TabPane tab="Reviews" key="reviews">
            <p>Product reviews would be displayed here.</p>
          </TabPane>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ margin: '40px 0' }}>
          <Title level={3}>Related Products</Title>
          <Row gutter={[16, 16]}>
            {relatedProducts.map(relatedProduct => (
              <Col xs={24} sm={12} md={6} key={relatedProduct.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={relatedProduct.name}
                      src={
                        relatedProduct.image_url ||
                        relatedProduct.primary_image ||
                        'https://placehold.co/300x200/lightgray/darkgray?text=No+Image'
                      }
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  }
                >
                  <Card.Meta
                    title={relatedProduct.name}
                    description={
                      <Text strong>
                        ₹{parseFloat(relatedProduct.discount_price || relatedProduct.price || 0).toFixed(2)}
                      </Text>
                    }
                  />
                  <div style={{ marginTop: '10px' }}>
                    <Link to={`/products/${relatedProduct.id}`}>
                      <Button type="primary" block>View Details</Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
