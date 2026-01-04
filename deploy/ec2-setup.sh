#!/bin/bash

# EC2 Setup Script for Notes Application
# Run this on your EC2 instance

set -e

echo "=== Installing Docker ==="
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

echo "=== Installing Docker Compose ==="
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "=== Installing Git ==="
sudo yum install -y git

echo "=== Installing Node.js ==="
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

echo "=== Cloning repository ==="
cd /home/ec2-user
git clone <YOUR_REPO_URL> crud_api
cd crud_api

echo "=== Setting up environment ==="
cp .env.example .env
echo "Please edit .env file with your production values"

echo "=== Setting up firewall ==="
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "=== Setup complete! ==="
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Run: docker-compose up -d"
echo "3. Check logs: docker-compose logs -f"
