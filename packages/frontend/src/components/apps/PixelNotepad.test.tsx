import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PixelNotepad } from './PixelNotepad'

describe('PixelNotepad', () => {
  it('accepts keyboard-editable local text and updates line, character, and insert status', () => {
    render(<PixelNotepad />)

    const editor = screen.getByRole('textbox', { name: 'README.TXT editor' })
    fireEvent.change(editor, { target: { value: 'ONE\nTWO', selectionStart: 7 } })
    fireEvent.select(editor, { target: { selectionStart: 7 } })

    expect(editor).toHaveValue('ONE\nTWO')
    expect(screen.getByText('Ln 2, Col 4')).toBeInTheDocument()
    expect(screen.getByText('7 chars')).toBeInTheDocument()
    expect(screen.getByLabelText('Insert mode')).toHaveTextContent('INS')
  })
})
