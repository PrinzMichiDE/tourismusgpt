import * as React from 'react';

interface DiscrepancyAlertProps {
  recipientName: string;
  poiName: string;
  poiId: string;
  auditScore: number;
  discrepancies: Array<{
    field: string;
    tldbValue: string;
    websiteValue: string;
    mapsValue: string;
  }>;
  dashboardUrl: string;
  locale?: 'de' | 'en';
}

export function DiscrepancyAlert({
  recipientName,
  poiName,
  poiId,
  auditScore,
  discrepancies,
  dashboardUrl,
  locale = 'de',
}: DiscrepancyAlertProps) {
  const isGerman = locale === 'de';

  const texts = {
    greeting: isGerman ? `Guten Tag ${recipientName},` : `Hello ${recipientName},`,
    intro: isGerman
      ? `bei der automatischen Qualitätsprüfung des POI "${poiName}" wurden Datenabweichungen festgestellt.`
      : `during the automatic quality check of POI "${poiName}", data discrepancies were found.`,
    score: isGerman ? 'Qualitäts-Score' : 'Quality Score',
    discrepanciesTitle: isGerman ? 'Festgestellte Abweichungen' : 'Detected Discrepancies',
    field: isGerman ? 'Feld' : 'Field',
    tldb: 'TLDB',
    website: 'Website',
    maps: 'Google Maps',
    ctaText: isGerman ? 'Details im Dashboard ansehen' : 'View Details in Dashboard',
    outro: isGerman
      ? 'Bitte prüfen Sie die Daten und aktualisieren Sie diese bei Bedarf.'
      : 'Please review the data and update it if necessary.',
    footer: isGerman
      ? 'Diese E-Mail wurde automatisch von LDB-DataGuard versendet.'
      : 'This email was automatically sent by LDB-DataGuard.',
    unsubscribe: isGerman
      ? 'Um keine weiteren Benachrichtigungen zu erhalten, kontaktieren Sie Ihren Administrator.'
      : 'To stop receiving notifications, contact your administrator.',
  };

  const scoreColor = auditScore >= 80 ? '#22c55e' : auditScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {isGerman ? 'Datenabweichung festgestellt' : 'Data Discrepancy Detected'}
        </title>
      </head>
      <body
        style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f5f5f5',
          margin: 0,
          padding: '20px',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#0066cc',
              color: '#ffffff',
              padding: '24px',
              textAlign: 'center' as const,
            }}
          >
            <h1 style={{ margin: 0, fontSize: '24px' }}>LDB-DataGuard</h1>
            <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
              {isGerman ? 'Qualitätsprüfung' : 'Quality Check'}
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '16px', color: '#333' }}>{texts.greeting}</p>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
              {texts.intro}
            </p>

            {/* Score Badge */}
            <div
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
                margin: '20px 0',
                textAlign: 'center' as const,
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                {texts.score}
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: scoreColor,
                }}
              >
                {auditScore}
              </p>
            </div>

            {/* Discrepancies Table */}
            {discrepancies.length > 0 && (
              <div style={{ margin: '20px 0' }}>
                <h3 style={{ fontSize: '16px', color: '#333' }}>
                  {texts.discrepanciesTitle}
                </h3>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th
                        style={{
                          padding: '8px',
                          textAlign: 'left' as const,
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {texts.field}
                      </th>
                      <th
                        style={{
                          padding: '8px',
                          textAlign: 'left' as const,
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {texts.tldb}
                      </th>
                      <th
                        style={{
                          padding: '8px',
                          textAlign: 'left' as const,
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {texts.website}
                      </th>
                      <th
                        style={{
                          padding: '8px',
                          textAlign: 'left' as const,
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {texts.maps}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {discrepancies.slice(0, 5).map((d, i) => (
                      <tr key={i}>
                        <td
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid #eee',
                            fontWeight: 'bold',
                          }}
                        >
                          {d.field}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid #eee',
                          }}
                        >
                          {d.tldbValue || '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid #eee',
                            color: d.websiteValue !== d.tldbValue ? '#ef4444' : 'inherit',
                          }}
                        >
                          {d.websiteValue || '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid #eee',
                            color: d.mapsValue !== d.tldbValue ? '#ef4444' : 'inherit',
                          }}
                        >
                          {d.mapsValue || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
              {texts.outro}
            </p>

            {/* CTA Button */}
            <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <a
                href={`${dashboardUrl}/dashboard/poi/${poiId}`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#0066cc',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                {texts.ctaText}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '16px 24px',
              borderTop: '1px solid #eee',
              textAlign: 'center' as const,
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
              {texts.footer}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#bbb' }}>
              {texts.unsubscribe}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

export default DiscrepancyAlert;
