function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <h1>
        <span style={{ display: 'inline-block', animation: 'floatUp 3s ease-in-out infinite' }}>👻</span>
        <span>Haunted Home Energy Dashboard</span>
      </h1>
      <button className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  )
}

export default Header
