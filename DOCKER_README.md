# 🐳 Tenneco Project - Docker Setup Guide

This guide explains how to run the Tenneco Project using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Environment Configuration](#environment-configuration)
- [Docker Commands](#docker-commands)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or later)
- **Docker Compose** (version 2.0 or later)
- **Git** (for cloning the repository)

### Verify Installation

```bash
docker --version
docker-compose --version
```

---

## Quick Start

### 1. Clone the Repository

```bash
cd /Users/decimalsols/Documents
git clone <your-repo-url> "Tenneco Project"
cd "Tenneco Project/client"
```

### 2. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp docker.env.example .env
```

Edit `.env` and update the following **critical** values:

```bash
# REQUIRED: Change this to a secure random string
PAYLOAD_SECRET=$(openssl rand -base64 32)

# AWS S3 Credentials (for media storage)
S3_ACCESS_KEY_ID=your-actual-access-key
S3_SECRET_ACCESS_KEY=your-actual-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=your-region

# MongoDB Password
MONGO_PASSWORD=your-secure-password
```

### 3. Build and Run

```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Applications

- **Frontend (Client)**: http://localhost:3000
- **Admin Panel (CMS)**: http://localhost:3001/admin
- **API**: http://localhost:3001/api
- **MongoDB**: localhost:27017

### 5. Stop the Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data!)
docker-compose down -v
```

---

## Architecture

### Services Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│                   (tenneco-network)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Client     │  │    Admin     │  │   MongoDB    │ │
│  │ (Next.js)    │→│ (Payload CMS)│→│  (Database)  │ │
│  │  Port: 3000  │  │  Port: 3001  │  │ Port: 27017  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Service Details

#### 1. **Client** (Frontend)
- **Technology**: Next.js 14.2.35 + React 18 + Three.js
- **Port**: 3000
- **Purpose**: 3D interactive viewer for brake systems
- **Features**: 3D models, animations, PDF/video viewing

#### 2. **Admin** (Backend/CMS)
- **Technology**: Next.js 15 + Payload CMS 3.25
- **Port**: 3001 (mapped from internal 3000)
- **Purpose**: Content management system and API
- **Features**: GraphQL/REST API, admin panel, media management

#### 3. **MongoDB** (Database)
- **Technology**: MongoDB 7.0
- **Port**: 27017
- **Purpose**: Data persistence for CMS content
- **Storage**: Persistent volumes for data retention

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PAYLOAD_SECRET` | Secret key for Payload CMS | - | ✅ Yes |
| `DATABASE_URI` | MongoDB connection string | See .env | ✅ Yes |
| `S3_ACCESS_KEY_ID` | AWS S3 access key | - | ✅ Yes |
| `S3_SECRET_ACCESS_KEY` | AWS S3 secret key | - | ✅ Yes |
| `S3_BUCKET` | S3 bucket name | tenneco-test | ✅ Yes |
| `S3_REGION` | AWS region | eu-central-1 | ✅ Yes |
| `MONGO_PASSWORD` | MongoDB root password | changeme123 | ✅ Yes |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_CMS` | Enable/disable CMS | true |
| `NEXT_PUBLIC_FALLBACK_TIMEOUT` | API timeout (ms) | 5000 |
| `NEXT_PUBLIC_CACHE_DURATION` | Cache duration (ms) | 300000 |
| `S3_CLOUDFRONT_URL` | CloudFront CDN URL | - |

### Environment Files

- **`.env`** - Used by docker-compose.yml (create from docker.env.example)
- **`.env.local`** - Used for local development without Docker
- **`.env.example`** - Template for local development

---

## Docker Commands

### Building

```bash
# Build all services
docker-compose build

# Build a specific service
docker-compose build client
docker-compose build admin

# Build without cache (fresh build)
docker-compose build --no-cache
```

### Running

```bash
# Start all services (detached)
docker-compose up -d

# Start and view logs
docker-compose up

# Start specific service
docker-compose up -d client

# Restart a service
docker-compose restart admin
```

### Logs

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f client
docker-compose logs -f admin
docker-compose logs -f mongodb

# View last 100 lines
docker-compose logs --tail=100 -f
```

### Service Management

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop client

# Remove stopped containers
docker-compose down

# Remove containers and volumes (⚠️ deletes data!)
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all
```

### Accessing Containers

```bash
# Execute command in running container
docker-compose exec client sh
docker-compose exec admin sh
docker-compose exec mongodb mongosh

# Run one-off command
docker-compose run --rm client npm run build
```

### Database Management

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p changeme123

# Backup database
docker-compose exec mongodb mongodump --out /data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup
```

---

## Troubleshooting

### Port Already in Use

**Problem**: Error: `port is already allocated`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3002:3000"  # Use port 3002 instead
```

### Database Connection Failed

**Problem**: Admin can't connect to MongoDB

**Solution**:
1. Check if MongoDB is healthy:
   ```bash
   docker-compose ps
   ```
2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```
3. Verify DATABASE_URI in .env file
4. Restart services:
   ```bash
   docker-compose restart
   ```

### Build Failures

**Problem**: Docker build fails

**Solution**:
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Docker disk space
docker system df
```

### Client Can't Reach Admin API

**Problem**: Frontend shows API connection errors

**Solution**:
1. Verify admin service is running:
   ```bash
   docker-compose ps admin
   ```
2. Check admin logs:
   ```bash
   docker-compose logs admin
   ```
3. Test API endpoint:
   ```bash
   curl http://localhost:3001/api/health
   ```
4. Verify NEXT_PUBLIC_API_URL in .env:
   - For Docker: `http://admin:3000/api` (internal)
   - For browser access from host: `http://localhost:3001/api`

### Permission Errors

**Problem**: Permission denied errors

**Solution**:
```bash
# Fix ownership of volumes
docker-compose down
sudo chown -R $USER:$USER .

# Or run with sudo (not recommended)
sudo docker-compose up
```

---

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change `PAYLOAD_SECRET` to a cryptographically secure random string
- [ ] Use strong `MONGO_PASSWORD` (min 16 characters)
- [ ] Use MongoDB Atlas or managed database (not local MongoDB)
- [ ] Enable HTTPS/TLS for all services
- [ ] Set proper CORS origins in Payload config
- [ ] Use environment-specific S3 buckets
- [ ] Enable CloudFront CDN for media delivery
- [ ] Set up proper backup strategy for MongoDB
- [ ] Use Docker secrets or external secret management
- [ ] Enable health checks and monitoring
- [ ] Set resource limits (CPU/memory) for containers

### Production Environment Variables

```bash
# Generate secure secret
PAYLOAD_SECRET=$(openssl rand -base64 32)

# Use MongoDB Atlas
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/tenneco

# Production URLs
PAYLOAD_PUBLIC_SERVER_URL=https://admin.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Enable CloudFront
S3_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  client:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Health Monitoring

All services include health checks:

```bash
# Check health status
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' tenneco-client | jq
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `docker-compose logs -f`
3. Open an issue in the project repository

---

**Last Updated**: February 2026
**Docker Compose Version**: 3.9
**Maintained by**: Tenneco Development Team
