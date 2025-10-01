# 🚀 Deployment Guide

**Complete deployment instructions for the Saros DLMM Portfolio Dashboard**

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository access
- Domain name (optional)

## 🌐 Deployment Options

### 1. Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Built-in analytics
- Easy environment management

#### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_RPC_ENDPOINT
# Enter: https://api.mainnet-beta.solana.com

# Deploy to production
vercel --prod
```

#### Environment Variables

Set these in your Vercel dashboard:

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

#### Custom Domain

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

### 2. Netlify

**Why Netlify?**
- Easy static site deployment
- Form handling
- Serverless functions
- Branch previews

#### Deploy Steps

```bash
# Build the project
npm run build

# Install Netlify CLI
npm i -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=out
```

#### Build Settings

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Docker Deployment

**Why Docker?**
- Consistent environments
- Easy scaling
- Container orchestration
- Production-ready

#### Build Docker Image

```bash
# Build the image
docker build -t saros-dlmm-dashboard .

# Run locally
docker run -p 3000:3000 saros-dlmm-dashboard

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com \
  saros-dlmm-dashboard
```

#### Docker Compose

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.yml --profile production up --build
```

### 4. Traditional VPS/Server

**Why VPS?**
- Full control
- Custom configurations
- Cost-effective for high traffic
- Custom domain management

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-username/saros-dlmm-dashboard.git
cd saros-dlmm-dashboard

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "saros-dashboard" -- start
pm2 save
pm2 startup
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/saros-dashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Configuration

### Required Variables

```env
# Solana RPC Endpoint (Required)
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

### Optional Variables

```env
# Development Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### RPC Endpoint Options

**Free Options:**
- `https://api.mainnet-beta.solana.com` (Official, rate limited)
- `https://ssc-dao.genesysgo.net` (GenesysGo, free tier)

**Paid Options (Better Performance):**
- Helius: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
- QuickNode: `https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY/`
- Alchemy: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`

## 📊 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run analyze

# Clean build cache
npm run clean

# Type check
npm run type-check
```

### Runtime Optimization

1. **Enable Gzip Compression**
2. **Use CDN for static assets**
3. **Implement caching headers**
4. **Optimize images**
5. **Minimize JavaScript bundles**

### Monitoring

```bash
# Health check endpoint
curl https://your-domain.com/api/health

# Monitor performance
npm run analyze
```

## 🔒 Security Considerations

### HTTPS Configuration

- Always use HTTPS in production
- Configure proper SSL certificates
- Set security headers (included in vercel.json)

### Environment Security

- Never commit `.env.local` files
- Use environment variables for sensitive data
- Rotate API keys regularly
- Monitor for security vulnerabilities

### Wallet Security

- The application is read-only (no private key access)
- All wallet operations are handled by the user's wallet
- No sensitive data is stored locally

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_RPC_ENDPOINT

# Verify in browser console
console.log(process.env.NEXT_PUBLIC_RPC_ENDPOINT)
```

**Docker Issues:**
```bash
# Rebuild without cache
docker build --no-cache -t saros-dlmm-dashboard .

# Check logs
docker logs saros-dlmm-dashboard
```

### Performance Issues

1. **Check RPC endpoint response time**
2. **Monitor bundle size**
3. **Enable compression**
4. **Use CDN for static assets**

## 📈 Scaling Considerations

### Horizontal Scaling

- Use load balancers
- Implement Redis for caching
- Database for user preferences (optional)

### Vertical Scaling

- Increase server resources
- Optimize application code
- Use faster RPC endpoints

### CDN Configuration

- Cache static assets
- Implement edge caching
- Use geographic distribution

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 📞 Support

For deployment issues:

1. **Check logs** - Application and server logs
2. **Verify environment** - All required variables set
3. **Test locally** - Ensure it works in development
4. **Check documentation** - Platform-specific guides
5. **Community support** - GitHub issues and discussions

---

**Ready to deploy your Saros DLMM Portfolio Dashboard! 🚀**
