## 📸 Screenrecord

https://github.com/user-attachments/assets/41b2e8c6-38c7-42cd-99ca-602eabe4ba6c

# NexCart E-Commerce Platform

NexCart is a full-featured e-commerce platform built with modern web technologies. It provides a seamless shopping experience with features like product browsing, cart management, secure checkout, user authentication, and an admin dashboard for store management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Admin Dashboard](#admin-dashboard)
- [Security Features](#security-features)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Customer Features
- User registration and authentication
- Product browsing with search and filtering
- Product categories
- Product details with images
- Shopping cart functionality
- Secure checkout process
- Order history and tracking
- User profile management
- Secure password change with strong password requirements
- Address management
- Avatar upload and management

### Admin Features
- Comprehensive admin dashboard
- Product management (add, edit, delete)
- Category management
- Order management
- User management
- Sales analytics
- Inventory management

## 🛠️ Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Build tool and development server
- **Ant Design**: UI component library
- **React Router**: For navigation and routing
- **Context API**: For state management
- **Axios**: For API requests

### Backend
- **Django**: Web framework
- **Django REST Framework**: For building RESTful APIs
- **PostgreSQL**: Database
- **JWT Authentication**: For secure user authentication
- **Stripe**: For payment processing

## 📁 Project Structure

The project is divided into two main parts:

### Frontend (`nexcart-frontend-new`)
```
nexcart-frontend-new/
├── public/            # Static files
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── context/       # React context for state management
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Entry point
└── package.json       # Dependencies and scripts
```

### Backend (`nexcart_backend`)
```
nexcart_backend/
├── api/               # API endpoints and views
├── nexcart_backend/   # Project settings
├── orders/           # Order management
├── payments/         # Payment processing
├── products/         # Product management
├── users/            # User management
└── manage.py         # Django management script
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm or yarn
- Python (v3.8 or later)
- pip
- PostgreSQL

## 🚀 Installation

### Clone the repository
```bash
git clone https://github.com/yourusername/nexcart.git
cd nexcart
```

### Backend Setup
1. Create a virtual environment:
```bash
cd nexcart_backend
python -m venv venv
```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up the database:
```bash
# Create a PostgreSQL database
createdb nexcart_db

# Configure database in settings.py
# Update the DATABASES setting with your PostgreSQL credentials
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'nexcart_db',
#         'USER': 'postgres',
#         'PASSWORD': '1872',
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser
```

### Frontend Setup
1. Install dependencies:
```bash
cd ../nexcart-frontend-new
npm install
# or
yarn install
```

## 🏃‍♂️ Running the Application

### Backend
```bash
cd nexcart_backend
python manage.py runserver
```
The backend server will run at http://localhost:8000

### Frontend
```bash
cd nexcart-frontend-new
npm run dev
# or
yarn dev
```
The frontend development server will run at http://localhost:5173

## 📚 API Documentation

The API documentation is available at http://localhost:8000/api/ when the backend server is running.

### Main API Endpoints

- **Authentication**:
  - `POST /api/token/`: Get JWT token
  - `POST /api/token/refresh/`: Refresh JWT token

- **Users**:
  - `GET /api/users/me/`: Get current user
  - `POST /api/users/`: Register new user
  - `PATCH /api/users/{id}/`: Update user
  - `POST /api/users/{id}/change_password/`: Change password
  - `POST /api/users/{id}/upload_avatar/`: Upload avatar

- **Products**:
  - `GET /api/products/`: List products
  - `GET /api/products/{id}/`: Get product details
  - `GET /api/categories/`: List categories

- **Cart**:
  - `GET /api/cart/my_cart/`: Get user's cart
  - `POST /api/cart/add_item/`: Add item to cart
  - `DELETE /api/cart/remove_item/{id}/`: Remove item from cart

- **Orders**:
  - `GET /api/orders/`: List user's orders
  - `POST /api/orders/`: Create order
  - `GET /api/orders/{id}/`: Get order details

- **Admin**:
  - `GET /api/admin/dashboard_stats/`: Get admin dashboard stats
  - `GET /api/admin/products/`: Manage products
  - `GET /api/admin/categories/`: Manage categories
  - `GET /api/admin/orders/`: Manage orders
  - `GET /api/admin/users/`: Manage users

## 👨‍💼 Admin Dashboard

The admin dashboard is accessible at http://localhost:5173/admin after logging in with admin credentials.

### Admin Features
- Dashboard with key metrics
- Product management
- Category management
- Order management
- User management

## 🔒 Security Features

NexCart implements several security features to protect user data and ensure secure transactions:

### Authentication & Authorization
- JWT (JSON Web Token) based authentication
- Token refresh mechanism
- Role-based access control (admin vs regular users)
- Secure password storage with hashing

### Password Security
- Strong password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Secure password change workflow
- Password confirmation for sensitive operations

### Data Protection
- HTTPS support for encrypted data transmission
- CSRF protection
- Input validation and sanitization

### API Security
- Rate limiting to prevent abuse
- Proper error handling without exposing sensitive information
- Secure HTTP headers

