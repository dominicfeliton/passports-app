import { useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { t } from '../../services/translations'
import { usePolling } from '../../hooks/usePolling'
import ToastContainer from '../shared/Toast'

const POLL_INTERVAL_MS = 10_000

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth, currentLanguage } = useApp()
  const lang = currentLanguage

  useEffect(() => {
    if (!auth) navigate('/dashboard/login', { replace: true })
  }, [auth, navigate])

  usePolling({
    intervalMs: POLL_INTERVAL_MS,
    onPoll: () => window.dispatchEvent(new CustomEvent('visitor-update')),
    enabled: !!auth,
  })

  if (!auth) return null

  const locName = auth.locationId === 'bookstore' ? 'Bookstore' : 'CSC'
  const tabs = [
    { path: '/dashboard/visitor-log', label: 'nav.visitorLog' },
    { path: '/dashboard/questions', label: 'nav.formQuestions' },
    { path: '/dashboard/subscribers', label: 'subscribers.title' },
    { path: '/dashboard/reports', label: 'nav.reports' },
    { path: '/dashboard/qr', label: 'qr.title' },
  ]

  return (
    <div className="layout-main" id="main-content" role="main">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div className="row">
          <div className="col-sm-3">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">{locName} Dashboard</h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <ul className="nav nav-pills nav-stacked" style={{ margin: 0 }}>
                  {tabs.map(tab => {
                    const tabLabel = tab.label.includes('.') ? t(tab.label, { location: locName }, lang) : tab.label
                    return (
                      <li key={tab.path} className={location.pathname === tab.path ? 'active' : ''} style={{ margin: 0 }}>
                        <a href={tab.path} onClick={e => { e.preventDefault(); navigate(tab.path) }}
                          style={{ borderRadius: 0 }}>
                          <span className={`glyphicon glyphicon-${
                            tab.label === 'nav.visitorLog' ? 'list-alt' :
                            tab.label === 'nav.formQuestions' ? 'edit' :
                            tab.label === 'subscribers.title' ? 'envelope' :
                            tab.label === 'nav.reports' ? 'signal' : 'phone'
                          }`} style={{ marginRight: 8 }}></span>
                          {tabLabel}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
            <div className="text-center" style={{ marginTop: '0.5rem' }}>
              <a href="/" onClick={e => { e.preventDefault(); navigate('/') }}
                className="btn btn-default btn-sm">
                <span className="glyphicon glyphicon-chevron-left" style={{ marginRight: 4 }}></span>
                {t('nav.home', undefined, lang)}
              </a>
            </div>
          </div>

          <div className="col-sm-9">
            <Outlet />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
