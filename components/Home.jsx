'use client';
import { useState } from 'react';
import { Icon } from './icons';

const money = [
  { label: <>To Mobile<br/>Number</>, image: '/assets/icons/mobile.png', action: 'send' },
  { label: <>To Bank &<br/>Self A/c</>, image: '/assets/icons/bank.png', action: 'send' },
  { label: <>PhonePe<br/>Wallet</>, image: '/assets/icons/wallet.png', action: 'receive', badge: 'Cashback' },
  { label: <>Check<br/>Balance</>, image: '/assets/icons/balance.png', action: 'balance' },
];
const services = [
  ['Mobile Recharge', 'Recharge', '/assets/icons/recharge.png'],
  ['Rent via', <>Credit Card</>, '/assets/icons/rent.png'],
  ['Electricity', <>Bill</>, '/assets/icons/electricity.png'],
  ['Loan', <>Repayment</>, '/assets/icons/loan_repayment.png'],
];
const loans = [
  ['Personal', 'Loan', '/assets/icons/personal_loan.png'],
  ['Mutual', 'Funds Loan', '/assets/icons/mutual_loan.png'],
  ['Gold', 'Loan', '/assets/icons/gold_loan.png'],
  ['Credit', 'Score', '/assets/icons/credit_score.png'],
];
const metals = [
  ['Daily Gold', <>with ₹10</>, '/assets/icons/daily_gold.png'],
  ['Buy', 'Gold', '/assets/icons/buy_gold.png'],
  ['Daily Silver', <>with ₹10</>, '/assets/icons/daily_silver.png'],
  ['Buy', 'Silver', '/assets/icons/buy_silver.png'],
];
const insurance = [
  ['Bike', '', '/assets/icons/bike.png'],
  ['Car', '', '/assets/icons/car.png'],
  ['Health', '', '/assets/icons/health.png'],
  ['Life', '', '/assets/icons/life.png'],
];

function ServiceGrid({ items, onAction, kind = 'service' }) {
  return <div className="service-grid">{items.map(([a,b,img], i) => <button key={i} className={`service-btn ${kind}`} onClick={() => onAction(`${a} ${typeof b === 'string' ? b : ''}`.trim())}><span className="service-icon"><img src={img} alt=""/></span><span>{a}{b && <><br/>{b}</>}</span></button>)}</div>;
}

export default function Home({ profile, balance, onNavigate, onScan, onDemo }) {
  const [expanded, setExpanded] = useState(false);
  return <section className="screen active home-screen">
    <div className="home-scroll">
      <header className="home-topbar">
        <button className="profile-avatar" onClick={() => onNavigate('profile')} aria-label="Open profile">{profile.name?.[0]?.toUpperCase() || 'V'}</button>
        <button className="help-btn" onClick={() => onDemo('Help & support')} aria-label="Help"><Icon name="help" size={39} strokeWidth={1.7}/></button>
      </header>

      <section className="hero-banner">
        <div className="hero-stage-lines" />
        <div className="hero-copy">
          <div className="hero-kicker">Your door to new opportunities</div>
          <div className="hero-title">Up to <span>₹10,00,000</span> loan</div>
          <button className="hero-btn" onClick={() => onDemo('Apply Now')}>Apply Now</button>
        </div>
        <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
      </section>

      <div className="section-heading-row"><h2>Money Transfers</h2><button className="refer-pill" onClick={() => onDemo('Refer & Earn')}>₹ <span>Refer → ₹1200</span></button></div>
      <div className="action-grid">{money.map((item, index) => <button key={index} className="action-btn" onClick={() => item.action === 'balance' ? onDemo(`Balance: ₹${balance.toLocaleString('en-IN')}`) : onNavigate(item.action)}>{item.badge && <span className="action-badge">{item.badge}</span>}<span className="action-icon"><img src={item.image} alt=""/></span><span>{item.label}</span></button>)}</div>

      <div className="promo-strip"><button onClick={() => onDemo('Share Market')}>▦ <span>Trade at ₹0 Brokerage*!</span></button><button onClick={() => onDemo('Offers')}>▣ <span>₹0 fee* on Payments</span></button></div>

      <h2 className="section-title">Recharge &amp; Bills</h2>
      <ServiceGrid items={services} onAction={onDemo}/>
      <div className="wide-action-row"><button className="wide-promo" onClick={() => onDemo('Jio SIM')}><span>Get Jio SIM home delivered</span><b>▣</b></button><button className="more-btn" onClick={() => setExpanded(v => !v)}>More →</button></div>

      <h2 className="section-title">Loans</h2>
      <ServiceGrid items={loans} onAction={onDemo}/>
      <div className="wide-action-row"><button className="wide-promo" onClick={() => onDemo('Credit Score')}>Check credit score for <strong>FREE</strong></button><button className="more-btn" onClick={() => onDemo('Loans')}>More →</button></div>

      {expanded && <div className="expanded-services"><div>More services</div><button onClick={() => onDemo('Fastag Recharge')}>Fastag Recharge</button><button onClick={() => onDemo('DTH Recharge')}>DTH Recharge</button><button onClick={() => onDemo('Gift Cards')}>Gift Cards</button></div>}

      <div className="silver-banner"><div><small>Did you know?</small><strong>Silver savings start at ₹10</strong></div><span>→</span></div>
      <h2 className="section-title">Gold, Silver &amp; Platinum</h2><ServiceGrid items={metals} onAction={onDemo}/>
      <div className="wide-action-row"><button className="wide-promo" onClick={() => onDemo('Platinum Savings')}>Save in pure Platinum daily</button><button className="more-btn" onClick={() => onDemo('Gold Silver Platinum')}>More →</button></div>
      <h2 className="section-title">Insurance</h2><ServiceGrid items={insurance} onAction={onDemo}/>
      <div className="wide-action-row bottom-space"><button className="wide-promo" onClick={() => onDemo('Insurance Offer')}>₹50L+ coverage at affordable prices</button><button className="more-btn" onClick={() => onDemo('Insurance')}>More →</button></div>
      <div className="home-bottom-spacer" />
    </div>
  </section>;
}
