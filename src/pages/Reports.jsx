import { useState } from 'react'
import { useLedger } from '../hooks/useReports'
import { currentMonth } from '../utils/date'
import client from '../api/client'

export default function Reports() {
  const { data: ledger, isLoading } = useLedger(3)
  const [exportMonth, setExportMonth] = useState(currentMonth())
  const [exportError, setExportError] = useState(null)

  async function handleDownloadPdf() {
    setExportError(null)
    try {
      const res = await client.get('/reports/export', {
        params: { month: `${exportMonth}-01`, format: 'pdf' },
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${exportMonth}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(
        'Could not generate the PDF. Make sure barryvdh/laravel-dompdf is installed on the server.'
      )
    }
  }

  async function handleOpenPrint() {
    setExportError(null)
    try {
      const res = await client.get('/reports/export', {
        params: { month: `${exportMonth}-01`, format: 'html' },
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      setExportError('Could not open the report for printing.')
    }
  }

  return (
    <div className="page">
      <h1>Reports</h1>

      <section>
        <h2>Last 3 months</h2>
        {isLoading && <p>Loading…</p>}
        <table className="data-table">
          <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead>
          <tbody>
            {ledger?.map((row) => (
              <tr key={row.month}>
                <td>{row.label}</td>
                <td>Rs {row.income.toLocaleString()}</td>
                <td>Rs {row.expense.toLocaleString()}</td>
                <td className={row.net < 0 ? 'text-negative' : ''}>Rs {row.net.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Export a month</h2>
        <div className="inline-form">
          <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} />
          <button type="button" className="btn btn--primary" onClick={handleDownloadPdf}>
            Download PDF
          </button>
          <button type="button" className="btn btn--secondary" onClick={handleOpenPrint}>
            Open to print
          </button>
        </div>
        {exportError && <div className="alert alert--error">{exportError}</div>}
        <p className="text-muted">
          PDF needs <code>barryvdh/laravel-dompdf</code> installed on the server (see README-INTEGRATION.md).
          "Open to print" works with no extra package — use the browser's own Print dialog.
        </p>
      </section>
    </div>
  )
}