#!/bin/bash

# =============================================
# Factory ERP Server Setup Script
# =============================================
# This script sets up the complete server environment
# with all dependencies and configurations

set -e  # Exit on any error

echo "🚀 Factory ERP Server Setup Starting..."
echo "========================================"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js >= 18.0.0"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"
echo "✅ pnpm version: $(pnpm --version)"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp
mkdir -p backups

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server"
else
    echo "✅ Environment file already exists"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
pnpm build

# Set up Git hooks (if in a Git repository)
if [ -d .git ]; then
    echo "🔧 Setting up Git hooks..."
    pnpm prepare 2>/dev/null || echo "⚠️  Husky setup skipped (not in package.json scripts)"
fi

# Create systemd service file (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔧 Creating systemd service file..."
    cat > factory-erp-server.service << EOF
[Unit]
Description=Factory ERP Server
After=network.target

[Service]
Type=simple
User=\$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4000

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=factory-erp-server

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$(pwd)/logs $(pwd)/uploads $(pwd)/temp

[Install]
WantedBy=multi-user.target
EOF
    echo "📄 Systemd service file created: factory-erp-server.service"
    echo "   To install: sudo cp factory-erp-server.service /etc/systemd/system/"
    echo "   To enable: sudo systemctl enable factory-erp-server"
    echo "   To start: sudo systemctl start factory-erp-server"
fi

# Create PM2 ecosystem file
echo "🔧 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'factory-erp-server',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: 'logs/pm2-combined.log',
    out_file: 'logs/pm2-out.log',
    error_file: 'logs/pm2-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads', 'temp'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Create Docker files
echo "🐳 Creating Docker configuration..."
cat > Dockerfile << EOF
# Multi-stage build for production
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p logs uploads temp backups
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "dist/server.js"]
EOF

cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/factory_erp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - factory-erp

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=factory_erp
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped
    networks:
      - factory-erp

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - factory-erp

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - factory-erp

volumes:
  mongo_data:
  redis_data:

networks:
  factory-erp:
    driver: bridge
EOF

# Create MongoDB initialization script
cat > mongo-init.js << EOF
// MongoDB initialization script
db = db.getSiblingDB('factory_erp');

// Create indexes for better performance
db.companies.createIndex({ "companyCode": 1 }, { unique: true });
db.companies.createIndex({ "registrationDetails.gstin": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.inventory_items.createIndex({ "companyId": 1, "itemCode": 1 }, { unique: true });
db.stock_movements.createIndex({ "companyId": 1, "movementDate": -1 });
db.production_orders.createIndex({ "companyId": 1, "orderDate": -1 });
db.customer_orders.createIndex({ "companyId": 1, "orderDate": -1 });

print('Database initialized successfully');
EOF

# Create nginx configuration
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream factory_erp_backend {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Rate limiting
        limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
        limit_req_zone \$binary_remote_addr zone=auth:10m rate=1r/s;

        location / {
            proxy_pass http://factory_erp_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        location /api/v1/auth {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://factory_erp_backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://factory_erp_backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start MongoDB (if not using Docker)"
echo "3. Run the server:"
echo "   - Development: pnpm dev"
echo "   - Production: pnpm start:prod"
echo "   - Docker: docker-compose up -d"
echo "   - PM2: pm2 start ecosystem.config.js"
echo ""
echo "🔗 Useful commands:"
echo "   - Health check: curl http://localhost:3000/health"
echo "   - View logs: tail -f logs/application-$(date +%Y-%m-%d).log"
echo "   - Stop PM2: pm2 stop factory-erp-server"
echo "   - Docker logs: docker-compose logs -f app"
echo ""
echo "📚 Documentation: See README.md for detailed information"
echo ""
echo "✅ Factory ERP Server is ready to use!"
