import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cleanMoney, cleanStr, isDate, isEmail, isPhone, isTime, parseMoney, pickChoice,
  sanitizeCustomers, sanitizePayments, sanitizeSessions, sanitizeTheme, MAX_MONEY,
} from './sanitize.js'

test('isDate rejects impossible and out-of-range dates', () => {
  assert.equal(isDate('2026-02-28'), true)
  assert.equal(isDate('2026-02-31'), false)
  assert.equal(isDate('2026-13-01'), false)
  assert.equal(isDate('0050-01-01'), false)
  assert.equal(isDate('2026-1-1'), false)
  assert.equal(isDate(20260101), false)
})

test('isTime accepts HH:MM only', () => {
  assert.equal(isTime('09:30'), true)
  assert.equal(isTime('24:00'), false)
  assert.equal(isTime('9:30'), false)
})

test('parseMoney is strict, cleanMoney is tolerant', () => {
  assert.equal(parseMoney('12.345'), 12.35)
  assert.equal(parseMoney(''), null)
  assert.equal(parseMoney('-1'), null)
  assert.equal(parseMoney('abc'), null)
  assert.equal(parseMoney(MAX_MONEY + 1), null)
  assert.equal(cleanMoney('abc'), 0)
  assert.equal(cleanMoney(-5), 0)
  assert.equal(cleanMoney(MAX_MONEY * 2), MAX_MONEY)
})

test('email, phone and choice checks', () => {
  assert.equal(isEmail('a@b.co'), true)
  assert.equal(isEmail('a@b'), false)
  assert.equal(isPhone('+1 (555) 010-1234'), true)
  assert.equal(isPhone('555<script>'), false)
  assert.equal(pickChoice('Card', ['Cash', 'Card']), 'Card')
  assert.equal(pickChoice('Bitcoin', ['Cash', 'Card']), '')
  assert.equal(pickChoice('Legacy', ['Cash'], 'Legacy'), 'Legacy')
})

test('cleanStr trims, truncates and rejects non-strings', () => {
  assert.equal(cleanStr('  hi  ', 10), 'hi')
  assert.equal(cleanStr('abcdef', 3), 'abc')
  assert.equal(cleanStr({ toString: () => 'x' }, 10), '')
})

test('sanitizeCustomers drops invalid and duplicate entries', () => {
  const out = sanitizeCustomers([
    { id: 1, fullName: ' Ann ', totalFee: '100' },
    { id: '1', fullName: 'Duplicate id' },
    { id: '2', fullName: '' },
    'not an object',
    { id: '3', fullName: 'Bob', totalFee: -10, email: 42 },
  ])
  assert.deepEqual(out.map((c) => c.fullName), ['Ann', 'Bob'])
  assert.equal(out[0].totalFee, 100)
  assert.equal(out[1].totalFee, 0)
  assert.equal(out[1].email, '')
  assert.equal(sanitizeCustomers('nope'), undefined)
})

test('sanitizeSessions and sanitizePayments validate required fields', () => {
  const sessions = sanitizeSessions([
    { id: 'a', customerId: 'c', title: 'T', time: '10:00', date: '2026-11-08', status: 'Done' },
    { id: 'b', customerId: 'c', title: 'T', time: '25:00' },
    { id: 'c', customerId: 'c', title: 'T', time: '10:00', status: 'weird' },
  ])
  assert.equal(sessions.length, 2)
  assert.equal(sessions[0].status, 'Done')
  assert.equal(sessions[1].status, 'Scheduled')

  const payments = sanitizePayments([
    { id: 'p', customerId: 'c', date: '2026-11-08', amount: '25.5' },
    { id: 'q', customerId: 'c', date: 'yesterday', amount: 5 },
  ])
  assert.equal(payments.length, 1)
  assert.equal(payments[0].amount, 25.5)
})

test('sanitizeTheme only allows dark or light', () => {
  assert.equal(sanitizeTheme('dark'), 'dark')
  assert.equal(sanitizeTheme('purple'), undefined)
})
