import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { t } from '../../services/translations'

interface Visitor {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  visit_type: string
  service_type: string | null
  photo_format: string | null
  app_complete: boolean | null
  checklist: string | null
  notes: string
  status: string
  check_in_at: string
  sign_out_at: string | null
}

function serviceLabel(s: string | null): string {
  switch (s) {
    case 'passports': return 'Passports'
    case 'notary': return 'Notary'
    case 'photo-only': return 'Photo Only'
    default: return 'Questions / Returning'
  }
}

function mark(v: boolean | null) {
  if (v === true) return <span className="label label-success">✓</span>
  if (v === false) return <span className="label label-danger">✗</span>
  return <span className="label label-default">—</span>
}

export default function VisitorLog() {
  const { auth, currentLanguage } = useApp()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [loading, setLoading] = useState(true)
  const locId = auth?.locationId || 'csc'
  const lang = currentLanguage

  const fetchVisitors = useCallback(async () => {
    if (!auth) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ location: locId })
      if (filterDate) params.set('date', filterDate)
      if (search) params.set('search', search)
      const res = await fetch(`/api/visitors?${params}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) setVisitors(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [auth, locId, search, filterDate])

  useEffect(() => {
    fetchVisitors()
    const handler = () => fetchVisitors()
    window.addEventListener('visitor-update', handler)
    return () => window.removeEventListener('visitor-update', handler)
  }, [fetchVisitors])

  const signOut = async (id: string) => {
    if (!auth) return
    await fetch(`/api/visitors/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ status: 'Signed Out' }),
    })
    fetchVisitors()
  }

  const saveNotes = async (id: string, notes: string) => {
    if (!auth) return
    await fetch(`/api/visitors/${id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ notes: notes.slice(0, 100) }),
    })
  }

  const exportCSV = async () => {
    if (!auth) return
    const res = await fetch(`/api/visitors/export?location=${locId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `visitors_${locId}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 className="page-header" style={{ margin: 0, border: 'none' }}>{t('visitorLog.title', undefined, lang)}</h2>
        <button className="btn btn-primary" onClick={exportCSV}>
          <span className="glyphicon glyphicon-download-alt" style={{ marginRight: 6 }}></span>
          {t('visitorLog.export', undefined, lang)}
        </button>
      </div>

      <div className="panel panel-default" style={{ background: '#f8f8f8', marginBottom: '1.5rem' }}>
        <div className="panel-body">
          <div className="row">
            <div className="col-sm-5">
              <input type="text" className="form-control" placeholder={t('visitorLog.search', undefined, lang)}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-sm-3">
              <input type="date" className="form-control" value={filterDate}
                onChange={e => setFilterDate(e.target.value)} />
            </div>
            <div className="col-sm-2">
              <button className="btn btn-default btn-block" onClick={() => { setSearch(''); setFilterDate('') }}>
                {t('visitorLog.clear', undefined, lang)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="table-responsive">
          <table className="table table-striped table-hover" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>{t('visitorLog.colVisitor', undefined, lang)}</th>
                <th>{t('visitorLog.colService', undefined, lang)}</th>
                <th>{t('visitorLog.colStatus', undefined, lang)}</th>
                <th style={{ textAlign: 'center' }}>{t('visitorLog.colApp', undefined, lang)}</th>
                <th style={{ textAlign: 'center' }}>{t('visitorLog.colPhoto', undefined, lang)}</th>
                <th style={{ textAlign: 'center' }}>{t('visitorLog.colCitizen', undefined, lang)}</th>
                <th style={{ textAlign: 'center' }}>{t('visitorLog.colId', undefined, lang)}</th>
                <th style={{ textAlign: 'center' }}>{t('visitorLog.colPayment', undefined, lang)}</th>
                <th>{t('visitorLog.colNotes', undefined, lang)}</th>
                <th>{t('visitorLog.colAction', undefined, lang)}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>{t('visitorLog.loading', undefined, lang)}</td></tr>
              ) : visitors.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>{t('visitorLog.noRecords', undefined, lang)}</td></tr>
              ) : visitors.map(v => {
                const checkIn = new Date(v.check_in_at)
                const dateStr = checkIn.toLocaleDateString()
                const timeStr = checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const outStr = v.sign_out_at
                  ? new Date(v.sign_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—'
                const cl = v.checklist ? JSON.parse(v.checklist) : {}
                const isPass = v.service_type === 'passports'
                const chk = (f: string) => isPass ? mark(cl[f]) : <span className="label label-default">—</span>

                return (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.first_name} {v.last_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#6B7C96' }}>{v.email || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7C96' }}>{v.phone}</div>
                    </td>
                    <td>
                      <span className="label label-primary">{serviceLabel(v.service_type)}</span>
                      <div style={{ fontSize: '0.8rem', color: '#6B7C96', marginTop: 4 }}>
                        {v.visit_type === 'walk-in' ? 'Walk-in' : v.visit_type === 'appointment' ? 'Appt' : 'Return'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span className={`label ${v.status === 'Checked In' ? 'label-success' : 'label-default'}`}>
                        {v.status}
                      </span>
                      <div style={{ color: '#6B7C96', fontSize: '0.8rem', marginTop: 4 }}>
                        {dateStr} {timeStr}
                      </div>
                      <div style={{ color: '#6B7C96', fontSize: '0.8rem' }}>
                        {t('visitorLog.signedOut', undefined, lang)}: {outStr}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{isPass ? mark(v.app_complete) : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{chk('photo')}</td>
                    <td style={{ textAlign: 'center' }}>{chk('citizenship')}</td>
                    <td style={{ textAlign: 'center' }}>{chk('id')}</td>
                    <td style={{ textAlign: 'center' }}>{chk('payment')}</td>
                    <td>
                      <input type="text" className="form-control input-sm" style={{ width: 110 }}
                        defaultValue={v.notes || ''} maxLength={100} placeholder={t('visitorLog.addNote', undefined, lang)}
                        onBlur={e => saveNotes(v.id, e.target.value)} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {v.status === 'Checked In' ? (
                        <button className="btn btn-primary btn-xs" onClick={() => signOut(v.id)}>
                          {t('visitorLog.signOut', undefined, lang)}
                        </button>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>{t('visitorLog.signedOut', undefined, lang)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
