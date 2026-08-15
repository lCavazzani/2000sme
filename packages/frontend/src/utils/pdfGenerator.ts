import { generatePrintHtml } from '../constants/printTemplate'

export function openPrintWindow(htmlContent: string): void {
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) return

  const html = generatePrintHtml(htmlContent)
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
