import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { t } from '../../services/translations'

export default function QrCode() {
  const { auth, currentLanguage } = useApp()
  const [qrUrl, setQrUrl] = useState('')
  const locId = auth?.locationId || 'csc'
  const locName = locId === 'bookstore' ? 'Bookstore' : 'CSC'
  const lang = currentLanguage

  useEffect(() => {
    const base = `${window.location.protocol}//${window.location.host}`
    setQrUrl(`${base}/mobile/${locId}`)
  }, [locId])

  const openPrintView = () => {
    const w = window.open('', '_blank', 'width=400,height=600')
    if (!w) return
    w.document.write(`
      <html><head><title>QR Code — ${locName}</title>
      <style>
        body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
        .qr-wrap { text-align: center; padding: 2rem; }
        img { max-width: 280px; }
        p { margin-top: 1rem; font-size: 0.9rem; color: #555; word-break: break-all; }
      </style>
      </head><body>
      <div class="qr-wrap">
        <h2>${locName} Check-In</h2>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrUrl)}" alt="QR Code" />
        <p>Scan to check in on your phone</p>
        <p>${qrUrl}</p>
      </div>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <>
      <h2 className="page-header">{t('qr.title', { location: locName }, lang)}</h2>
      <p className="lead">{t('qr.desc', { location: locName }, lang)}</p>

      <div className="row">
        <div className="col-sm-6 col-sm-offset-3">
          <div className="panel panel-default" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="panel-body">
              <h3>
                <span className="glyphicon glyphicon-phone" style={{ marginRight: 8 }}></span>
                {t('qr.heading', { location: locName }, lang)}
              </h3>
              <div style={{ margin: '1.5rem 0' }}>
                {qrUrl && (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                    alt="Check-In QR Code"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6B7C96', wordBreak: 'break-all' }}>{qrUrl}</p>
              <button className="btn btn-default" onClick={openPrintView}>
                <span className="glyphicon glyphicon-print" style={{ marginRight: 6 }}></span>
                {t('qr.print', undefined, lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
