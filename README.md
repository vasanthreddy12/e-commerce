# E-commerce Platform

A full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js).

## System Architecture 
![System Architecture](https://github.com/user-attachments/assets/8285f395-7c77-4fd9-abf2-a1d1bc9a9d2e)

## Autorisation and Authentication Design
![Authorisation and Authentication Design](https://github.com/user-attachments/assets/af6cc9f3-330a-4f08-b9ee-48816a0536f9)

## State Management Flow
![State Management Flow - Redux](https://github.com/user-attachments/assets/4738d212-6810-45c9-9435-09c900b7f224)

## Features

- 🛍️ Product catalog with filtering, search, and sorting
- 🛒 Cart management with real-time updates
- 👤 User authentication and authorization
- 🔐 Role-based access control (Admin/User)
- 💳 Secure payment integration with Razorpay
- 📊 Admin dashboard for product and order management

## Tech Stack

### Frontend
- React
- Redux with Redux Toolkit
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Razorpay Integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Razorpay account for payments
- npm or yarn

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=8080
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd e-commerce
```

2. Install dependencies
```bash
npm run install:all
```

3. Start the development servers
```bash
npm run dev
```

The frontend will run on http://localhost:3000 and the backend on http://localhost:8080

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Page components
│       ├── redux/         # Redux store and slices
│       └── utils/         # Utility functions
│
└── server/                # Backend Node.js application
    ├── controllers/       # Route controllers
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    ├── middleware/       # Custom middleware
    └── config/           # Configuration files
```

## API Documentation

The API documentation will be available at http://localhost:8080/api-docs when running in development mode.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 
