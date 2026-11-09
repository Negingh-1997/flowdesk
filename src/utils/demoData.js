// Demo data. Dates are relative to "today" so the dashboard and the 6-month
// chart stay populated no matter when the demo is opened.
import { addDays } from './format.js'

export const makeDemoData = () => ({
  customers: [
    { id: '1', fullName: 'Alex Morgan', email: 'alex@example.com', phone: '555-0101', totalFee: 360 },
    { id: '2', fullName: 'Jamie Lee', email: 'jamie@example.com', phone: '555-0102', totalFee: 240 },
    { id: '3', fullName: 'Taylor Smith', email: 'taylor@example.com', phone: '555-0103', totalFee: 200 },
  ],
  sessions: [
    { id: '1', date: addDays(0), time: '09:00', title: 'Intro consultation', customerId: '1', type: 'Consultation', status: 'Scheduled' },
    { id: '2', date: addDays(0), time: '11:30', title: 'Group workshop', customerId: '2', type: 'Group session', status: 'Scheduled' },
    { id: '3', date: addDays(0), time: '16:00', title: 'Follow-up session', customerId: '3', type: 'One-to-one', status: 'Scheduled' },
    { id: '4', date: addDays(1), time: '10:00', title: 'Progress review', customerId: '1', type: 'One-to-one', status: 'Scheduled' },
    { id: '5', date: addDays(-1), time: '15:00', title: 'Kick-off session', customerId: '2', type: 'Workshop', status: 'Done' },
  ],
  payments: [
    { id: '1', customerId: '1', description: 'Monthly membership', amount: 120, date: addDays(0), method: 'Card' },
    { id: '2', customerId: '2', description: 'Session package', amount: 240, date: addDays(-1), method: 'Cash' },
    { id: '3', customerId: '3', description: 'Monthly membership', amount: 80, date: addDays(-2), method: 'Bank transfer' },
    { id: '4', customerId: '1', description: 'Monthly membership', amount: 120, date: addDays(-33), method: 'Card' },
    { id: '5', customerId: '3', description: 'Starter fee', amount: 60, date: addDays(-64), method: 'Cash' },
  ],
})
