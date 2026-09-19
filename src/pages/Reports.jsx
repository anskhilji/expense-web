import { useEffect, useMemo, useRef, useState } from 'react'
import { useLedger } from '../hooks/useReports'
import { currentMonth } from '../utils/date'
import client from '../api/client'

export default function Reports() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLedger(10)
  const [exportMonth, setExportMonth] = useState(currentMonth())
  const [exportError, setExportError] = useState(null)
  const [search, setSearch] = useState('')
  const sentinelRef = useRef(null)

  const ledger = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const filteredLedger = useMemo(
    () => ledger.filter((row) => row.label.toLowerCase().includes(search.trim().toLowerCase())),
    [ledger, search]
  )

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '0px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

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
        <h2>Monthly ledger</h2>
        {isLoading && <p>Loading…</p>}
        <input
          type="text"
          className="search-input"
          placeholder="Search months…"
          title="Search by month"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <table className="data-table">
          <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead>
          <tbody>
            {filteredLedger.map((row) => (
              <tr key={row.month}>
                <td>{row.label}</td>
                <td>Rs {row.income.toLocaleString()}</td>
                <td>Rs {row.expense.toLocaleString()}</td>
                <td className={row.net < 0 ? 'text-negative' : ''}>Rs {row.net.toLocaleString()}</td>
              </tr>
            ))}
            {!isLoading && filteredLedger.length === 0 && (
              <tr><td colSpan={4} className="text-muted">No months match "{search}".</td></tr>
            )}
            <tr ref={sentinelRef}>
              <td colSpan={4} className="text-muted" style={{ textAlign: 'center' }}>
                {isFetchingNextPage ? 'Loading more…' : (!hasNextPage && ledger.length > 0 ? 'End of list.' : '')}
              </td>
            </tr>
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
