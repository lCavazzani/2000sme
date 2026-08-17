import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { openPrintWindowMock } = vi.hoisted(() => ({ openPrintWindowMock: vi.fn() }))

vi.mock('../utils/pdfGenerator', () => ({
  openPrintWindow: openPrintWindowMock,
}))

import { WordPad } from './WordPad'

describe('WordPad resume viewer', () => {
  beforeEach(() => {
    openPrintWindowMock.mockReset()
  })

  it('makes PDF download the visible working action and keeps preview controls semantically disabled', () => {
    openPrintWindowMock.mockReturnValue(true)
    render(<WordPad />)

    const download = screen.getByRole('button', { name: 'Download resume (PDF)' })
    expect(download).toBeEnabled()
    expect(screen.getByText('Read-only resume preview')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New (unavailable in resume preview)' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Print (unavailable in resume preview)' })).toBeDisabled()
    expect(screen.getByLabelText('Font')).toBeDisabled()
    expect(screen.getByLabelText('Size')).toBeDisabled()

    fireEvent.click(download)

    expect(openPrintWindowMock).toHaveBeenCalledWith(expect.stringContaining('Leonardo Cavazzani'))
    expect(screen.getByRole('status')).toHaveTextContent('The resume print dialog opened in a new window')
  })

  it('keeps a distinct persistent download action available for the desktop window', () => {
    openPrintWindowMock.mockReturnValue(true)
    render(<WordPad />)

    const persistentDownload = screen.getByRole('button', { name: 'Download resume (PDF) — persistent action' })
    expect(persistentDownload).toBeEnabled()
    expect(persistentDownload).toHaveTextContent('Download PDF')

    fireEvent.click(persistentDownload)

    expect(openPrintWindowMock).toHaveBeenCalledWith(expect.stringContaining('Leonardo Cavazzani'))
    expect(screen.getByRole('status')).toHaveTextContent('The resume print dialog opened in a new window')
  })

  it('explains the recovery path when a browser blocks the PDF dialog', () => {
    openPrintWindowMock.mockReturnValue(false)
    render(<WordPad />)

    fireEvent.click(screen.getByRole('button', { name: 'Download resume (PDF)' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Allow pop-ups for this site, then try again.')
  })
})
