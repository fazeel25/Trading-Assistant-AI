# Trading Assistant AI

A modern SaaS application that provides AI-powered trading insights based on technical analysis. Built with React, TypeScript, Tailwind CSS, Firebase, and Binance API integration.

![Trading Assistant AI](https://img.shields.io/badge/Trading-AI%20Powered-blue)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase)

## Features

### Core Features
- **User Authentication**: Sign up/login with email/password or Google OAuth
- **Real-time Market Data**: Live crypto prices from Binance API
- **Technical Indicators**: RSI, MA50, MA200 calculations
- **AI Trading Insights**: Probability-based signals (NOT financial advice)
- **Interactive Charts**: Candlestick charts with lightweight-charts
- **Subscription Plans**: Free and Premium tiers with Stripe integration

### AI Logic Rules
- **RSI < 30**: Oversold → Possible Buy
- **RSI > 70**: Overbought → Possible Sell
- **Price > MA50 > MA200**: Bullish trend
- **Price < MA50 < MA200**: Bearish trend
- **Conflicting signals**: Neutral/Wait

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- lightweight-charts for charts
- Lucide React for icons

### Backend & Services
- Firebase Authentication
- Firebase Firestore (database)
- Binance API (market data)
- Stripe (payments)

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login & Signup forms
│   ├── charts/         # Trading chart components
│   ├── custom/         # Header, Sidebar, etc.
│   ├── dashboard/      # Dashboard widgets
│   ├── pages/          # Main page components
│   └── ui/             # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx # Authentication state
├── hooks/
│   └── useTradingData.ts # Trading data hooks
├── lib/
│   ├── firebase.ts     # Firebase config
│   └── stripe.ts       # Stripe config
├── services/
│   ├── binanceApi.ts   # Binance API integration
│   └── aiInsights.ts   # AI analysis engine
├── types/
│   └── index.ts        # TypeScript types
├── utils/
│   └── indicators.ts   # Technical indicator calculations
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trading-assistant-ai.git
cd trading-assistant-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Add your Firebase and Stripe credentials to `.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
```

5. Start the development server:
```bash
npm run dev
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Enable Firestore Database
5. Get your configuration credentials
6. Add them to your `.env` file

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /analysisHistory/{historyId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /priceAlerts/{alertId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a product and price in the Dashboard
3. Add your publishable key and price ID to `.env`
4. Set up webhook endpoints for subscription events

## Technical Indicators

### RSI (Relative Strength Index)
- Period: 14
- Oversold: < 30
- Overbought: > 70
- Neutral: 30-70

### Moving Averages
- MA50: 50-period Simple Moving Average
- MA200: 200-period Simple Moving Average
- Golden Cross: MA50 > MA200 (Bullish)
- Death Cross: MA50 < MA200 (Bearish)

## AI Confidence Levels

- **High**: Strong alignment across all indicators
- **Medium**: Partial alignment or mixed signals
- **Low**: Conflicting signals or unclear direction

## API Rate Limits

The application implements rate limiting for Binance API calls:
- 100ms delay between requests
- Maximum 1000 candles per request
- Auto-retry on rate limit errors

## Security Features

- Firebase Authentication for secure user management
- Input validation on all forms
- API error handling
- Environment variable protection
- Firestore security rules

## Deployment

### Build for production:
```bash
npm run build
```

### Deploy to Vercel:
```bash
npm i -g vercel
vercel
```

### Environment Variables for Production
Make sure to add all environment variables to your hosting platform:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_STRIPE_PUBLIC_KEY
- VITE_STRIPE_PREMIUM_PRICE_ID

## Future Enhancements

- [ ] Telegram notification integration
- [ ] Price alert system with push notifications
- [ ] More technical indicators (MACD, Bollinger Bands)
- [ ] Backtesting capabilities
- [ ] Portfolio tracking
- [ ] Social trading features
- [ ] Mobile app (React Native)

## Disclaimer

**IMPORTANT**: This application provides probability-based insights and technical analysis only. It is **NOT financial advice**. Trading involves significant risk. Always do your own research and consider consulting with a financial advisor before making investment decisions.

## License

MIT License - see LICENSE file for details

## Support

For support, email support@tradingai.com or join our Discord community.

---

Built  ❤️ by Fazeel ahmed
