'use client';
import { useMemo, useState } from 'react';
import { Icon } from './icons';
import { formatINR } from '../lib/storage';

function relative(iso) {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now'; if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60); if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24); if (days === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).replace(/^0/, '');
}
function monthLabel(iso) { return new Date(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); }

export default function History({ history, onOpen, onDemo }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => history.filter(x => !query || `${x.name} ${x.upiId}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>new Date(b.time)-new Date(a.time)), [history, query]);
  const groups = useMemo(() => { const m = new Map(); filtered.forEach(item => { const key = `${new Date(item.time).getFullYear()}-${new Date(item.time).getMonth()}`; if(!m.has(key)) m.set(key, []); m.get(key).push(item); }); return [...m.values()]; }, [filtered]);
  return <section className="screen history-screen active">
    <div className="history-scroll">
      <header className="history-header"><div className="history-topline"><h1>History</h1><button className="history-help" onClick={() => onDemo('History help')}><Icon name="help" size={34} strokeWidth={1.8}/></button></div><div className="history-heading-row"><div/><button className="statements-btn" onClick={() => onDemo('Statement download')}><Icon name="download" size={18}/> My Statements</button></div><div className="history-searchbar"><Icon name="search" size={29} strokeWidth={1.7}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search"/><span className="history-search-divider"/><button onClick={() => onDemo('History filters')} aria-label="Filter"><Icon name="filter" size={28} strokeWidth={1.6}/></button></div></header>
      {!filtered.length ? <div className="empty-state">{query ? 'No matching transactions' : 'No transactions yet'}</div> : groups.map((items, idx) => <section key={idx} className="history-month-group"><div className="history-month"><span>{monthLabel(items[0].time)}</span><span className="history-month-total">+ {formatINR(items.reduce((s,x)=>s+Number(x.amount||0),0))} <b>›</b></span></div>{items.map(item => <button className="history-reference-row" key={item.txnId} onClick={()=>onOpen(item)}><span className="reference-icon"><Icon name="send" size={20}/></span><span className="reference-main"><span className="reference-type">{item.type === 'received' ? 'Received from' : Number(item.amount) === 1 ? 'Payment to' : 'Paid to'}</span><span className="reference-name">{item.name}</span><span className="reference-date">{relative(item.time)}</span></span><span className="reference-right"><span className="reference-amount">{formatINR(item.amount)}</span><span className="debited-row">{item.type === 'received' ? 'Credited to' : 'Debited from'} <span className="bank-mini">•</span></span></span></button>)}</section>)}
    </div>
  </section>;
}
