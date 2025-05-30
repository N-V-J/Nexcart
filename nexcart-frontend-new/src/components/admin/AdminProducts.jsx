import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Popconfirm,
  Typography,
  Switch,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { handleImageError } from '../../utils/imageUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add Product');
  const [form] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  // Function to fetch products
  const fetchProducts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      console.log('Fetching products with token:', token ? 'Token exists' : 'No token');
      console.log('Fetching page:', page, 'with pageSize:', pageSize);

      // Build URL with pagination parameters
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const url = new URL(`${apiUrl}/admin/products/`);
      url.searchParams.append('page', page);
      url.searchParams.append('page_size', pageSize);

      // Simple fetch with proper headers and cache control
      const productsResponse = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Products fetch status:', productsResponse.status);

      if (!productsResponse.ok) {
        const errorText = await productsResponse.text();
        console.error('Error response text:', errorText);
        throw new Error(`Failed to fetch products: ${productsResponse.status} ${errorText}`);
      }

      // Get the raw response text for debugging
      const responseText = await productsResponse.text();
      console.log('Raw response text:', responseText);

      // Parse the JSON response
      let productsData;
      try {
        productsData = JSON.parse(responseText);
        console.log('Parsed products data:', productsData);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        message.error('Failed to parse product data');
        return false;
      }

      // Determine the format and extract products
      let productsList = [];
      let totalCount = 0;

      if (Array.isArray(productsData)) {
        console.log('Products data is an array with length:', productsData.length);
        productsList = productsData;
        totalCount = productsData.length;
      } else if (productsData.results && Array.isArray(productsData.results)) {
        console.log('Products data has results array with length:', productsData.results.length);
        productsList = productsData.results;
        totalCount = productsData.count || productsList.length;
      } else {
        console.error('Unexpected product data format:', productsData);
        message.warning('Received unexpected data format for products.');
        return false;
      }

      // Update state with the new products
      console.log('Setting products state with:', productsList.length, 'products');
      setProducts([...productsList]); // Create a new array to ensure state update

      // Update pagination information
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: pageSize,
        total: totalCount
      }));

      return true;
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error(`Failed to load products: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh products
  const handleRefresh = async () => {
    message.loading('Refreshing products...', 1);
    try {
      const success = await fetchProducts(pagination.current, pagination.pageSize);
      if (success) {
        message.success(`Refreshed ${products.length} products`);
      } else {
        message.error('Failed to refresh products');
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      message.error(`Failed to refresh product list: ${error.message}`);
    }
  };

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Starting data fetch in useEffect');

        // Fetch token first to ensure we have it
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No access token found in localStorage');
          message.error('Authentication error: Please log in again');
          setLoading(false);
          return;
        }

        // Fetch categories
        console.log('Fetching categories...');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const categoriesResponse = await fetch(`${apiUrl}/categories/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }

        const categoriesData = await categoriesResponse.json();
        console.log('Categories data:', categoriesData);

        // Set categories state
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else if (categoriesData.results && Array.isArray(categoriesData.results)) {
          setCategories(categoriesData.results);
        } else {
          console.error('Unexpected categories data format:', categoriesData);
          setCategories([]);
        }

        // Fetch products with pagination
        console.log('Fetching products with pagination...');
        const success = await fetchProducts(pagination.current, pagination.pageSize);

        if (!success) {
          console.error('Failed to load products in useEffect');
          message.error('Failed to load products. Please try refreshing.');
        }
      } catch (error) {
        console.error('Error in useEffect data fetching:', error);
        message.error(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle add/edit product
  const showModal = (product = null) => {
    setEditingProduct(product);
    setModalTitle(product ? 'Edit Product' : 'Add Product');

    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        category_id: product.category ? product.category.id : null,
        inventory: product.inventory,
        is_active: product.is_active
      });

      // Determine the image URL to display
      let imageUrl = null;

      // Try different image sources in order of preference
      if (product.image_url) {
        imageUrl = product.image_url;
      } else if (product.primary_image) {
        imageUrl = product.primary_image;
      } else if (product.image && typeof product.image === 'string') {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
        imageUrl = product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`;
      }

      console.log('Product image URL for edit:', imageUrl);

      if (imageUrl) {
        // Create a file list with the existing image
        setFileList([{
          uid: '-1',
          name: `product-${product.id}-image.jpg`,
          status: 'done',
          url: imageUrl,
        }]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }

    setModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setUploading(true);
      const token = localStorage.getItem('access_token');

      // First, create/update the product without the image
      const productData = {
        name: values.name,
        slug: values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: values.description,
        price: values.price,
        category_id: values.category_id,
        inventory: values.inventory,
        is_active: values.is_active
      };

      if (values.discount_price) {
        productData.discount_price = values.discount_price;
      }

      console.log('Product data:', productData);

      // Use admin API endpoints
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      let url = `${apiUrl}/admin/products/`;
      let method = 'POST';

      if (editingProduct) {
        url = `${apiUrl}/admin/products/${editingProduct.id}/`;
        method = 'PUT';
      }

      // Log the request details for debugging
      console.log('Submitting product with data:', productData);

      // Step 1: Create/update the product
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        // Try to get more detailed error information
        const errorText = await response.text();
        console.error('Server response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          const errorMessage = Object.entries(errorJson)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          throw new Error(`Failed to save product: ${errorMessage}`);
        } catch (e) {
          // If we can't parse the error as JSON, just use the text
          throw new Error(`Failed to save product: ${errorText}`);
        }
      }

      // Get the product data from the response
      const productResponse = await response.json();
      console.log('Product saved successfully:', productResponse);

      // Add the new product to the products state immediately
      if (!editingProduct) {
        console.log('Adding new product to state:', productResponse);
        setProducts(prevProducts => [...prevProducts, productResponse]);
      } else {
        // Update existing product in the state
        console.log('Updating existing product in state:', productResponse);
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productResponse.id ? productResponse : product
          )
        );
      }

      // Step 2: Upload the image if there is one
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          console.log('Uploading image for product:', productResponse.id);
          console.log('File to upload:', fileList[0]);
          console.log('File originFileObj:', fileList[0].originFileObj);

          const imageFormData = new FormData();
          const file = fileList[0].originFileObj;

          // Log file details for debugging
          console.log('File name:', file.name);
          console.log('File type:', file.type);
          console.log('File size:', file.size);

          // Append the file with the correct field name 'image'
          imageFormData.append('image', file);

          // Log FormData (note: can't directly log content)
          console.log('FormData created with image');

          // For debugging, log all entries in the FormData
          for (let pair of imageFormData.entries()) {
            console.log(pair[0], pair[1]);
          }

          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const imageUrl = `${apiUrl}/admin/products/${productResponse.id}/upload_image/`;
          console.log('Sending image to:', imageUrl);

          const imageResponse = await fetch(imageUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
              // Do NOT set Content-Type for FormData - browser will set it with boundary
            },
            body: imageFormData
          });

          console.log('Image upload response status:', imageResponse.status);

          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error('Image upload error response:', errorText);
            try {
              const errorJson = JSON.parse(errorText);
              console.error('Parsed error:', errorJson);
              message.warning(`Image upload failed: ${JSON.stringify(errorJson)}`);
            } catch (e) {
              console.error('Error parsing error response:', e);
              message.warning(`Image upload failed: ${errorText}`);
            }
          } else {
            // Get the raw response text for debugging
            const responseText = await imageResponse.text();
            console.log('Raw image upload response:', responseText);

            let imageData;
            try {
              imageData = JSON.parse(responseText);
              console.log('Image uploaded successfully:', imageData);

              message.success('Product image uploaded successfully');

              // If the server returned the updated product, update it in the products list
              if (imageData.product) {
                console.log('Updating product in list with image data:', imageData.product);

                // Update the product in the list with the new data including the image
                setProducts(prevProducts => {
                  return prevProducts.map(product => {
                    if (product.id === imageData.product.id) {
                      const updatedProduct = {
                        ...product,
                        ...imageData.product,
                        image: imageData.image_url,
                        image_url: imageData.image_url,
                        primary_image: imageData.image_url
                      };
                      console.log('Updated product with image:', updatedProduct);
                      return updatedProduct;
                    }
                    return product;
                  });
                });
              } else if (imageData.image_url) {
                // If we only got an image URL but no product data, still update the product
                console.log('Updating product with image URL:', imageData.image_url);
                setProducts(prevProducts => {
                  return prevProducts.map(product => {
                    if (product.id === productResponse.id) {
                      const updatedProduct = {
                        ...product,
                        image: imageData.image_url,
                        image_url: imageData.image_url,
                        primary_image: imageData.image_url
                      };
                      console.log('Updated product with image URL only:', updatedProduct);
                      return updatedProduct;
                    }
                    return product;
                  });
                });
              }
            } catch (parseError) {
              console.error('Error parsing image upload response:', parseError);
              message.warning('Image uploaded but could not parse response');
            }
          }
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          message.warning('Product saved but image upload failed. Please try again.');
        }
      } else {
        console.log('No image to upload');
      }

      message.success(`Product ${editingProduct ? 'updated' : 'added'} successfully`);
      setModalVisible(false);

      // Wait a bit before refreshing to allow the server to process the request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh product list
      try {
        console.log('Refreshing product list...');

        // Force a complete refresh from the server with pagination
        const token = localStorage.getItem('access_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const url = new URL(`${apiUrl}/admin/products/`);
        url.searchParams.append('page', pagination.current);
        url.searchParams.append('page_size', pagination.pageSize);

        const refreshResponse = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh product list');
        }

        const refreshText = await refreshResponse.text();
        console.log('Refreshed product data (raw):', refreshText);

        try {
          const refreshData = JSON.parse(refreshText);
          console.log('Refreshed product data (parsed):', refreshData);

          // Update the products state with the new data
          if (Array.isArray(refreshData)) {
            console.log('Setting products from refresh array:', refreshData.length);
            // Create a new array to force re-render
            setProducts([...refreshData]);
            // Update pagination total
            setPagination(prev => ({
              ...prev,
              total: refreshData.length
            }));
            console.log('Products state updated with array data');
          } else if (refreshData.results && Array.isArray(refreshData.results)) {
            console.log('Setting products from refresh results:', refreshData.results.length);
            // Create a new array to force re-render
            setProducts([...refreshData.results]);
            // Update pagination total
            setPagination(prev => ({
              ...prev,
              total: refreshData.count || refreshData.results.length
            }));
            console.log('Products state updated with results data');
          } else {
            console.error('Unexpected product data format:', refreshData);
            message.warning('Product saved but received unexpected data format. Please use the refresh button.');

            // Even if the format is unexpected, check if our new product is in the current state
            const productExists = products.some(p => p.id === productResponse.id);
            if (!productExists) {
              console.log('Adding new product to state as fallback:', productResponse);
              setProducts(prevProducts => [...prevProducts, productResponse]);
            }
          }
        } catch (parseError) {
          console.error('Error parsing refresh data:', parseError);
          message.warning('Error parsing product data. Please use the refresh button.');

          // As a fallback, make sure our new product is in the state
          const productExists = products.some(p => p.id === productResponse.id);
          if (!productExists) {
            console.log('Adding new product to state as fallback after parse error:', productResponse);
            setProducts(prevProducts => [...prevProducts, productResponse]);
          }
        }
      } catch (refreshError) {
        console.error('Error during product list refresh:', refreshError);
        message.warning('Product saved but could not refresh the list. Please use the refresh button.');

        // As a fallback, make sure our new product is in the state
        const productExists = products.some(p => p.id === productResponse.id);
        if (!productExists) {
          console.log('Adding new product to state as fallback after refresh error:', productResponse);
          setProducts(prevProducts => [...prevProducts, productResponse]);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  // Handle table changes (pagination, sorting, filtering)
  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Table change:', pagination, filters, sorter);
    fetchProducts(pagination.current, pagination.pageSize);
  };

  // Handle delete product
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('access_token');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/admin/products/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      message.success('Product deleted successfully');

      // Wait a bit before refreshing to allow the server to process the request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh product list
      try {
        console.log('Refreshing product list after delete...');
        const refreshSuccess = await fetchProducts();

        if (!refreshSuccess) {
          // Fallback to filtering the deleted product from the current list
          setProducts(products.filter(product => product.id !== id));
          message.warning('Product deleted but could not refresh the list. Some data may be stale.');
        }
      } catch (refreshError) {
        console.error('Error during product list refresh after delete:', refreshError);
        // Fallback to filtering the deleted product from the current list
        setProducts(products.filter(product => product.id !== id));
        message.warning('Product deleted but could not refresh the list. Some data may be stale.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  // Upload props
  const uploadProps = {
    onRemove: file => {
      console.log('Removing file:', file);
      setFileList([]);
    },
    beforeUpload: file => {
      console.log('Before upload file:', file);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      console.log('File name:', file.name);

      // Only accept images
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }

      // Limit file size to 5MB
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }

      // Create a new file list with this file
      const newFile = {
        uid: file.uid || `-${Date.now()}`,
        name: file.name,
        status: 'done',
        originFileObj: file,
        type: file.type,
        size: file.size,
      };

      console.log('Setting file list with new file:', newFile);
      setFileList([newFile]);

      // Return false to prevent default upload behavior
      return false;
    },
    fileList,
    accept: 'image/*', // Only accept image files
    multiple: false,   // Only allow one file
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (_, record) => {
        console.log(`Rendering image for product ${record.id} - ${record.name}:`, record);

        // Get image URL with proper domain
        let imageUrl = null;

        // Try different image sources
        if (record.image_url) {
          // If image_url is already absolute, use it
          if (record.image_url.startsWith('http')) {
            imageUrl = record.image_url;
          } else {
            // Otherwise, prepend the backend URL
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
            imageUrl = `${baseUrl}${record.image_url}`;
          }
        } else if (record.image) {
          // If we have image but not image_url, construct the URL
          if (typeof record.image === 'string') {
            if (record.image.startsWith('http')) {
              imageUrl = record.image;
            } else {
              const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
              imageUrl = `${baseUrl}${record.image}`;
            }
          } else {
            // If image is an object, try to get the URL
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
            imageUrl = `${baseUrl}/media/products/${record.image.name || 'unknown.jpg'}`;
          }
        } else if (record.primary_image) {
          // Support for primary_image field
          imageUrl = record.primary_image;
        } else if (record.images && record.images.length > 0) {
          // Legacy support for images array
          imageUrl = record.images[0].image;
        }

        console.log('Final image URL:', imageUrl);

        // If we still don't have an image URL, use a placeholder
        if (!imageUrl) {
          const placeholderUrl = `https://placehold.co/100x100/lightgray/darkgray?text=${encodeURIComponent(record.name.charAt(0))}`;
          console.log('Using placeholder image:', placeholderUrl);
          imageUrl = placeholderUrl;
        }

        return (
          <img
            src={imageUrl}
            alt={record.name}
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
              console.error(`Error loading image for ${record.name}:`, e);
              // Use our handleImageError function
              handleImageError(e, record.name, 50, 50);
            }}
          />
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      filters: categories.map(category => ({ text: category.name, value: category.name })),
      onFilter: (value, record) => record.category && record.category.name === value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `₹${parseFloat(text).toFixed(2)}`,
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    },
    {
      title: 'Discount',
      dataIndex: 'discount_price',
      key: 'discount_price',
      render: (text) => text ? `₹${parseFloat(text).toFixed(2)}` : '-',
    },
    {
      title: 'Inventory',
      dataIndex: 'inventory',
      key: 'inventory',
      sorter: (a, b) => a.inventory - b.inventory,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => <Switch checked={active} disabled />,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Products</Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Product
          </Button>
        </Space>
      </div>

      {/* Show product count */}
      <div style={{ marginBottom: 16 }}>
        <Text>
          {products.length > 0
            ? `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`
            : 'No products found'}
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        pagination={pagination}
        onChange={handleTableChange}
        locale={{
          emptyText: (
            <div style={{ padding: '20px 0' }}>
              <p>No products found</p>
              <Button
                type="primary"
                onClick={handleRefresh}
                icon={<ReloadOutlined />}
              >
                Refresh Products
              </Button>
            </div>
          )
        }}
        loading={loading}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter product description' }]}
          >
            <TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select a category">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter product price' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item
            name="discount_price"
            label="Discount Price (Optional)"
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={value => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              placeholder="Enter discount price"
            />
          </Form.Item>

          <Form.Item
            name="inventory"
            label="Inventory"
            rules={[{ required: true, message: 'Please enter inventory count' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter inventory count" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Product Image"
            name="product_image"
            valuePropName="fileList"
            getValueFromEvent={e => {
              console.log('Upload event:', e);
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload
              {...uploadProps}
              listType="picture"
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Please upload an image file (JPG, PNG, etc.) less than 5MB.
              </Text>
              {fileList.length > 0 && fileList[0].originFileObj && (
                <div style={{ marginTop: 8 }}>
                  <Text type="success">
                    Image selected: {fileList[0].name || fileList[0].originFileObj.name}
                  </Text>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button style={{ marginRight: 8 }} onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                {editingProduct ? 'Update' : 'Add'} Product
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
