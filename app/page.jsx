'use client';
import { useEffect, useMemo, useState } from 'react';
import './globals.css';
import Home from '../components/Home';
import History from '../components/History';
import BottomNavigation from '../components/BottomNavigation';
import Scan from '../components/Scan';
import Transaction from '../components/Transaction';
import { SendScreen, ReceiveScreen, ConfirmScreen, PinScreen } from '../components/TransferFlow';
import Profile from '../components/Profile';
import { SearchScreen, AlertsScreen } from '../components/SimpleTabs';
import { addHistory, getBalance, getHistory, getProfile, saveBalance, saveProfile, seedDemoHistory, makeTransactionId } from '../lib/storage';

export default function Page(){
  const [screen,setScreen]=useState('home');
  const [profile,setProfile]=useState({name:'You',upiId:'you@edu'});
  const [balance,setBalance]=useState(5000);
  const [history,setHistory]=useState([]);
  const [pending,setPending]=useState(null);
  const [transaction,setTransaction]=useState(null);
  const [toast,setToast]=useState('');

  useEffect(()=>{ seedDemoHistory(); setProfile(getProfile()); setBalance(getBalance()); setHistory(getHistory()); if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{}); const script=document.createElement('script'); script.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; script.async=true; document.head.appendChild(script); return()=>script.remove(); },[]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(''),2600); return()=>clearTimeout(t); },[toast]);
  const demo=(message)=>setToast(`“${message}” is a demo action.`);
  const navigate=(target)=>{ setScreen(target); if(target==='history')setHistory(getHistory()); };
  const openTransaction=(entry)=>{setTransaction(entry);setPending({name:entry.name,upiId:entry.upiId,amount:Number(entry.amount)});setScreen('transaction');};
  const beginConfirm=(txn)=>{ if(!txn.name||!txn.upiId||!txn.amount||txn.amount<=0){setToast('Please enter payee name, UPI ID and a valid amount.');return;}setPending(txn);setScreen('confirm'); };
  const confirmAmount=(amount)=>{if(!amount||amount<=0){setToast('Please enter a valid amount.');return;}if(amount>balance){setToast('Insufficient demo balance. Reset it from Profile.');return;}setPending(p=>({...p,amount}));setScreen('pin');};
  const completePayment=()=>{if(!pending||pending.amount<=0)return;const entry={type:'sent',name:pending.name,upiId:pending.upiId,amount:Number(pending.amount),time:new Date().toISOString(),txnId:makeTransactionId()};const nextBalance=balance-entry.amount;saveBalance(nextBalance);addHistory(entry);setBalance(nextBalance);setHistory(getHistory());setTransaction(entry);setScreen('transaction');};
  const saveUser=(p,b)=>{saveProfile(p);saveBalance(b);setProfile(p);setBalance(b);setScreen('home');setToast('Profile saved.');};
  const activeNav=useMemo(()=>['home','search','alerts','history'].includes(screen)?screen:'', [screen]);
  const showNav=['home','search','alerts','history'].includes(screen);
  return <main id="app">
    {screen==='home'&&<Home profile={profile} balance={balance} onNavigate={(x)=>x==='send'?navigate('send'):x==='receive'?navigate('receive'):navigate(x)} onScan={()=>navigate('scan')} onDemo={demo}/>} 
    {screen==='search'&&<SearchScreen history={history} onOpen={openTransaction}/>} 
    {screen==='alerts'&&<AlertsScreen onDemo={demo}/>} 
    {screen==='history'&&<History history={history} onOpen={openTransaction} onDemo={demo}/>} 
    {screen==='scan'&&<Scan onBack={()=>navigate('home')} onScanned={beginConfirm} onDemo={demo}/>} 
    {screen==='send'&&<SendScreen onBack={()=>navigate('home')} onContinue={beginConfirm}/>} 
    {screen==='receive'&&<ReceiveScreen profile={profile} onBack={()=>navigate('home')} onDemo={demo}/>} 
    {screen==='confirm'&&<ConfirmScreen txn={pending} balance={balance} onBack={()=>navigate('home')} onConfirm={confirmAmount}/>} 
    {screen==='pin'&&<PinScreen onBack={()=>navigate('confirm')} onComplete={(pin)=>pin.length===4?completePayment():setToast('Enter all 4 digits.')} />} 
    {screen==='transaction'&&transaction&&<Transaction entry={transaction} onBack={()=>navigate('home')} onSendAgain={()=>navigate('confirm')} onHistory={()=>navigate('history')} onDemo={demo}/>} 
    {screen==='profile'&&<Profile profile={profile} balance={balance} onBack={()=>navigate('home')} onSave={saveUser}/>} 
    {showNav&&<BottomNavigation active={activeNav} onNavigate={navigate} onScan={()=>navigate('scan')}/>} 
    {toast&&<div className="toast show" role="status">{toast}</div>}
  </main>;
}
