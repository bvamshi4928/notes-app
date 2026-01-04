# 🚀 Quick Start Guide

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 15+ installed (or use Docker)
- [ ] Git installed
- [ ] GitHub account
- [ ] AWS account (for production deployment)

---

## 🏃 Quick Local Setup (5 minutes)

### 1. Create GitHub Repository

```bash
# Go to https://github.com/new
# Create a new repository (e.g., "notes-app")
# Don't initialize with README (we already have one)
```

### 2. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Run with Docker (Easiest)

```bash
# Copy environment file
cp .env.example .env

# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access the app:**

- Frontend: http://localhost
- Backend API: http://localhost:5001

### 4. Or Run Without Docker

```bash
# Start PostgreSQL
# Create database: notes_db

# Backend
cd backend
cp ../.env.example .env
# Edit .env with your database credentials
npm install
npm start

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

---

## ☁️ AWS Production Deployment

### Step 1: Prepare AWS Account

```bash
# Install AWS CLI
# Configure credentials
aws configure
```

### Step 2: Create AWS Resources

**A. RDS Database**

```bash
aws rds create-db-instance \
  --db-instance-identifier notes-app-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

**B. S3 Bucket**

```bash
aws s3 mb s3://your-notes-images-bucket
```

**C. ECR Repositories**

```bash
aws ecr create-repository --repository-name notes-backend
aws ecr create-repository --repository-name notes-frontend
```

**D. EC2 Instance**

- Launch t2.micro Ubuntu instance
- Open ports: 80, 443, 22
- Attach Elastic IP

### Step 3: Setup GitHub Secrets

Go to: `GitHub Repo → Settings → Secrets → Actions`

Add these secrets:

1. `AWS_ACCESS_KEY_ID`
2. `AWS_SECRET_ACCESS_KEY`
3. `AWS_REGION` (e.g., us-east-1)
4. `EC2_HOST` (Your EC2 public IP)
5. `EC2_USERNAME` (ubuntu)
6. `EC2_SSH_KEY` (Your EC2 private key content)

### Step 4: Deploy to EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Clone repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git crud_api
cd crud_api

# Run setup script
chmod +x deploy/ec2-setup.sh
./deploy/ec2-setup.sh

# Configure .env with production values
nano .env
```

**Important `.env` values for production:**

```env
NODE_ENV=production
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-notes-images-bucket
```

```bash
# Start application
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Step 5: Configure Domain & SSL

```bash
# Point your domain to EC2 Elastic IP
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

---

## 🔄 CI/CD Workflow

Every push to `main` branch automatically:

1. ✅ Runs tests
2. 🐳 Builds Docker images
3. ☁️ Pushes to AWS ECR
4. 🚀 Deploys to EC2

---

## 📊 Verify Deployment

### Check Services

```bash
# On EC2
docker-compose ps

# Should show:
# notes-backend   running
# notes-frontend  running
# notes-db        running
```

### Test Application

```bash
# Health check
curl http://YOUR_EC2_IP/api/auth/profile

# Should return 401 (expected, means backend is running)
```

### View Logs

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

---

## 🛠️ Common Commands

### Development

```bash
# Restart backend after code changes
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Run database migrations
docker-compose exec backend node src/data/migrate.js
```

### Production

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Clean up old images
docker system prune -f
```

---

## 📱 Test the Application

1. **Sign Up**: Create a new account
2. **Create Note**: Add a note with an image
3. **Add Labels**: Create and assign labels
4. **Test Features**: Pin, archive, delete notes
5. **Search**: Try searching your notes
6. **Sort**: Test different sort options

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database connection failed → Check DB_HOST in .env
# - Port already in use → Change PORT in .env
```

### Frontend shows error

```bash
# Check if backend is running
curl http://localhost:5001/

# Check frontend logs
docker-compose logs frontend
```

### Database connection issues

```bash
# Test database connection
docker-compose exec postgres psql -U postgres -d notes_db -c "SELECT 1"
```

### Can't upload images

```bash
# Check uploads directory permissions
ls -la backend/src/uploads

# For production with S3:
# - Verify AWS credentials in .env
# - Check S3 bucket permissions
# - Test S3 access: aws s3 ls s3://your-bucket
```

---

## 📚 Next Steps

1. ✅ **Set up monitoring**: AWS CloudWatch, Datadog, or New Relic
2. ✅ **Configure backups**: Automated database backups
3. ✅ **Set up alerts**: Email notifications for errors
4. ✅ **Add analytics**: Track user behavior
5. ✅ **Performance optimization**: CDN for static assets
6. ✅ **Security hardening**: Rate limiting, WAF

---

## 🆘 Need Help?

- 📖 See detailed docs in `README.md`
- 🚀 Check deployment guide in `DEPLOYMENT.md`
- 📝 Review code comments for implementation details

---

## 🎉 Congratulations!

Your notes application is now:

- ✅ Version controlled with Git
- ✅ Hosted on GitHub
- ✅ Dockerized for easy deployment
- ✅ CI/CD enabled with GitHub Actions
- ✅ Ready for AWS production deployment

**Happy coding! 🚀**
