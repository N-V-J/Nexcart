import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  Switch,
  Upload,
  message,
  Popconfirm,
  Tag,
  Image,
  Spin,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getValidImageUrl, handleImageError } from '../../utils/imageUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add Product');
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch products
        const productsResponse = await fetch('http://localhost:8000/api/products/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:8000/api/categories/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setProducts(productsData.results);
        setCategories(categoriesData.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle add/edit product
  const showAddModal = () => {
    setModalTitle('Add Product');
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const showEditModal = (product) => {
    setModalTitle('Edit Product');
    setEditingProduct(product);

    // Set form values
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
      category: product.category.id,
      inventory: product.inventory,
      is_active: product.is_active,
    });

    // Set file list if there's an image
    if (product.primary_image) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: product.primary_image,
        },
      ]);
    } else {
      setFileList([]);
    }

    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price);
      if (values.discount_price) {
        formData.append('discount_price', values.discount_price);
      }
      formData.append('category', values.category);
      formData.append('inventory', values.inventory);
      formData.append('is_active', values.is_active);

      // Add image if available
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      let url = `${apiUrl}/products/`;
      let method = 'POST';

      if (editingProduct) {
        url = `${apiUrl}/products/${editingProduct.id}/`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      message.success(`Product ${editingProduct ? 'updated' : 'added'} successfully`);
      setModalVisible(false);

      // Refresh product list
      const productsResponse = await fetch(`${apiUrl}/products/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.results);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      message.error(error.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete product
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      message.success('Product deleted successfully');

      // Remove product from state
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error(error.message || 'Failed to delete product');
    }
  };

  // Handle file upload
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Filter products by search text
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table columns
  const columns = [
    {
      title: 'Image',
      dataIndex: 'primary_image',
      key: 'image',
      render: (image, record) => (
        <Image
          src={getValidImageUrl(image, record.name, 50, 50)}
          alt={record.name}
          width={50}
          height={50}
          style={{ objectFit: 'cover' }}
          onError={(e) => handleImageError(e, record.name, 50, 50)}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <>
          {record.discount_price ? (
            <>
              <Text delete>₹{parseFloat(price).toFixed(2)}</Text>
              <br />
              <Text strong>₹{parseFloat(record.discount_price).toFixed(2)}</Text>
            </>
          ) : (
            <Text>₹{parseFloat(price).toFixed(2)}</Text>
          )}
        </>
      ),
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      filters: categories.map(category => ({ text: category.name, value: category.name })),
      onFilter: (value, record) => record.category.name === value,
    },
    {
      title: 'Inventory',
      dataIndex: 'inventory',
      key: 'inventory',
      sorter: (a, b) => a.inventory - b.inventory,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
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
            size="small"
            onClick={() => showEditModal(record)}
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={`Failed to load products: ${error}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Products</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          Add Product
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search products"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts.map(product => ({ ...product, key: product.id }))}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploading}
            onClick={handleSubmit}
          >
            Save
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter product description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select>
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
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="discount_price"
            label="Discount Price (Optional)"
          >
            <InputNumber
              min={0}
              step={0.01}
              formatter={value => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="inventory"
            label="Inventory"
            rules={[{ required: true, message: 'Please enter inventory count' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
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
          >
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
