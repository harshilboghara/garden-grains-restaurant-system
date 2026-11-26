#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Garden Grains - Backend Diagnostic Tool${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}✗ Backend directory not found${NC}"
    echo -e "Please run this script from the root directory (MP1)"
    exit 1
fi

echo -e "${YELLOW}1. Checking .env file...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    if grep -q "MONGODB_URI" backend/.env && grep -q "JWT_SECRET" backend/.env; then
        echo -e "${GREEN}✓ Required environment variables found${NC}"
    else
        echo -e "${RED}✗ Missing required environment variables${NC}"
        echo -e "  - MONGODB_URI: $(grep 'MONGODB_URI' backend/.env || echo 'NOT FOUND')"
        echo -e "  - JWT_SECRET: $(grep 'JWT_SECRET' backend/.env || echo 'NOT FOUND')"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "  Create it by copying env.example:"
    echo -e "  ${YELLOW}cp backend/env.example backend/.env${NC}"
    exit 1
fi

echo -e "\n${YELLOW}2. Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js${NC}"
    exit 1
fi

echo -e "\n${YELLOW}3. Checking npm packages...${NC}"
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Dependencies not installed${NC}"
    echo -e "  Run: ${YELLOW}cd backend && npm install${NC}"
fi

echo -e "\n${YELLOW}4. Checking MongoDB connection...${NC}"
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB CLI found${NC}"
    
    # Try to test connection
    MONGO_URI=$(grep 'MONGODB_URI' backend/.env | cut -d '=' -f 2-)
    if [[ $MONGO_URI == mongodb://localhost* ]]; then
        echo -e "  Testing local MongoDB connection..."
        if timeout 2 mongosh --eval "db.adminCommand('ping')" $MONGO_URI 2>/dev/null | grep -q "ok"; then
            echo -e "${GREEN}✓ MongoDB is running and responding${NC}"
        else
            echo -e "${YELLOW}⚠ MongoDB might not be running${NC}"
            echo -e "  Start MongoDB:"
            echo -e "    Windows: Check Services, find 'MongoDB' and start it"
            echo -e "    Mac: brew services start mongodb-community"
            echo -e "    Linux: sudo systemctl start mongod"
        fi
    fi
else
    echo -e "${YELLOW}⚠ MongoDB CLI not found (optional, backend can still run)${NC}"
fi

echo -e "\n${YELLOW}5. Checking if ports are available...${NC}"
if ! lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓ Port 5000 is available (backend can use it)${NC}"
else
    echo -e "${RED}✗ Port 5000 is already in use${NC}"
    echo -e "  Change PORT in backend/.env or close the app using port 5000"
fi

if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓ Port 5173 is available (frontend can use it)${NC}"
else
    echo -e "${YELLOW}⚠ Port 5173 might be in use, but frontend will try next available${NC}"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Next Steps:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
echo -e "1. Start MongoDB (if using local):"
echo -e "   ${YELLOW}mongod${NC} (or use MongoDB service)\n"
echo -e "2. Start Backend Server (Terminal 1):"
echo -e "   ${YELLOW}cd backend && npm run dev${NC}\n"
echo -e "3. Start Frontend (Terminal 2):"
echo -e "   ${YELLOW}cd frontend && npm run dev${NC}\n"
echo -e "4. Open browser and check:"
echo -e "   ${YELLOW}http://localhost:5000/api/health${NC}"
echo -e "   (Should show: {\"status\":\"OK\",\"message\":\"Garden Grains API is running\"})\n"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
