/**
 * exportAnalyticsPDF
 * Captures a DOM element (the analytics dashboard) and exports it as a PDF.
 * Uses jsPDF + html2canvas — both already installed.
 */
export const exportAnalyticsPDF = async (
  elementId: string,
  filename = 'analytics-report.pdf'
): Promise<void> => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element #${elementId} not found`)
  }

  // Dynamic imports to keep bundle lean
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10

  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Add header
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('CivicConnect — Analytics Report', margin, margin + 5)

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100)
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 11)
  pdf.setTextColor(0)

  const contentY = margin + 16

  // If content fits on one page
  if (imgHeight + contentY <= pageHeight - margin) {
    pdf.addImage(imgData, 'PNG', margin, contentY, imgWidth, imgHeight)
  } else {
    // Multi-page: slice the canvas into page-height chunks
    const pageContentHeight = pageHeight - contentY - margin
    const totalPages = Math.ceil(imgHeight / pageContentHeight)

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage()
      }
      const srcY = (i * pageContentHeight * canvas.height) / imgHeight
      const srcH = Math.min(
        (pageContentHeight * canvas.height) / imgHeight,
        canvas.height - srcY
      )
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = srcH
      const ctx = sliceCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)
      }
      const sliceData = sliceCanvas.toDataURL('image/png')
      const sliceHeight = (srcH * imgWidth) / canvas.width
      pdf.addImage(sliceData, 'PNG', margin, i === 0 ? contentY : margin, imgWidth, sliceHeight)
    }
  }

  pdf.save(filename)
}
