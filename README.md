# Testly: Full-Stack Online Exam Platform

## Project Overview

Testly is a robust, full-stack online examination platform designed to facilitate the creation, management, and execution of exams. Built with Angular on the frontend and Express.js on the backend, it provides administrators with comprehensive tools for exam oversight and offers users a seamless and secure test-taking experience. This project demonstrates proficiency in modern web development practices, state management, RESTful API design, and secure authentication.

## Live Deployment

**FullWebSite (Vercel):** [Link to your Vercel frontend deployment]


## Technologies & Stack

This project leverages a modern MEAN-adjacent stack with a focus on performance, scalability, and developer experience.

**Frontend (Angular 19.x)**

- **Core Framework:** Angular 19.x
- **State Management:** NgRx (Store, Effects, Entity, Router-Store) for predictable state management and side effect handling.
- **Reactive Programming:** RxJS for handling asynchronous operations.
- **UI/UX:** Bootstrap 5.3.6 (responsive design), Font Awesome 6.7.2 (icons), animate.css (animations), ngx-toastr (notifications), ngx-sweetalert2 (interactive alerts).
- **Language:** TypeScript
- **Testing:** Jasmine & Karma

**Backend (Node.js with Express.js)**

- **Framework:** Express.js (v5) for building robust RESTful APIs.
- **Language:** Node.js
- **Database:** MongoDB (v8) with Mongoose (ODM) for flexible data modeling.
- **Authentication & Security:** JWT (jsonwebtoken), bcryptjs (password hashing), helmet (security headers), express-rate-limit (DoS protection), cors (CORS handling).
- **Validation:** Joi for request schema validation.
- **API Documentation:** Swagger UI Express & Swagger JSDoc for interactive API exploration.
- **Logging:** Winston for structured application logging.
- **Email Services:** Nodemailer for sending emails
- **Other:** body-parser, compression, dotenv, ioredis (likely for caching/sessions), nanoid.

## Key Features

- **Secure User Authentication:** Robust registration, login, and password reset flows using JWT.
- **Role-Based Access Control (RBAC):** Differentiates between Admin, Teacher, and Student roles with distinct permissions and dashboards.
- **Comprehensive Exam Management (CRUD):** Admins/Teachers can create, read, update, and delete exams, including adding various question types.
- **Dynamic Exam Interface:** Users can take exams with time limits and real-time feedback.
- **Performance Tracking:** Users can view their results and attempt history.
- **Admin Dashboard:** Centralized management for users, pending teachers, and exam reporting.
- **Contact Message Management:** Admins can view and manage contact form submissions.
- **Responsive Design:** Optimized user interface for various devices.
- **API Documentation:** Interactive Swagger UI available for API endpoints.
- **Centralized State Management:** Utilizes NgRx for predictable application state.

## Architecture & Design Patterns

- **Frontend:** Adopts a component-based architecture with separation of concerns. Implements NgRx for centralized state management, promoting unidirectional data flow. Utilizes Angular Services for business logic and interaction with the backend API via HTTP Interceptors for tasks like token attachment.
- **Backend:** Follows a RESTful API design with well-defined endpoints. Employs Express.js middleware for request processing (authentication, logging, security). Uses Mongoose for interacting with MongoDB, abstracting database operations.

## Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone [Your Repository URL]
    cd Testly
    ```

2.  **Install Dependencies (Frontend & Backend):**

    ```bash
    cd client
    npm install
    cd ../server
    npm install
    ```

3.  **Environment Configuration:**
    - Navigate to the `server` directory.
    - Create a `.env` file based on the provided example or documentation, filling in your database connection string, JWT secret, email credentials, etc.

## Development

To run the full stack application locally:

```bash
# From the root directory (/Testly)
npm run dev
```

This script (likely configured in your root `package.json` or using a tool like `concurrently`) will start both the Angular frontend (usually on `http://localhost:4200`) and the Express backend server (usually on `http://localhost:8000`).

## Building for Production

To build the Angular frontend for production deployment:

```bash
cd client
npm run build:prod
```

This will generate optimized static assets in the `dist/testly/browser` directory.

## Testing

Run the frontend unit tests using Karma and Jasmine:

```bash
cd client
npm test
```

_(Note: Backend tests would typically be run separately)_

## Deployment

This application is configured for deployment on Vercel (Frontend) and a Node.js hosting provider like Render, Heroku, or a VPS (Backend).

- **Frontend:** Configure Vercel to point to the `client` directory, using `npm run build:prod` as the build command and `dist/testly/browser` as the output directory.
- **Backend:** Deploy the `server` directory to your chosen Node.js hosting provider, ensuring environment variables are configured.

## Contribution

Feel free to fork the repository and contribute!

## License

This project is licensed under the ISC License.

[Add your name/contact info here]
