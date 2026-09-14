export function currentMonth() {
  return new Date().toISOString().slice(0, 7) // "YYYY-MM"
}

export function today() {
  return new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
}

export function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}
