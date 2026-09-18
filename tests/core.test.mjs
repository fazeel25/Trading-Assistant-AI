import test from 'node:test';
import assert from 'node:assert/strict';
import { portfolioValue, positionSize, rsi, signalFromIndicators, sma } from '../public/core.js';

test('calculates moving average', () => assert.equal(sma([1, 2, 3, 4], 2), 3.5));
test('RSI reaches 100 for uninterrupted gains', () => assert.equal(rsi([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]), 100));
test('risk sizing never exceeds balance', () => assert.equal(positionSize({ balance: 1000, riskPercent: 2, stopPercent: 1 }), 1000));
test('signal engine identifies aligned bullish setup', () => assert.equal(signalFromIndicators({ price: 110, ma20: 105, ma50: 100, rsiValue: 30 }).action, 'BUY WATCH'));
test('portfolio includes marked-to-market holdings', () => assert.equal(portfolioValue(500, { BTCUSDT: 0.01 }, { BTCUSDT: 50000 }), 1000));
