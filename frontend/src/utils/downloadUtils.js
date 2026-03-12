/**
 * Download an array of objects as a CSV file.
 * @param {Object[]} rows - Array of flat objects to export.
 * @param {string} filename - Filename without extension.
 */
export const downloadCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return
    const headers = Object.keys(rows[0])
    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`
    const csv = [
        headers.map(escape).join(','),
        ...rows.map(row => headers.map(h => escape(row[h])).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Download a react-chartjs-2 chart as a PNG image.
 * @param {React.RefObject} chartRef - Ref to the chart component (gives Chart.js instance).
 * @param {string} filename - Filename without extension.
 */
export const downloadChartPNG = (chartRef, filename, title = null) => {
    if (!chartRef?.current) return
    const chartCanvas = chartRef.current.canvas
    const titleHeight = title ? 48 : 0
    const padding = title ? 16 : 0
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = chartCanvas.width
    tempCanvas.height = chartCanvas.height + titleHeight
    const ctx = tempCanvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    if (title) {
        ctx.fillStyle = '#111111'
        ctx.font = `bold ${Math.round(chartCanvas.width * 0.022)}px sans-serif`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(title, padding, titleHeight / 2)
    }
    ctx.drawImage(chartCanvas, 0, titleHeight)
    const url = tempCanvas.toDataURL('image/png', 1.0)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
