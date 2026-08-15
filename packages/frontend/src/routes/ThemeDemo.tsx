import { useState } from 'react'
import { Button } from '../components/primitives/Button'
import { Fieldset } from '../components/primitives/Fieldset'
import { Menu } from '../components/primitives/Menu'
import { TitleBar } from '../components/primitives/TitleBar'
import { type ActiveThemeId, useTheme } from '../theme/ThemeProvider'
import './ThemeDemo.css'

const options: Array<{ id: ActiveThemeId; label: string }> = [
  { id: 'winxp', label: 'Windows XP' },
  { id: 'win98', label: 'Windows 98' },
]

export function ThemeDemo() {
  const { theme, setTheme } = useTheme()
  const [count, setCount] = useState(0)
  const [name, setName] = useState('Ada Lovelace')

  return (
    <main className="themeDemo">
      <section className="window themeDemoWindow">
        <TitleBar title="Theme Runtime Demo" />
        <div className="window-body">
          <h1>Appearance Preview</h1>
          <p>State remains intact while only the active stylesheet changes.</p>
          <Fieldset legend="Active release themes">
            <div className="themeOptions">
              {options.map((option) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name="theme"
                    value={option.id}
                    checked={theme === option.id}
                    onChange={() => setTheme(option.id)}
                  />{' '}
                  {option.label}
                </label>
              ))}
            </div>
          </Fieldset>
          <p>Windows 7 remains a deferred technical preview and is not a release selector option.</p>
          <Fieldset legend="State preservation">
            <label htmlFor="demo-name">Display name</label>
            <input id="demo-name" value={name} onChange={(event) => setName(event.target.value)} />
            <Button onClick={() => setCount((value) => value + 1)}>Increment: {count}</Button>
            <Menu label="Preview actions">
              <li role="menuitem">Open portfolio</li>
            </Menu>
          </Fieldset>
        </div>
      </section>
    </main>
  )
}
