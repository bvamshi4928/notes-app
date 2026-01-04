# Notes Application - Full Stack CRUD App

A full-featured notes application with rich text editing, image attachments, labels, and more.

## Features

- 🔐 **Authentication**: Sign up, sign in, forgot password, reset password
- 📝 **Rich Text Editor**: Format your notes with ReactQuill
- 🎨 **Color Coding**: 8 different colors for notes
- 📌 **Pin Notes**: Keep important notes at the top
- 🗂️ **Archive**: Archive notes you want to keep but not see regularly
- 🗑️ **Trash**: Soft delete with restore functionality
- 🏷️ **Labels**: Organize notes with custom labels
- 🖼️ **Image Attachments**: Upload and preview images
- 🔍 **Search**: Search through titles, content, and dates
- ⚡ **Sort**: Multiple sorting options
- 🌓 **Dark Mode**: Toggle between light and dark themes

## Tech Stack

### Backend

- Node.js + Express
- PostgreSQL
- JWT Authentication
- Multer (File uploads)
- AWS S3 (Production image storage)

### Frontend

- React + Vite
- React Router
- ReactQuill (Rich text editor)
- TailwindCSS + DaisyUI
- Axios

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd crud_api
```

2. **Install dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
```

4. **Start PostgreSQL** (if not using Docker)

```bash
# Make sure PostgreSQL is running
# Create database: notes_db
```

5. **Run the application**

```bash
# Backend (from backend directory)
npm start

# Frontend (from frontend directory)
npm run dev
```

## Docker Deployment

### Using Docker Compose (Recommended for local development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:

- Frontend: http://localhost:80
- Backend: http://localhost:5001
- PostgreSQL: localhost:5432

### Building individual containers

```bash
# Backend
docker build -t notes-backend ./backend

# Frontend
docker build -t notes-frontend ./frontend
```

## AWS Deployment

### Prerequisites

- AWS Account
- AWS CLI configured
- EC2 instance
- RDS PostgreSQL instance
- S3 bucket for images

### Setup AWS Resources

1. **Create RDS PostgreSQL Database**

```bash
aws rds create-db-instance \
  --db-instance-identifier notes-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20
```

2. **Create S3 Bucket**

```bash
aws s3 mb s3://your-notes-app-images
```

3. **Create ECR Repositories**

```bash
aws ecr create-repository --repository-name notes-backend
aws ecr create-repository --repository-name notes-frontend
```

4. **Launch EC2 Instance**

- Amazon Linux 2 or Ubuntu
- t2.micro or larger
- Install Docker and Docker Compose
- Open ports: 80, 443, 22

### Deploy to EC2

1. **SSH into EC2**

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

2. **Clone repository**

```bash
git clone <your-repo-url>
cd crud_api
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with production values
```

4. **Deploy with Docker Compose**

```bash
docker-compose up -d
```

## CI/CD with GitHub Actions

### Setup GitHub Secrets

Add these secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `EC2_HOST`
- `EC2_USERNAME`
- `EC2_SSH_KEY`

### Workflow

Push to `main` branch triggers:

1. Run tests
2. Build Docker images
3. Push to Amazon ECR
4. Deploy to EC2

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/password` - Change password

### Notes

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Soft delete note
- `PATCH /api/notes/:id/pin` - Toggle pin
- `PATCH /api/notes/:id/archive` - Toggle archive
- `GET /api/notes/archived` - Get archived notes
- `GET /api/notes/trash` - Get trashed notes
- `PATCH /api/notes/:id/restore` - Restore from trash
- `DELETE /api/notes/:id/permanent` - Permanent delete

### Attachments

- `POST /api/notes/:id/attachments` - Upload files
- `GET /api/notes/attachments/:id/preview` - Preview file
- `GET /api/notes/attachments/:id` - Download file
- `DELETE /api/notes/attachments/:id` - Delete file

### Labels

- `GET /api/labels` - Get all labels
- `POST /api/labels` - Create label
- `PUT /api/labels/:id` - Update label
- `DELETE /api/labels/:id` - Delete label
- `POST /api/labels/note` - Add label to note
- `DELETE /api/labels/note/:noteId/:labelId` - Remove label from note
- `GET /api/labels/:id/notes` - Get notes with label

## Environment Variables

### Backend

```env
NODE_ENV=production
PORT=5001
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=notes_db
JWT_SECRET=your-jwt-secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
```

### Frontend

```env
VITE_API_URL=http://your-backend-url
```

## Production Checklist

- [ ] Change default passwords and secrets
- [ ] Configure CORS properly
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up proper logging
- [ ] Configure backup strategy for database
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting
- [ ] Enable database connection pooling
- [ ] Set up CDN for static assets
- [ ] Configure S3 bucket policies
- [ ] Enable AWS CloudWatch
- [ ] Set up automated backups

## License

MIT

## Author

Your Name
