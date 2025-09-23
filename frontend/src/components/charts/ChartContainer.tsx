import React, { useRef } from 'react';

interface Trend {
  metric: string;
  current: string;
  trend: string;
  prediction: string;
  confidence: string;
}

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  trends?: Trend[];
  insights?: string[];
  recommendations?: string[];
  headerRight?: React.ReactNode;        // UI controls next to the title (e.g., filters)
  printContextNote?: string;            // Extra note to show in the print template (e.g., "Datos de: Terapeuta X")
  contentHeight?: number;               // Height in px for the chart area (default ~ h-96 = 384)
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, trends, insights, recommendations, headerRight, printContextNote, contentHeight }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = async () => {
    const container = chartRef.current;
    if (!container) return;

    // Esperar a que Recharts y overlays terminen de renderizar
    await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 80)));

    let dataURL: string | null = null;

    // 1) Preferir html2canvas para capturar SVG + overlays HTML (ej. Gauge labels)
    try {
      const { default: html2canvas } = await import('html2canvas');
      const bounds = container.getBoundingClientRect();
      const canvas = await html2canvas(container as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        width: Math.ceil(bounds.width),
        height: Math.ceil(bounds.height),
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        foreignObjectRendering: true
      });
      dataURL = canvas.toDataURL('image/png');
    } catch (e) {
      console.warn('html2canvas falló, intentando captura SVG directa.', e);
    }

    // 2) Fallback: serializar SVG (sin overlays HTML)
    if (!dataURL) {
      try {
        const svg = container.querySelector('svg') as SVGSVGElement | null;
        if (svg) {
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svg);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const rect = svg.getBoundingClientRect();
          const width = Math.max(Math.floor(rect.width), 300);
          const height = Math.max(Math.floor(rect.height), 200);

          dataURL = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = width * 2;
                canvas.height = height * 2;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('No 2d context');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const out = canvas.toDataURL('image/png');
                URL.revokeObjectURL(url);
                resolve(out);
              } catch (err) {
                URL.revokeObjectURL(url);
                reject(err);
              }
            };
            img.onerror = (err) => {
              URL.revokeObjectURL(url);
              reject(err);
            };
            img.src = url;
          });
        }
      } catch (err) {
        console.error('Captura SVG también falló.', err);
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const chartContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title} - SIGIEA</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #374151;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 14px;
              color: #6b7280;
            }
            .chart-container {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .chart-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 6px;
              color: #111827;
            }
            .chart-context {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 12px;
            }
            .chart-area {
              min-height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f9fafb;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .chart-area img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            .trends-section, .insights-section, .recommendations-section {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 12px;
              color: #111827;
            }
            .trend-item, .insight-item {
              background: #fef7ff;
              border: 1px solid #e9d5ff;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 12px;
            }
            .insight-item {
              background: #eff6ff;
              border-color: #bfdbfe;
            }
            .trend-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            .trend-metric {
              font-weight: 600;
              color: #111827;
            }
            .trend-confidence {
              font-size: 12px;
              padding: 4px 8px;
              border-radius: 12px;
              font-weight: 500;
            }
            .confidence-alta { background: #dcfce7; color: #166534; }
            .confidence-media { background: #fef3c7; color: #92400e; }
            .confidence-baja { background: #f3f4f6; color: #374151; }
            .print-date {
              text-align: right;
              font-size: 12px;
              color: #6b7280;
              margin-top: 20px;
            }
            .insight-content {
              display: flex;
              align-items: flex-start;
              gap: 8px;
            }
            .insight-dot {
              width: 8px;
              height: 8px;
              background: #3b82f6;
              border-radius: 50%;
              margin-top: 4px;
              flex-shrink: 0;
            }
            @media print {
              body { margin: 0; }
              .chart-area { min-height: 260px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            <div class="subtitle">Sistema de Información y Gestión Educativa de Autismo</div>
          </div>

          <div class="chart-container">
            <div class="chart-title">${title}</div>
            ${printContextNote ? `<div class="chart-context">${printContextNote}</div>` : ''}
            <div class="chart-area">
              ${dataURL
                ? `<img id="chartImage" alt="Grafico ${title}" src="${dataURL}" />`
                : `<span style="color: #6b7280; font-size: 14px;">Gráfico: ${title}</span>`
              }
            </div>

            ${trends && trends.length > 0 ? `
              <div class="trends-section">
                <h4 class="section-title">Indicadores de Tendencia</h4>
                ${trends.map(trend => `
                  <div class="trend-item">
                    <div class="trend-header">
                      <span class="trend-metric">${trend.metric}</span>
                      <span class="trend-confidence confidence-${trend.confidence.toLowerCase().replace('media-', 'media').replace('alta', 'alta').replace('baja', 'baja')}">${trend.confidence}</span>
                    </div>
                    <p style="font-size: 12px; color: #6b7280; margin: 4px 0;">
                      <strong>${trend.current}</strong> actual
                    </p>
                    <p style="font-size: 12px; color: #6b7280; margin: 4px 0;">
                      <strong style="color: #7c3aed;">${trend.prediction}</strong> pronóstico
                    </p>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${insights && insights.length > 0 ? `
              <div class="insights-section">
                <h4 class="section-title">Información Adicional</h4>
                ${insights.map(insight => `
                  <div class="insight-item">
                    <div class="insight-content">
                      <div class="insight-dot"></div>
                      <p style="font-size: 12px; color: #374151; margin: 0;">${insight}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${recommendations && recommendations.length > 0 ? `
              <div class="recommendations-section">
                <h4 class="section-title">Recomendaciones</h4>
                ${recommendations.map(rec => `
                  <div class="insight-item">
                    <div class="insight-content">
                      <div class="insight-dot"></div>
                      <p style="font-size: 12px; color: #374151; margin: 0;">${rec}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="print-date">
            Generado el ${new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(chartContent);
    printWindow.document.close();

    const img = printWindow.document.getElementById('chartImage') as HTMLImageElement | null;
    if (img && !img.complete) {
      img.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      img.onerror = () => {
        printWindow.print();
        printWindow.close();
      };
    } else {
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
          {headerRight ? <div className="flex items-center">{headerRight}</div> : null}
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg hover:shadow-xl"
          title="Imprimir gráfico"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div
          ref={chartRef}
          className="bg-white"
          style={{ height: contentHeight ?? 384 }}
        >
          {children}
        </div>
      </div>

      {/* Insights and Trends */}
      {(trends && trends.length > 0) || (insights && insights.length > 0) || (recommendations && recommendations.length > 0) ? (
        <div className="px-6 pb-6 space-y-6">
          {trends && trends.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h4 className="text-base font-semibold text-gray-900">Tendencia</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {trends.map((trend, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100/50">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-semibold text-gray-900 text-sm leading-tight">{trend.metric}</h5>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trend.confidence === 'Alta' ? 'bg-green-100 text-green-800 border border-green-200' :
                        trend.confidence === 'Media-Alta' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {trend.confidence}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{trend.current}</span>
                        <span className="ml-1">actual</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-purple-700">{trend.prediction}</span>
                        <span className="ml-1">pronóstico</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights && insights.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h4 className="text-base font-semibold text-gray-900">Información Adicional</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations && recommendations.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                <h4 className="text-base font-semibold text-gray-900">Recomendaciones</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100/50">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ChartContainer;