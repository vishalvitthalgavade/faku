'use client';

import { useEffect, useState } from 'react';
import { Icon } from './icons';

export default function PaymentProcessing({ transaction, onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const started = performance.now();
    let raf;
    const animate = (now) => {
      const elapsed = now - started;
      setProgress(Math.min(elapsed / 1000, 1));
      if (elapsed < 1000) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    const timer = window.setTimeout(onDone, 1000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <section className="screen processing-screen" aria-live="polite">
      <div className="processing-content">
        <div className="processing-ring" style={{ '--progress': `${progress * 360}deg` }}>
          <div className="processing-ring-inner">
            <Icon name="qr" size={48} />
          </div>
        </div>
        <h1>Payment Initiated</h1>
        <p>Sending {transaction ? `₹${Number(transaction.amount).toLocaleString('en-IN')}` : 'payment'} securely</p>
        <div className="processing-dots" aria-label="Processing">
          <span />
          <span />
          <span />
        </div>
        <div className="processing-card">
          <span>Paying to</span>
          <strong>{transaction?.name || 'Merchant'}</strong>
          <small>{transaction?.upiId || 'UPI'}</small>
        </div>
      </div>
    </section>
  );
}
