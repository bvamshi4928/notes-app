# Git & GitHub Setup

## 1. Initialize Git Repository

```bash
cd C:/Users/Bisapogu\ Vamshi/Desktop/Projects/crud_api
git init
git add .
git commit -m "Initial commit: Full-stack notes application"
```

## 2. Create GitHub Repository

```bash
# Go to https://github.com/new and create a new repository
# Then link it:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

# Local Docker Testing

## Build and run with Docker Compose

```bash
# Create .env file first
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Test the application

- Frontend: http://localhost:80
- Backend: http://localhost:5001
- Database: localhost:5432

---

# AWS Setup

## 1. Create RDS PostgreSQL Database

```bash
aws rds create-db-instance \
  --db-instance-identifier notes-app-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --publicly-accessible \
  --backup-retention-period 7
```

## 2. Create S3 Bucket for Images

```bash
aws s3 mb s3://your-notes-app-images-bucket
aws s3api put-bucket-versioning \
  --bucket your-notes-app-images-bucket \
  --versioning-configuration Status=Enabled

# Set bucket policy
aws s3api put-bucket-policy \
  --bucket your-notes-app-images-bucket \
  --policy file://s3-bucket-policy.json
```

## 3. Create ECR Repositories

```bash
# Backend repository
aws ecr create-repository \
  --repository-name notes-backend \
  --image-scanning-configuration scanOnPush=true

# Frontend repository
aws ecr create-repository \
  --repository-name notes-frontend \
  --image-scanning-configuration scanOnPush=true
```

## 4. Launch EC2 Instance

```bash
# Launch instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name YOUR_KEY_PAIR \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=notes-app-server}]'

# Allocate and associate Elastic IP
aws ec2 allocate-address
aws ec2 associate-address --instance-id i-xxxxx --public-ip x.x.x.x
```

## 5. Setup EC2 Instance

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Run setup script
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git crud_api
cd crud_api
chmod +x deploy/ec2-setup.sh
./deploy/ec2-setup.sh

# Configure environment
nano .env
# Add production values:
# - RDS endpoint
# - S3 bucket name
# - AWS credentials
# - JWT secret

# Start application
docker-compose up -d
```

---

# GitHub Actions Setup

## Add these secrets to your GitHub repository:

Go to: Settings → Secrets and variables → Actions

1. **AWS_ACCESS_KEY_ID** - Your AWS access key
2. **AWS_SECRET_ACCESS_KEY** - Your AWS secret key
3. **AWS_REGION** - e.g., us-east-1
4. **EC2_HOST** - Your EC2 public IP
5. **EC2_USERNAME** - ubuntu (or ec2-user)
6. **EC2_SSH_KEY** - Your EC2 private key content

## Workflow triggers automatically on:

- Push to `main` branch
- Pull requests to `main`

---

# Manual Deployment Commands

## Build and push Docker images to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build backend
docker build -t notes-backend ./backend
docker tag notes-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/notes-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/notes-backend:latest

# Build frontend
docker build -t notes-frontend ./frontend
docker tag notes-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/notes-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/notes-frontend:latest
```

## Deploy to EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Pull latest code
cd /home/ubuntu/crud_api
git pull origin main

# Pull and restart containers
docker-compose pull
docker-compose up -d --remove-orphans

# Clean up old images
docker system prune -f
```

---

# SSL Certificate Setup (Let's Encrypt)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (runs twice daily)
sudo certbot renew --dry-run
```

---

# Monitoring and Maintenance

## View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Database backup

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres notes_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres notes_db < backup.sql
```

## Check service status

```bash
docker-compose ps
docker-compose top
```

## Restart services

```bash
docker-compose restart backend
docker-compose restart frontend
```

---

# Troubleshooting

## Container issues

```bash
# View container logs
docker logs notes-backend

# Enter container shell
docker exec -it notes-backend sh

# Check container resource usage
docker stats
```

## Database connection issues

```bash
# Test database connection
docker-compose exec backend node -e "const pool = require('./src/config/db.js').default; pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows); process.exit(); })"
```

## Port conflicts

```bash
# Check what's using a port
sudo lsof -i :5001
sudo lsof -i :80

# Kill process
sudo kill -9 PID
```
