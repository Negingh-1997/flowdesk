import test from 'node:test'
import assert from 'node:assert/strict'
import { addDays, formatMoney, isUpcoming, percentPaid, remaining, sumMoney, toISODate } from './format.js'

test('sumMoney does not drift on decimals', () => {
  assert.equal(sumMoney([0.1, 0.2]), 0.3)
  assert.equal(sumMoney([]), 0)
})

test('remaining never goes below zero', () => {
  assert.equal(remaining(100, 30.5), 69.5)
  assert.equal(remaining(100, 150), 0)
})

test('percentPaid is clamped and handles a zero fee', () => {
  assert.equal(percentPaid(200, 50), 25)
  assert.equal(percentPaid(100, 500), 100)
  assert.equal(percentPaid(0, 0), 0)
  assert.equal(percentPaid(0, 10), 100)
})

test('formatMoney shows cents only when needed', () => {
  assert.equal(formatMoney(120), '$120')
  assert.equal(formatMoney(12.5), '$12.50')
  assert.equal(formatMoney('abc'), '$0')
})

test('addDays uses local calendar dates', () => {
  const from = new Date(2026, 0, 31)
  assert.equal(addDays(1, from), '2026-02-01')
  assert.equal(addDays(-31, from), '2025-12-31')
  assert.equal(toISODate(new Date(2026, 10, 8)), '2026-11-08')
})

test('isUpcoming needs Scheduled status and a date that is not past', () => {
  assert.equal(isUpcoming({ status: 'Scheduled', date: '2026-11-08' }, '2026-11-08'), true)
  assert.equal(isUpcoming({ status: 'Scheduled', date: '2026-11-07' }, '2026-11-08'), false)
  assert.equal(isUpcoming({ status: 'Done', date: '2026-11-09' }, '2026-11-08'), false)
})
