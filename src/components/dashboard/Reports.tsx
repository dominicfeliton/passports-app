import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { t } from '../../services/translations'

interface Stats {
  total: number
  passports_count: number
  notary_count: number
  photo_only_count: number
  returning_count: number
  prep_rate: number
  walk_in_percent: number
  incomplete_app_count: number
  missing_photo_count: number
  missing_citizenship_count: number
  missing_id_count: number
  missing_payment_count: number
}

export default function Reports() {
  const { auth, currentLanguage } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const locId = auth?.locationId || 'csc'
  const lang = currentLanguage

  const fetchStats = useCallback(async () => {
    if (!auth) return
    try {
      const res = await fetch(`/api/stats?location=${locId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.ok) setStats(await res.json())
    } catch { /* ignore */ }
  }, [auth, locId])

  useEffect(() => {
    fetchStats()
    const handler = () => fetchStats()
    window.addEventListener('visitor-update', handler)
    return () => window.removeEventListener('visitor-update', handler)
  }, [fetchStats])

  if (!stats) return <p style={{ color: '#999' }}>{t('visitorLog.loading', undefined, lang)}</p>

  const barColor = '#00629B'
  const dangerColor = '#E05D5D'

  const maxService = Math.max(stats.passports_count, stats.notary_count, stats.photo_only_count, stats.returning_count, 1)
  const maxMissing = Math.max(stats.missing_photo_count, stats.missing_citizenship_count, stats.missing_id_count, stats.missing_payment_count, stats.incomplete_app_count, 1)

  const Bar = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => (
    <div className="row" style={{ marginBottom: '0.75rem', alignItems: 'center' }}>
      <div className="col-sm-4" style={{ fontWeight: 500, fontSize: '0.9rem' }}>{label}</div>
      <div className="col-sm-6">
        <div className="progress" style={{ height: 24, margin: 0 }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${(value / max) * 100}%`, background: color, lineHeight: '24px', fontSize: '0.85rem' }}
          >
            {value > 0 ? value : ''}
          </div>
        </div>
      </div>
      <div className="col-sm-2" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{value}</div>
    </div>
  )

  return (
    <>
      <h2 className="page-header">{t('reports.title', undefined, lang)}</h2>

      <div className="row" style={{ marginBottom: '2rem' }}>
        <div className="col-sm-4">
          <div className="panel panel-primary">
            <div className="panel-heading"><h3 className="panel-title">{t('reports.totalVisits', undefined, lang)}</h3></div>
            <div className="panel-body text-center">
              <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.total}</span>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="panel panel-primary">
            <div className="panel-heading"><h3 className="panel-title">{t('reports.preparationRate', undefined, lang)}</h3></div>
            <div className="panel-body text-center">
              <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.prep_rate}%</span>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="panel panel-primary">
            <div className="panel-heading"><h3 className="panel-title">{t('reports.walkinRatio', undefined, lang)}</h3></div>
            <div className="panel-body text-center">
              <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.walk_in_percent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading"><h3 className="panel-title">{t('reports.byService', undefined, lang)}</h3></div>
        <div className="panel-body">
          <Bar value={stats.passports_count} max={maxService} color={barColor} label="Passports" />
          <Bar value={stats.notary_count} max={maxService} color={barColor} label="Notary" />
          <Bar value={stats.photo_only_count} max={maxService} color={barColor} label="Photo Only" />
          <Bar value={stats.returning_count} max={maxService} color={barColor} label="Questions / Returning" />
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading"><h3 className="panel-title">{t('reports.documentIssues', undefined, lang)}</h3></div>
        <div className="panel-body">
          <p style={{ color: '#6B7C96', fontSize: '0.85rem' }}>
            {t('reports.among', { count: stats.passports_count }, lang)}
          </p>
          <Bar value={stats.incomplete_app_count} max={maxMissing} color={dangerColor} label="Incomplete Application" />
          <Bar value={stats.missing_photo_count} max={maxMissing} color={dangerColor} label="Missing Photo" />
          <Bar value={stats.missing_citizenship_count} max={maxMissing} color={dangerColor} label="Missing Citizenship" />
          <Bar value={stats.missing_id_count} max={maxMissing} color={dangerColor} label="Missing ID" />
          <Bar value={stats.missing_payment_count} max={maxMissing} color={dangerColor} label="Missing Payment" />
        </div>
      </div>
    </>
  )
}
