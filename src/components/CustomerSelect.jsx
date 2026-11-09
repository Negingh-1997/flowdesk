export default function CustomerSelect({ customers, defaultValue = '' }) {
  return (
    <select name="customerId" defaultValue={defaultValue} required>
      <option value="" disabled>Select customer</option>
      {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
    </select>
  )
}
