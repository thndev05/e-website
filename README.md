# E-Commerce Website

A full-featured e-commerce website built with Node.js, Express, and MongoDB, providing both admin and client interfaces for online shopping management.

## Features

### Admin Features
- Comprehensive Dashboard
- Product Management (CRUD operations)
- Category Management
- Order Management
- User Management
- Role-based Access Control
- Coupon Management
- Sales Analytics

### Client Features
- User Authentication (Login/Register)
- Product Browsing and Search
- Shopping Cart
- Wishlist Management
- Secure Checkout Process
- Order Tracking
- Profile Management
- Contact Support

### Payment Features
- TPBank Integration
- QR Code Payment
- Transaction History
- Automatic Payment Verification

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **View Engine:** Handlebars (hbs)
- **Frontend:** HTML, CSS, JavaScript, jQuery
- **UI Framework:** Bootstrap
- **Text Editor:** TinyMCE
- **File Upload:** Cloudinary

## Project Structure

```
├── app.js                 # Application entry point
├── bin/                   # Server startup scripts
├── config/               # Configuration files
├── controllers/          # Route controllers
│   ├── admin/           # Admin controllers
│   └── client/          # Client controllers
├── helpers/             # Helper functions
├── jobs/                # Background jobs
├── middlewares/         # Express middlewares
├── models/              # Database models
├── public/              # Static files
├── routes/              # Route definitions
└── views/               # View templates
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/thndev05/e-website.git
```

2. Install dependencies
```bash
cd e-website
npm install
```

3. Create `.env` file in root directory and add:
```
MONGODB_URI=your_mongodb_uri
BANK_USERNAME=your_bank_username
PASSWORD=your_bank_password
DEVICE_ID=your_device_id
ACCOUNT_ID=your_account_id
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the server
```bash
npm start
```

## Available Scripts

- `npm start`: Starts the server
- `npm run dev`: Starts the server in development mode
- `npm test`: Run tests

## API Routes

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/coupons` - Coupon management

### Client Routes
- `/` - Home page
- `/shop` - Product listing
- `/cart` - Shopping cart
- `/wishlist` - User wishlist
- `/checkout` - Checkout process
- `/profile` - User profile
- `/contact` - Contact page

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
