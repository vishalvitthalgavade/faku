'use client';
import { useState } from 'react';
import { Icon } from './icons';
import { formatINR } from '../lib/storage';

export function SendScreen({ onBack, onContinue }) { const [name,setName]=useState(''); const [upi,setUpi]=useState(''); const [amount,setAmount]=useState(''); return <section className="screen active"><SimpleHeader title="Send to UPI ID" onBack={onBack}/><div className="form-card"><label>Payee name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Campus Canteen"/><label>UPI ID</label><input value={upi} onChange={e=>setUpi(e.target.value)} placeholder="e.g. canteen@edu"/><label>Amount</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 100" inputMode="numeric"/><button className="primary-btn" onClick={()=>onContinue({name,upiId:upi,amount:Number(amount)})}>Continue</button></div></section> }
export function ReceiveScreen({ profile, onBack, onDemo }) {
  const [amount,setAmount]=useState('');
  const [qr,setQr]=useState('');
  const [qrError,setQrError]=useState('');

  const generate=()=>{
    const numericAmount = amount ? Number(amount) : 0;
    if (numericAmount < 0) { setQrError('Enter a valid amount.'); return; }
    const payload=JSON.stringify({app:'edupay-demo',name:profile.name || 'You',upiId:profile.upiId || 'you@edu', ...(numericAmount ? {amount:numericAmount} : {})});
    setQr(payload);
    setQrError('');
    window.setTimeout(()=>{
      const node=document.getElementById('react-qrcode');
      if (!node) return;
      node.innerHTML='';
      if (!window.QRCode) {
        setQrError('QR generator is still loading. Tap Generate QR Code again.');
        onDemo?.('QR generator is loading');
        return;
      }
      try {
        new window.QRCode(node,{text:payload,width:220,height:220,colorDark:'#111',colorLight:'#fff',correctLevel:window.QRCode.CorrectLevel?.M || 0});
      } catch {
        setQrError('Could not generate the QR code.');
      }
    },0);
  };

  return <section className="screen active">
    <SimpleHeader title="Receive Money" onBack={onBack}/>
    <div className="form-card">
      <label>Amount to request (optional)</label>
      <input type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 50" inputMode="decimal"/>
      <button className="primary-btn" onClick={generate}>Generate QR Code</button>
      {qrError&&<div className="form-error">{qrError}</div>}
    </div>
    {qr&&<div className="qr-display"><div id="react-qrcode"/><div className="qr-caption">{amount?`Requesting ${formatINR(amount)} to ${profile.upiId}`:`Receive to ${profile.upiId} (any amount)`}</div><div className="demo-tag">Show this QR to another EduPay demo device or scan its image from the Scan &amp; Pay screen.</div></div>}
  </section>
}
export function ConfirmScreen({ txn, balance, onBack, onConfirm }) { const [amount,setAmount]=useState(String(txn?.amount||'')); return <section className="screen active"><SimpleHeader title="Confirm Payment" onBack={onBack}/><div className="confirm-card"><div className="payee-avatar">{txn?.name?.[0]?.toUpperCase()||'?'}</div><div className="payee-name">{txn?.name}</div><div className="payee-upi">{txn?.upiId}</div><div className="amount-input-wrap"><span>₹</span><input type="number" value={amount} onChange={e=>setAmount(e.target.value)}/></div><div className="balance-hint">Available demo balance: {formatINR(balance)}</div><button className="primary-btn" onClick={()=>onConfirm(Number(amount))}>Pay Now</button></div></section> }
export function PinScreen({ txn, onBack, onComplete }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const pressKey = (key) => {
    setError('');
    if (key === '⌫') {
      setPin((value) => value.slice(0, -1));
      return;
    }
    if (key === 'PAY') {
      if (pin.length === 4) onComplete(pin);
      else setError('Enter all 4 digits.');
      return;
    }
    if (/^\d$/.test(key) && pin.length < 4) {
      setPin((value) => value + key);
    }
  };

  const payeeName = txn?.payeeName || txn?.name || 'EduPay Merchant';
  const upiId = txn?.upiId || 'merchant@edu';
  const amount = Number(txn?.amount || 0);
  const note = txn?.note || '';
  const merchantCode = txn?.merchantCode || '';
  const source = txn?.source || '';

  return (
    <section className="screen pin-screen active" aria-label="Enter UPI PIN">
      <header className="pin-topbar">
        <button className="pin-cancel" onClick={onBack} type="button">CANCEL</button>
        <div className="pin-brand" aria-label="EduPay UPI">
          <strong>EDUPAY</strong>
          <span>UPI</span>
        </div>
        <button className="pin-close" onClick={onBack} type="button" aria-label="Close">×</button>
      </header>

      <div className="pin-payment-summary">
        <div className="pin-payee-block">
          <small>Pay ₹{amount.toFixed(2)}</small>
          <strong>To {payeeName}</strong>
          <span>{upiId}</span>
          {(note || merchantCode) && (
            <em>{note || `Merchant ${merchantCode}`}</em>
          )}
        </div>
        <div className="pin-summary-right">
          <div className="pin-summary-amount">₹{amount.toFixed(2)}</div>
          {source === 'upi' && <span className="pin-upi-badge">UPI</span>}
        </div>
      </div>

      <div className="pin-content">
        <div className="pin-heading">ENTER 4-DIGIT UPI PIN</div>

        <div className="pin-dots reference-dots" aria-label={`${pin.length} of 4 digits entered`}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={i < pin.length ? 'filled' : ''}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="pin-security-note">
          <span>!</span>
          <div>
            You are sending <strong>₹{amount.toFixed(2)}</strong> from your account to <strong>{payeeName}</strong>
          </div>
        </div>

        <div className="pin-helper">Never share your UPI PIN with anyone</div>
        {error && <div className="pin-error" role="alert">{error}</div>}

        <div className="pin-pad reference-pin-pad" aria-label="UPI PIN keypad">
          {['1','2','3','4','5','6','7','8','9','⌫','0','PAY'].map((key) => (
            <button
              key={key}
              type="button"
              className={key === 'PAY' ? 'pin-pay-key' : key === '⌫' ? 'pin-delete-key' : ''}
              onClick={() => pressKey(key)}
              aria-label={key === '⌫' ? 'Delete' : key === 'PAY' ? 'Pay' : `Digit ${key}`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
function SimpleHeader({title,onBack}) { return <header className="top-bar"><button className="icon-btn" onClick={onBack} aria-label="Back"><Icon name="arrowLeft"/></button><div className="title">{title}</div><div style={{width:40}}/></header> }
