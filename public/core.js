export function sma(values, period) {
  if (!Array.isArray(values) || period < 1 || values.length < period) return null;
  const window = values.slice(-period);
  return window.reduce((sum, value) => sum + value, 0) / period;
}

export function rsi(values, period = 14) {
  if (!Array.isArray(values) || values.length <= period) return null;
  const changes = values.slice(-(period + 1)).slice(1).map((value, index) => value - values.slice(-(period + 1))[index]);
  const gains = changes.reduce((sum, change) => sum + Math.max(change, 0), 0) / period;
  const losses = changes.reduce((sum, change) => sum + Math.max(-change, 0), 0) / period;
  if (losses === 0) return 100;
  return 100 - 100 / (1 + gains / losses);
}

export function signalFromIndicators({ price, ma20, ma50, rsiValue }) {
  let score = 0;
  const reasons = [];
  if (rsiValue < 35) { score += 2; reasons.push('RSI shows oversold momentum'); }
  else if (rsiValue > 65) { score -= 2; reasons.push('RSI shows overbought momentum'); }
  else reasons.push('RSI is in a neutral zone');
  if (price > ma20) { score += 1; reasons.push('Price is above the 20-period average'); }
  else { score -= 1; reasons.push('Price is below the 20-period average'); }
  if (ma20 > ma50) { score += 1; reasons.push('Short trend is stronger than long trend'); }
  else { score -= 1; reasons.push('Long trend remains stronger'); }
  const action = score >= 2 ? 'BUY WATCH' : score <= -2 ? 'SELL WATCH' : 'WAIT';
  const confidence = Math.min(88, 54 + Math.abs(score) * 8);
  return { action, confidence, score, reasons };
}

export function positionSize({ balance, riskPercent, stopPercent }) {
  if (balance <= 0 || riskPercent <= 0 || stopPercent <= 0) return 0;
  return Math.min(balance, (balance * (riskPercent / 100)) / (stopPercent / 100));
}

export function portfolioValue(cash, holdings, prices) {
  return Object.entries(holdings).reduce((total, [symbol, amount]) => total + amount * (prices[symbol] || 0), cash);
}
