import { useState } from 'react'
import {
  listProfiles, getActiveProfile,
  switchProfile, createProfile, deleteProfile, exportTune,
} from '../systems/tune-storage'

export function ProfileBar({ onChange }: { onChange: () => void }) {
  const [active, setActive] = useState(getActiveProfile())
  const [names, setNames] = useState(listProfiles())

  const refresh = () => {
    setActive(getActiveProfile())
    setNames(listProfiles())
  }

  const onSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await switchProfile(e.target.value)
    refresh()
    onChange()
  }
  const onNew = async () => {
    const name = window.prompt('Profile name')?.trim()
    if (!name || names.includes(name)) return
    await createProfile(name)
    refresh()
    onChange()
  }
  const onDelete = async () => {
    if (names.length <= 1) return
    if (!window.confirm(`Delete profile "${active}"?`)) return
    await deleteProfile(active)
    refresh()
    onChange()
  }
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    await navigator.clipboard.writeText(exportTune())
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="profile-bar">
      <select value={active} onChange={onSelect}>
        {names.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <button onClick={onNew} title="Save current as new profile">+</button>
      <button onClick={onDelete} disabled={names.length <= 1} title="Delete current profile">✕</button>
      <button onClick={onCopy} title="Copy config to clipboard">{copied ? '✓' : '⧉'}</button>
    </div>
  )
}
