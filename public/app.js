import { portfolioValue, positionSize, rsi, signalFromIndicators, sma } from './core.js';

const ASSETS = {
  BTCUSDT: { name: 'Bitcoin', short: 'BTC', seed: 67800 },
  ETHUSDT: { name: 'Ethereum', short: 'ETH', seed: 3480 },
  BNBUSDT: { name: 'BNB', short: 'BNB', seed: 610 },
  SOLUSDT: { name: 'Solana', short: 'SOL', seed: 148 }
};
const STORAGE_KEY = 'signaldesk-paper-v1';
const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: value < 10 ? 3 : 2 }).format(value || 0);
const number = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(value || 0);

let state = loadState();
let market = {};
let selected = 'BTCUSDT';

function loadState() {
  try {
    return { cash: 10000, holdings: {}, journal: [], ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch { return { cash: 10000, holdings: {}, journal: [] }; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function seededSeries(seed, count = 60) {
  const values = [seed * .965];
  for (let i = 1; i < count; i += 1) {
    const wave = Math.sin((i + seed) / 5) * .006;
    const drift = ((i * 17) % 13 - 6) / 1900;
    values.push(Math.max(0.01, values[i - 1] * (1 + wave + drift)));
  }
  return values;
}

async function fetchAsset(symbol) {
  const asset = ASSETS[symbol];
  try {
    const [tickerResponse, candleResponse] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, { signal: AbortSignal.timeout(6000) }),
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=60`, { signal: AbortSignal.timeout(6000) })
    ]);
    if (!tickerResponse.ok || !candleResponse.ok) throw new Error('feed unavailable');
    const ticker = await tickerResponse.json();
    const candles = await candleResponse.json();
    return { price: Number(ticker.lastPrice), change: Number(ticker.priceChangePercent), history: candles.map((row) => Number(row[4])), live: true };
  } catch {
    const history = seededSeries(asset.seed);
    const price = history.at(-1);
    return { price, change: ((price / history[0]) - 1) * 100, history, live: false };
  }
}

async function refreshMarket() {
  $('feed-status').textContent = 'Refreshing market feed…';
  const entries = await Promise.all(Object.keys(ASSETS).map(async (symbol) => [symbol, await fetchAsset(symbol)]));
  market = Object.fromEntries(entries);
  const isLive = entries.some(([, data]) => data.live);
  $('feed-status').textContent = isLive ? 'Public market feed online' : 'Demo feed · offline fallback';
  renderAll();
}

function renderTickers() {
  $('ticker-strip').innerHTML = Object.entries(ASSETS).map(([symbol, asset]) => {
    const data = market[symbol];
    if (!data) return '';
    return `<button class="ticker" data-symbol="${symbol}"><div><strong>${asset.short}/USDT</strong><span class="${data.change >= 0 ? 'up' : 'down'}">${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%</span></div><b>${money(data.price)}</b></button>`;
  }).join('');
  document.querySelectorAll('.ticker').forEach((button) => button.addEventListener('click', () => {
    selected = button.dataset.symbol; $('symbol-select').value = selected; renderSelected();
  }));
}

function chartPath(values) {
  const width = 800; const height = 230; const pad = 10;
  const min = Math.min(...values); const max = Math.max(...values); const span = max - min || 1;
  return values.map((value, index) => {
    const x = pad + index * ((width - pad * 2) / (values.length - 1));
    const y = pad + (max - value) / span * (height - pad * 2);
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function renderSelected() {
  const asset = ASSETS[selected]; const data = market[selected];
  if (!data) return;
  $('asset-title').textContent = `${asset.name} / USDT`;
  $('current-price').textContent = money(data.price);
  $('price-change').textContent = `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}% today`;
  $('price-change').className = data.change >= 0 ? 'up' : 'down';
  const line = chartPath(data.history);
  $('chart-line').setAttribute('d', line);
  $('chart-area').setAttribute('d', `${line} L790,250 L10,250 Z`);
  const ma20 = sma(data.history, 20); const ma50 = sma(data.history, 50); const rsiValue = rsi(data.history);
  const changes = data.history.slice(1).map((value, index) => Math.abs(value / data.history[index] - 1));
  const volatility = (changes.reduce((a, b) => a + b, 0) / changes.length) * 100;
  const signal = signalFromIndicators({ price: data.price, ma20, ma50, rsiValue });
  $('rsi-value').textContent = rsiValue.toFixed(1); $('ma20-value').textContent = money(ma20); $('ma50-value').textContent = money(ma50);
  $('volatility-value').textContent = `${volatility.toFixed(2)}%`;
  $('signal-badge').textContent = signal.action; $('signal-badge').className = `signal ${signal.action.toLowerCase().replace(' ', '-')}`;
  $('confidence-value').textContent = `${signal.confidence}%`; $('confidence-meter').style.width = `${signal.confidence}%`;
  $('signal-reasons').innerHTML = signal.reasons.map((reason) => `<li>${reason}</li>`).join('');
}

function renderPortfolio() {
  const prices = Object.fromEntries(Object.entries(market).map(([symbol, data]) => [symbol, data.price]));
  const total = portfolioValue(state.cash, state.holdings, prices); const pnl = total - 10000;
  $('portfolio-value').textContent = money(total);
  $('portfolio-pnl').textContent = `${pnl >= 0 ? '+' : ''}${money(pnl)} from starting balance`;
  $('portfolio-pnl').className = pnl >= 0 ? 'up' : 'down';
  const holdingRows = Object.entries(state.holdings).filter(([, amount]) => amount > 0.0000001);
  $('holdings-list').innerHTML = `<div class="holding"><span>Available cash</span><strong>${money(state.cash)}</strong></div>` + (holdingRows.length ? holdingRows.map(([symbol, amount]) => `<div class="holding"><span>${ASSETS[symbol].short} · ${number(amount)} units</span><strong>${money(amount * (prices[symbol] || 0))}</strong></div>`).join('') : '<div class="holding"><span>No open paper positions</span><strong>—</strong></div>');
  $('journal-body').innerHTML = state.journal.length ? state.journal.slice(0, 12).map((trade) => `<tr><td>${trade.time}</td><td>${ASSETS[trade.symbol].short}/USDT</td><td class="${trade.side === 'BUY' ? 'up' : 'down'}">${trade.side}</td><td>${money(trade.price)}</td><td>${money(trade.value)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-row">Your paper trades will appear here.</td></tr>';
}

function trade(side) {
  const value = Number($('trade-amount').value); const price = market[selected]?.price;
  if (!price || !Number.isFinite(value) || value < 10) return toast('Enter an order value of at least $10');
  if (side === 'BUY' && value > state.cash) return toast('Not enough virtual cash');
  const units = value / price; const owned = state.holdings[selected] || 0;
  if (side === 'SELL' && units > owned) return toast('Not enough virtual units to sell');
  state.cash += side === 'BUY' ? -value : value;
  state.holdings[selected] = owned + (side === 'BUY' ? units : -units);
  state.journal.unshift({ time: new Date().toLocaleString(), symbol: selected, side, price, value });
  saveState(); renderPortfolio(); toast(`${side === 'BUY' ? 'Bought' : 'Sold'} ${number(units)} ${ASSETS[selected].short} on paper`);
}

function renderRisk() {
  const balance = Number($('risk-balance').value); const riskPercent = Number($('risk-percent').value); const stopPercent = Number($('stop-percent').value);
  const size = positionSize({ balance, riskPercent, stopPercent });
  $('risk-output').textContent = `${riskPercent}%`; $('position-size').textContent = money(size); $('max-loss').textContent = `Maximum planned loss: ${money(balance * riskPercent / 100)}`;
}

function exportJournal() {
  if (!state.journal.length) return toast('Place a paper trade before exporting');
  const csv = ['Time,Market,Side,Price,Value', ...state.journal.map((t) => `"${t.time}",${t.symbol},${t.side},${t.price},${t.value}`)].join('\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'signaldesk-journal.csv'; link.click(); URL.revokeObjectURL(link.href);
}

function toast(message) { $('toast').textContent = message; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2400); }
function renderAll() { renderTickers(); renderSelected(); renderPortfolio(); renderRisk(); }

$('symbol-select').addEventListener('change', (event) => { selected = event.target.value; renderSelected(); });
$('refresh-data').addEventListener('click', refreshMarket); $('paper-buy').addEventListener('click', () => trade('BUY')); $('paper-sell').addEventListener('click', () => trade('SELL'));
['risk-balance', 'risk-percent', 'stop-percent'].forEach((id) => $(id).addEventListener('input', renderRisk));
$('reset-account').addEventListener('click', () => { if (confirm('Reset the virtual account and trade journal?')) { state = { cash: 10000, holdings: {}, journal: [] }; saveState(); renderPortfolio(); toast('Paper account reset'); } });
$('export-journal').addEventListener('click', exportJournal);
refreshMarket();
