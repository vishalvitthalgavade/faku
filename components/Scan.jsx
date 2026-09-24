'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './icons';

const JSQR_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js';

function loadScript(src, globalName) {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window[globalName]) {
      resolve(window[globalName]);
      return;
    }
    const existing = document.querySelector(`script[data-global="${globalName}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window[globalName]), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.global = globalName;
    script.onload = () => resolve(window[globalName]);
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

function parseQR(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  try {
    const json = JSON.parse(raw);
    if (json?.app === 'edupay-demo' || json?.upiId || json?.amount) {
      return {
        name: json.name || 'EduPay Merchant',
        upiId: json.upiId || 'merchant@edu',
        amount: Number(json.amount || 0),
      };
    }
  } catch {}

  try {
    if (/^upi:\/\/pay/i.test(raw)) {
      const url = new URL(raw);
      return {
        name: url.searchParams.get('pn') || 'UPI Merchant',
        upiId: url.searchParams.get('pa') || '',
        amount: Number(url.searchParams.get('am') || 0),
      };
    }
  } catch {}

  return { name: 'Scanned QR', upiId: raw.slice(0, 80), amount: 0 };
}

export default function Scan({ onBack, onScanned, onDemo }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const barcodeTimerRef = useRef(null);
  const objectUrlRef = useRef(null);
  const scanningRef = useRef(false);
  const detectorRef = useRef(null);
  const facingModeRef = useRef('environment');
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('Point the camera at an EduPay QR code');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const fileRef = useRef(null);

  const stop = useCallback(() => {
    scanningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (barcodeTimerRef.current) window.clearTimeout(barcodeTimerRef.current);
    rafRef.current = null;
    barcodeTimerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  useEffect(() => () => {
    stop();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, [stop]);

  const handleDecoded = useCallback((text) => {
    const result = parseQR(text);
    if (!result) {
      setStatus('QR code is empty or unreadable.');
      return;
    }
    stop();
    if (navigator.vibrate) navigator.vibrate([60, 40, 80]);
    setStatus('QR detected. Opening payment…');
    onScanned(result);
  }, [onScanned, stop]);

  const detectWithCanvas = useCallback(() => {
    if (!scanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(detectWithCanvas);
      return;
    }

    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const jsQR = window.jsQR;
      if (jsQR) {
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
        if (code?.data) {
          handleDecoded(code.data);
          return;
        }
      }
    } catch {}

    rafRef.current = requestAnimationFrame(detectWithCanvas);
  }, [handleDecoded]);

  const detectWithBarcodeDetector = useCallback(async () => {
    if (!scanningRef.current || !detectorRef.current || !videoRef.current) return;
    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      if (codes?.length && codes[0]?.rawValue) {
        handleDecoded(codes[0].rawValue);
        return;
      }
    } catch {}
    barcodeTimerRef.current = window.setTimeout(detectWithBarcodeDetector, 160);
  }, [handleDecoded]);

  const start = useCallback(async (mode = facingModeRef.current) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Camera access is not supported by this browser. Use Upload QR instead.');
      return;
    }

    stop();
    setStatus('Requesting camera permission…');

    try {
      // BarcodeDetector gives native QR decoding where supported.
      if ('BarcodeDetector' in window) {
        try {
          detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
        } catch {
          detectorRef.current = null;
        }
      }

      // jsQR is used as a broad browser fallback.
      if (!detectorRef.current) {
        try { await loadScript(JSQR_CDN, 'jsQR'); } catch {}
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      facingModeRef.current = mode;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      const track = stream.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.() || {};
      setHasTorch(Boolean(capabilities.torch));
      setTorchOn(false);
      scanningRef.current = true;
      setRunning(true);
      setStatus('Scanning… place the QR inside the frame');

      if (detectorRef.current) detectWithBarcodeDetector();
      else detectWithCanvas();
    } catch (error) {
      stop();
      const message = error?.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access and try again.'
        : error?.name === 'NotFoundError'
          ? 'No camera was found on this device.'
          : 'Camera could not be started. Use Upload QR instead.';
      setStatus(message);
      onDemo?.(message);
    }
  }, [detectWithBarcodeDetector, detectWithCanvas, onDemo, stop]);

  const flipCamera = async () => {
    const next = facingModeRef.current === 'environment' ? 'user' : 'environment';
    await start(next);
  };

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track || !hasTorch) {
      setStatus('Flash control is not available on this camera.');
      return;
    }
    try {
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
      setStatus(next ? 'Flash is on.' : 'Flash is off.');
    } catch {
      setStatus('This device does not allow flash control from the browser.');
    }
  };

  const readFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setStatus('Reading QR image…');
    try {
      let detector = null;
      if ('BarcodeDetector' in window) {
        try { detector = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch {}
      }

      const bitmap = await createImageBitmap(file);
      if (detector) {
        const codes = await detector.detect(bitmap);
        bitmap.close?.();
        if (codes?.length && codes[0]?.rawValue) {
          handleDecoded(codes[0].rawValue);
          return;
        }
      } else {
        try { await loadScript(JSQR_CDN, 'jsQR'); } catch {}
      }

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas unavailable');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR?.(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
      if (code?.data) handleDecoded(code.data);
      else setStatus('No QR code found in that image. Try a clearer QR image.');
    } catch {
      setStatus('Could not read that image. Please choose a clear QR screenshot/photo.');
    }
  };

  return (
    <section className="screen active scan-screen">
      <header className="scan-topbar">
        <button onClick={() => { stop(); onBack(); }} aria-label="Back"><Icon name="arrowLeft" /></button>
        <div><strong>Scan &amp; Pay</strong><small>Scan a QR to continue</small></div>
        <button onClick={() => onDemo?.('Scan a QR code using the camera or upload a QR image.')} aria-label="Help"><Icon name="help" /></button>
      </header>

      <div className="scanner-shell">
        <div className="scanner-area">
          <video ref={videoRef} playsInline muted autoPlay aria-label="QR scanner camera" />
          <canvas ref={canvasRef} hidden />
          <div className="scanner-dim" />
          <div className={`scan-frame ${running ? 'active' : ''}`} aria-hidden="true"><i/><i/><i/><i/><span/></div>

          {!running && (
            <div className="scanner-idle">
              <div className="scanner-qr-mark"><Icon name="qr" size={60} /></div>
              <strong>Scan any EduPay QR</strong>
              <span>Start the camera or upload a QR image to continue.</span>
            </div>
          )}

          <div className="scanner-actions">
            <button className="scan-primary" onClick={() => running ? stop() : start()}>
              <Icon name={running ? 'x' : 'camera'} size={18} />
              {running ? 'Stop Camera' : 'Start Camera'}
            </button>
            <button className="scan-secondary" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={18} /> Upload QR
            </button>
            <input ref={fileRef} onChange={readFile} type="file" accept="image/png,image/jpeg,image/webp" capture="environment" hidden />
          </div>
        </div>

        <div className="scan-control-row">
          <button onClick={flipCamera} disabled={!running} aria-label="Flip camera"><Icon name="refresh"/><small>Flip</small></button>
          <button onClick={toggleTorch} disabled={!running} aria-label="Toggle flash"><Icon name="flash"/><small>{torchOn ? 'Flash On' : 'Flash'}</small></button>
          <button onClick={stop} disabled={!running} aria-label="Stop scanner"><Icon name="x"/><small>Stop</small></button>
        </div>
      </div>

      <div className="status-bar"><span className="status-dot"/>{status}</div>
      <div className="scan-note">Camera scanning, QR-image upload, front/back camera switching and supported-device flash are enabled. Scanned EduPay/UPI QR codes continue to payment confirmation.</div>
    </section>
  );
}
