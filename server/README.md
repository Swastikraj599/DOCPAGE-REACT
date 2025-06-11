# Document Management System - Backend

A secure PostgreSQL-based backend for the Document Management System with role-based permissions and file storage.

## Features

- **PostgreSQL Database**: Robust relational database for storing documents and user data
- **Role-Based Access Control**: Comprehensive permissions system
- **File Upload & Storage**: Secure file handling with type validation
- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Clean and well-documented API endpoints
- **Security**: Rate limiting, CORS, helmet protection

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE document_management;
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE document_management TO your_username;
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=document_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Documents
- `GET /api/documents` - Get all documents (with permissions)
- `POST /api/documents/upload` - Upload new document
- `GET /api/documents/:id/file` - Download document file
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/categories` - Get document categories

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/assigned` - Get assigned roles
- `POST /api/roles/create` - Create user with role
- `POST /api/roles/assign` - Assign role to user

### Permissions
- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/roles/:roleId` - Get role permissions
- `POST /api/permissions/grant` - Grant permission to role
- `POST /api/permissions/revoke` - Revoke permission from role
- `POST /api/permissions/document/grant` - Grant document-specific permission

## Database Schema

### Core Tables
- **users**: User accounts and profiles
- **roles**: System roles (Admin, Manager, Employee, etc.)
- **user_roles**: User-role assignments
- **documents**: Document metadata and file references
- **document_categories**: Document categorization
- **permissions**: System permissions
- **role_permissions**: Role-permission mappings
- **document_permissions**: Document-specific permissions

### Default Roles
- **Administrator**: Full system access
- **Manager**: Department management and oversight
- **Supervisor**: Team supervision and document review
- **Team Lead**: Team coordination and document management
- **Employee**: Standard document access and creation
- **Analyst**: Data analysis and reporting
- **Coordinator**: Project coordination
- **Intern**: Limited access for learning

### Default Permissions
- **Document Operations**: view, upload, edit, delete, share
- **User Management**: manage users, assign roles
- **System Administration**: manage permissions, system admin
- **Analytics**: view system analytics

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and DoS attacks
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers and protection
- **File Type Validation**: Restricted file uploads
- **SQL Injection Protection**: Parameterized queries
- **Role-Based Access**: Granular permission system

## File Storage

Files are stored in the `uploads/` directory with:
- **Organized Structure**: Files grouped by category
- **Unique Naming**: UUID-based file names to prevent conflicts
- **Type Validation**: Only allowed file types accepted
- **Size Limits**: Configurable file size restrictions

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Migrations
```bash
npm run migrate
```

### Environment Variables
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `UPLOAD_DIR`: Upload directory path
- `MAX_FILE_SIZE`: Maximum file size in bytes

## Production Deployment

1. **Set environment to production**
   ```env
   NODE_ENV=production
   ```

2. **Configure production database**
   Update database credentials for production

3. **Set secure JWT secret**
   Use a strong, random JWT secret

4. **Configure CORS**
   Update CORS origin to your frontend domain

5. **Set up reverse proxy**
   Use nginx or similar for production deployment

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists and user has permissions

### File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Ensure allowed file types are configured

### Authentication Issues
- Verify JWT secret is set
- Check token expiration settings
- Ensure CORS is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.