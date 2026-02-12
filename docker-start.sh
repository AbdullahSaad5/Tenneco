#!/bin/bash
# Quick Start Script for Tenneco Project Docker Setup

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Tenneco Project - Docker Quick Start             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp docker.env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Please edit .env and update the following:${NC}"
    echo -e "   ${YELLOW}- PAYLOAD_SECRET (generate with: openssl rand -base64 32)${NC}"
    echo -e "   ${YELLOW}- S3_ACCESS_KEY_ID${NC}"
    echo -e "   ${YELLOW}- S3_SECRET_ACCESS_KEY${NC}"
    echo -e "   ${YELLOW}- MONGO_PASSWORD${NC}"
    echo ""
    read -p "Press Enter to continue after updating .env, or Ctrl+C to exit..."
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

echo ""
echo -e "${GREEN}Building Docker images...${NC}"
docker-compose build

echo ""
echo -e "${GREEN}Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}Waiting for services to be ready...${NC}"
sleep 10

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Services Started Successfully!           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Access your applications at:"
echo -e "  ${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "  ${GREEN}Admin:${NC}    http://localhost:3001/admin"
echo -e "  ${GREEN}API:${NC}      http://localhost:3001/api"
echo -e "  ${GREEN}Health:${NC}   http://localhost:3000/api/health"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}View logs:${NC}         docker-compose logs -f"
echo -e "  ${YELLOW}Stop services:${NC}     docker-compose down"
echo -e "  ${YELLOW}Restart services:${NC}  docker-compose restart"
echo -e "  ${YELLOW}Check status:${NC}      docker-compose ps"
echo ""
echo -e "Or use the Makefile:"
echo -e "  ${YELLOW}make logs${NC}     - View all logs"
echo -e "  ${YELLOW}make down${NC}     - Stop all services"
echo -e "  ${YELLOW}make restart${NC}  - Restart all services"
echo -e "  ${YELLOW}make help${NC}     - Show all available commands"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
