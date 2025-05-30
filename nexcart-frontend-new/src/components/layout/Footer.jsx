import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  return (
    <AntFooter className="footer">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Title level={4}>NexCart</Title>
          <Text>
            Your one-stop shop for all your shopping needs. We provide high-quality products
            at competitive prices.
          </Text>
          <div style={{ marginTop: 16 }}>
            <Space size="large">
              <FacebookOutlined style={{ fontSize: 24 }} />
              <TwitterOutlined style={{ fontSize: 24 }} />
              <InstagramOutlined style={{ fontSize: 24 }} />
              <LinkedinOutlined style={{ fontSize: 24 }} />
            </Space>
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={8}>
          <Title level={4}>Quick Links</Title>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={8}>
          <Title level={4}>Contact Us</Title>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <Space>
                <HomeOutlined />
                <Text>Karingachira, Tipunithura</Text>
              </Space>
            </li>
            <li>
              <Space>
                <PhoneOutlined />
                <Text>+91 7736458150</Text>
              </Space>
            </li>
            <li>
              <Space>
                <MailOutlined />
                <Text>nvj@nexcart.com</Text>
              </Space>
            </li>
          </ul>
        </Col>
      </Row>
      
      <Divider />
      
      <Row>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Text>&copy; {new Date().getFullYear()} NexCart. All rights reserved.</Text>
        </Col>
      </Row>
    </AntFooter>
  );
};

export default Footer;
