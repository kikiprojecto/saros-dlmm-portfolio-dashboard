# 🚀 Saros DLMM Portfolio Analytics Dashboard

**Advanced portfolio management for Saros DLMM liquidity providers**

A comprehensive, production-ready dashboard for managing and analyzing Saros DLMM (Dynamic Liquidity Market Maker) positions on Solana. Built with modern web technologies and optimized for performance, security, and user experience.

## 🎯 Demo Challenge Submission

Built for the **Saros DLMM Demo Challenge** - showcasing advanced integration with `@saros-finance/dlmm-sdk` and demonstrating best practices in DeFi application development.

## ✨ Features

### 🔥 Core Functionality
- **Real-time Portfolio Tracking** - Live updates every 60 seconds with comprehensive position data
- **Advanced Analytics** - P&L analysis, APY calculations, performance metrics, and risk assessment
- **Interactive Visualizations** - Beautiful charts showing portfolio performance over time
- **Position Management** - Detailed view of individual DLMM positions with token holdings
- **Risk Assessment** - Comprehensive risk scoring based on concentration, range status, and volatility
- **Multi-Wallet Support** - Seamless integration with Phantom, Solflare, and other Solana wallets

### 🎨 User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, professional interface with smooth animations
- **Real-time Updates** - Auto-refresh functionality with manual refresh option
- **Error Handling** - Graceful error states with user-friendly messages
- **Loading States** - Smooth loading transitions and skeleton screens

### 🔧 Technical Excellence
- **Type Safety** - Full TypeScript implementation with strict type checking
- **Performance Optimized** - Efficient rendering, caching, and state management
- **Production Ready** - Comprehensive error handling, logging, and monitoring
- **Security** - Secure wallet integration and data handling
- **Scalable Architecture** - Modular component structure and service layer

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14** - React framework with App Router and server-side rendering
- **TypeScript** - Type-safe development with strict configuration
- **Tailwind CSS** - Utility-first CSS framework with custom design system

### Blockchain Integration
- **@saros-finance/dlmm-sdk** - Core Saros DLMM SDK integration
- **@solana/web3.js** - Solana blockchain interaction
- **@solana/wallet-adapter-react** - Wallet connection and management
- **@solana/wallet-adapter-wallets** - Multi-wallet support

### Data Visualization
- **Recharts** - Interactive charts and data visualization
- **Lucide React** - Beautiful, consistent icon system

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting and consistency
- **PostCSS** - CSS processing and optimization

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Solana wallet (Phantom, Solflare, etc.)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/saros-dlmm-portfolio-dashboard.git
cd saros-dlmm-portfolio-dashboard

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Edit .env.local with your preferred RPC endpoint
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Run development server
npm run dev
```

### Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Solana RPC Endpoint (required)
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Optional: Custom RPC endpoint for better performance
# NEXT_PUBLIC_RPC_ENDPOINT=https://your-custom-rpc-endpoint.com
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

### Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
# Upload the 'out' folder to Netlify
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Usage

### Getting Started

1. **Connect Wallet** - Click the wallet button to connect your Solana wallet
2. **View Portfolio** - Your DLMM positions will automatically load
3. **Analyze Performance** - Review metrics, charts, and analytics
4. **Manage Positions** - Access detailed position information and actions

### Dashboard Sections

#### 📊 Overview Tab
- **Key Metrics** - Total value, P&L, fees earned, average APY
- **Performance Chart** - Portfolio value over time
- **Stats Cards** - Active positions, risk score, top performer
- **Position Grid** - All your DLMM positions at a glance

#### 🎯 Positions Tab
- **Position Management** - Filter, sort, and manage positions
- **Detailed Cards** - Comprehensive position information
- **Action Buttons** - Manage and view position details

#### 📈 Analytics Tab
- **Performance Analysis** - Advanced charts and metrics
- **Risk Distribution** - Portfolio risk breakdown
- **Export Data** - Download portfolio reports

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── providers/         # Context providers
│   └── portfolio/         # Dashboard components
├── hooks/                # Custom React hooks
│   └── useSarosDLMM.ts    # Main data hook
├── services/             # Business logic
│   └── dlmmService.ts     # DLMM SDK integration
├── types/                # TypeScript definitions
│   └── index.ts          # Type definitions
└── utils/                # Utility functions
    └── formatting.ts      # Data formatting
```

### Key Components

- **`PortfolioDashboard`** - Main dashboard component
- **`useSarosDLMM`** - Data fetching and state management hook
- **`SarosDLMMService`** - DLMM SDK integration service
- **`MetricCard`** - Reusable metric display component
- **`PositionCard`** - Individual position display component

### Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Main brand color
- **Success**: Green (#22c55e) - Positive metrics
- **Warning**: Yellow (#f59e0b) - Caution states
- **Danger**: Red (#ef4444) - Negative metrics
- **Gray**: Neutral grays for text and backgrounds

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading and body text sizing
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Primary (blue), secondary (gray), success (green)
- **Icons**: Lucide React icon system
- **Charts**: Recharts with custom styling

## 🔒 Security

### Wallet Security
- **Secure Connection** - Uses official Solana wallet adapters
- **No Private Key Storage** - Private keys never leave the wallet
- **Read-Only Operations** - No transaction signing required for viewing

### Data Privacy
- **Local Storage Only** - No data sent to external servers
- **RPC Endpoint** - Direct connection to Solana network
- **No Analytics** - No tracking or data collection

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Issues**
- Ensure you have a Solana wallet installed
- Check that you're on the correct network (Mainnet)
- Try refreshing the page and reconnecting

**Data Loading Issues**
- Verify your RPC endpoint is working
- Check your internet connection
- Try the manual refresh button

**Performance Issues**
- Clear browser cache
- Check browser console for errors
- Try a different browser

### Support

For technical support or questions:
- **GitHub Issues** - Report bugs and feature requests
- **Documentation** - Check this README and code comments
- **Community** - Join the Saros Finance community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Saros Finance** - For the DLMM SDK and protocol
- **Solana Foundation** - For the Solana blockchain
- **Next.js Team** - For the excellent React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Recharts** - For the beautiful chart components

## 🚀 Future Enhancements

- **Advanced Analytics** - More sophisticated portfolio analysis
- **Position Optimization** - AI-powered position recommendations
- **Mobile App** - Native mobile application
- **Multi-Chain Support** - Support for other blockchains
- **Social Features** - Portfolio sharing and social trading

---

**Built with ❤️ for the Saros DLMM Demo Challenge**

*Showcasing the future of DeFi portfolio management*
