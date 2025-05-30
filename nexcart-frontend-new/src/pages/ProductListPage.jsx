import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Input, Select, Spin, Empty, message } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config/api';

const { Title, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;
const { Search } = Input;

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

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [totalProductCount, setTotalProductCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get('search');
    const category = queryParams.get('category');
    const sort = queryParams.get('sort');

    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
    if (sort) setSortBy(sort);
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        console.log('Categories API response:', data);
        console.log('Categories API URL used:', `${API_URL}/categories/`);

        // Check if data is an array or has a results property
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results);
        } else {
          // If neither, set an empty array
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Function to fetch all pages of products
  const fetchAllProducts = async (baseUrl, headers) => {
    let allProducts = [];
    let nextPageUrl = baseUrl;
    let totalCount = 0;

    while (nextPageUrl) {
      console.log('Fetching products from:', nextPageUrl);
      const response = await fetch(nextPageUrl, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Page response:', data);

      if (Array.isArray(data)) {
        // If the response is an array, we have all products
        allProducts = data;
        totalCount = data.length;
        nextPageUrl = null; // No more pages
      } else if (data.results && Array.isArray(data.results)) {
        // If the response has results array, it's paginated
        allProducts = [...allProducts, ...data.results];
        totalCount = data.count || 0;

        // Check if there's a next page
        nextPageUrl = data.next;
        console.log('Next page URL:', nextPageUrl);
      } else {
        console.error('Unexpected data format:', data);
        nextPageUrl = null;
      }
    }

    console.log(`Fetched a total of ${allProducts.length} products`);
    return { products: allProducts, totalCount };
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        let baseUrl = `${apiUrl}/products/?`;

        // Add page_size parameter to get all products (set to a very large number)
        baseUrl += `page_size=100&`;

        // Also add a parameter to disable pagination if the backend supports it
        baseUrl += `no_pagination=true&`;

        // Add a timestamp to prevent caching
        baseUrl += `_=${new Date().getTime()}&`;

        // Add search parameter
        if (searchTerm) {
          baseUrl += `search=${encodeURIComponent(searchTerm)}&`;
        }

        // Add category filter
        if (selectedCategory) {
          baseUrl += `category=${selectedCategory}&`;
          console.log('Filtering by category ID:', selectedCategory);
        }

        // Add sorting
        if (sortBy) {
          baseUrl += `ordering=${sortBy}`;
        }

        // Add request headers to ensure we get proper URLs
        const headers = {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };

        // Fetch all products (handling pagination if necessary)
        console.log('Final products API URL:', baseUrl);
        const { products: allProducts, totalCount } = await fetchAllProducts(baseUrl, headers);

        console.log('All products fetched:', allProducts.length);
        console.log('Total count:', totalCount);

        // Set the total product count
        setTotalProductCount(totalCount || allProducts.length);

        // Use the fetched products as our product data
        let productsData = allProducts;

        // Log a sample product to see its structure
        if (productsData.length > 0) {
          const sampleProduct = productsData[0];
          console.log('Sample product data:', sampleProduct);

          // Log all properties to find where the image might be stored
          console.log('All product properties:');
          Object.keys(sampleProduct).forEach(key => {
            console.log(`${key}:`, sampleProduct[key]);
          });

          // For each product, fetch its detailed information to get images
          const productsWithImages = await Promise.all(
            productsData.map(async (product) => {
              // If product has no image_url, try to fetch detailed product info
              if (!product.image_url) {
                try {
                  // Fetch product details to get image
                  const detailResponse = await fetch(`${API_URL}/products/${product.id}/`, { headers });
                  if (detailResponse.ok) {
                    const detailData = await detailResponse.json();
                    console.log(`Detail data for product ${product.id}:`, detailData);

                    // Check if the product has image_url
                    if (detailData.image_url) {
                      // Use the image URL
                      product.image_url = detailData.image_url;
                    } else {
                      // If no image, use a placeholder
                      const categoryName = product.category_name || 'Product';
                      const categoryColor = getCategoryColor(categoryName);
                      product.image_url = `https://placehold.co/600x400/${categoryColor}/FFFFFF?text=${encodeURIComponent(categoryName)}`;
                    }
                  }
                } catch (err) {
                  console.error(`Error fetching details for product ${product.id}:`, err);
                  // Use placeholder if error occurs
                  const categoryName = product.category_name || 'Product';
                  const categoryColor = getCategoryColor(categoryName);
                  product.image_url = `https://placehold.co/600x400/${categoryColor}/FFFFFF?text=${encodeURIComponent(categoryName)}`;
                }
              }

              // For backward compatibility, set primary_image to image_url
              if (product.image_url && !product.primary_image) {
                product.primary_image = product.image_url;
              }
              return product;
            })
          );

          setProducts(productsWithImages);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        message.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    updateQueryParams({ search: value });
  };

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    updateQueryParams({ category: value });
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    updateQueryParams({ sort: value });
  };

  // Update query parameters
  const updateQueryParams = (params) => {
    const queryParams = new URLSearchParams(location.search);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      } else {
        queryParams.delete(key);
      }
    });

    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    });
  };

  // Get cart functions from context
  const { addToCart: addToCartContext } = useCart();

  // Add to cart
  const addToCart = (product) => {
    addToCartContext(product);
    message.success(`${product.name} added to cart!`);
  };

  // Refresh products
  const handleRefresh = () => {
    message.loading('Refreshing products...', 1);
    // Re-run the effect by changing a dependency
    setSortBy(prev => {
      // Toggle between name and -name to force a refresh
      return prev === 'name' ? '-name' : 'name';
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Products</Title>

      {/* Filters and Search */}
      <div style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select Category"
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={handleCategoryChange}
              allowClear
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Sort By"
              style={{ width: '100%' }}
              value={sortBy}
              onChange={handleSortChange}
            >
              <Option value="name">Name (A-Z)</Option>
              <Option value="-name">Name (Z-A)</Option>
              <Option value="price">Price (Low to High)</Option>
              <Option value="-price">Price (High to Low)</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Product Count */}
      {!loading && products.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <Text>
            {products.length === totalProductCount
              ? `Showing all ${totalProductCount} products`
              : `Showing ${products.length} of ${totalProductCount} products`}
          </Text>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : products.length > 0 ? (
        <Row gutter={[16, 16]}>
          {products.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Card
                hoverable
                className="product-card"
                cover={
                  <img
                    alt={product.name || 'Product Image'}
                    src={
                      // Use image_url which should be an absolute URL from the serializer
                      product.image_url ||
                      // Fallback to primary_image for backward compatibility
                      product.primary_image ||
                      // Fallback to a reliable placeholder image
                      'https://placehold.co/300x200/lightgray/darkgray?text=No+Image'
                    }
                    className="product-image"
                  />
                }
                actions={[
                  <Link to={`/products/${product.id}`} key="view">View Details</Link>,
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    key="add"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                ]}
              >
                <Meta
                  title={product.name || 'Unnamed Product'}
                  description={
                    <>
                      <div>
                        {product.discount_price ? (
                          <>
                            <Text delete>₹{parseFloat(product.price || 0).toFixed(2)}</Text>
                            <Text strong style={{ marginLeft: 8, color: '#f5222d' }}>
                              ₹{parseFloat(product.discount_price || 0).toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <Text strong>₹{parseFloat(product.price || 0).toFixed(2)}</Text>
                        )}
                      </div>
                      <div>
                        <Text type="secondary">
                          {product.category_name || (product.category && product.category.name) || 'Uncategorized'}
                        </Text>
                      </div>
                      {(product.inventory !== undefined && product.inventory <= 0) && (
                        <div>
                          <Text type="danger">Out of Stock</Text>
                        </div>
                      )}
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="No products found" />
      )}
    </div>
  );
};

export default ProductListPage;
