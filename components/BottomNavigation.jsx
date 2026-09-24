'use client';
import { Icon } from './icons';

export default function BottomNavigation({ active, onNavigate, onScan }) {
  const items = [
    ['home', 'Home', 'home'],
    ['search', 'Search', 'search'],
    ['alerts', 'Alerts', 'bell'],
    ['history', 'History', 'clock'],
  ];
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <button className={`bn-item ${active === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}><Icon name="home" size={27}/><span>Home</span></button>
      <button className={`bn-item ${active === 'search' ? 'active' : ''}`} onClick={() => onNavigate('search')}><Icon name="search" size={27}/><span>Search</span></button>
      <button className="bn-scan" onClick={onScan} aria-label="Scan QR"><Icon name="qr" size={34} strokeWidth={1.8}/></button>
      <button className={`bn-item ${active === 'alerts' ? 'active' : ''}`} onClick={() => onNavigate('alerts')}><Icon name="bell" size={27}/><span>Alerts</span></button>
      <button className={`bn-item ${active === 'history' ? 'active' : ''}`} onClick={() => onNavigate('history')}><Icon name="clock" size={27}/><span>History</span></button>
    </nav>
  );
}
