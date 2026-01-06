'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

type TabType = 'website' | 'wifi' | 'contact';

interface WiFiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  message: string;
}

interface ContactData {
  name: string;
  phone: string;
  email: string;
}

export default function Home() {
  
  const [activeTab, setActiveTab] = useState<TabType>('website');
  const [websiteUrl, setWebsiteUrl] = useState('creativeclub.dev');
  const [wifiData, setWifiData] = useState<WiFiData>({
    ssid: 'MyWiFiNetwork',
    password: 'password123',
    security: 'WPA',
    message: 'Scan to connect to Wi-Fi',
  });
  const [contactData, setContactData] = useState<ContactData>({
    name: 'John Doe',
    phone: '+1 234 567 8900',
    email: 'john@example.com',
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [svgData, setSvgData] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [formHeight, setFormHeight] = useState<number | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);

  const tabIcons = {
    website: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className=""
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    wifi: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className=""
      >
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
    contact: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className=""
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };

  // Generate QR code data string based on active tab
  const getQRCodeString = (): string => {
    switch (activeTab) {
      case 'website':
        return websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      case 'wifi':
        if (!wifiData.ssid) return '';
        const security = wifiData.security === 'nopass' ? 'nopass' : wifiData.security;
        const password = wifiData.password || '';
        return `WIFI:T:${security};S:${wifiData.ssid};P:${password};H:true;;`;
      case 'contact':
        if (!contactData.name && !contactData.phone && !contactData.email) return '';
        const vcard = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          contactData.name && `FN:${contactData.name}`,
          contactData.phone && `TEL:${contactData.phone}`,
          contactData.email && `EMAIL:${contactData.email}`,
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n');
        return vcard;
      default:
        return '';
    }
  };

  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      const data = getQRCodeString();
      if (!data) {
        setQrCodeDataUrl('');
        setSvgData('');
        return;
      }

      try {
        // Generate PNG data URL at 2K resolution
        const dataUrl = await QRCode.toDataURL(data, {
          width: 2000,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);

        // Generate SVG string
        const svg = await QRCode.toString(data, {
          type: 'svg',
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setSvgData(svg);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [activeTab, websiteUrl, wifiData, contactData]);

  // Measure and update form height for smooth transitions
  useEffect(() => {
    if (formContentRef.current) {
      const height = formContentRef.current.scrollHeight;
      setFormHeight(height);
    }
  }, [activeTab]);

  const handleDownload = async () => {
    if (!qrCodeDataUrl) return;

    // For WiFi, create a canvas with message and QR code
    if (activeTab === 'wifi' && wifiData.message) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const padding = 256; // Padding around the entire card (2K resolution)
      const qrSize = 2000; // QR code size (2K resolution)
      const messagePadding = 128; // Space between message and QR code
      
      // Load the QR code image
      const qrImage = new Image();
      qrImage.src = qrCodeDataUrl;
      
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      // Calculate dimensions
      const messageHeight = 160; // Approximate height for message text
      const totalHeight = padding * 2 + messageHeight + messagePadding + qrSize;
      const totalWidth = padding * 2 + qrSize;
      
      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw message text
      ctx.fillStyle = '#1f2937'; // text-gray-800
      ctx.font = '96px Inter, sans-serif'; // text-lg font-medium (scaled for 2K)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Word wrap the message
      const maxWidth = qrSize;
      const words = wifiData.message.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw each line of the message
      const lineHeight = 128; // Scaled for 2K resolution
      const messageY = padding;
      lines.forEach((line, index) => {
        ctx.fillText(line, totalWidth / 2, messageY + index * lineHeight);
      });

      // Draw QR code
      const qrY = padding + (lines.length * lineHeight) + messagePadding;
      ctx.drawImage(qrImage, padding, qrY, qrSize, qrSize);

      // Download the canvas
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `qrcode-${activeTab}-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } else {
      // For other tabs, download QR code directly
      const link = document.createElement('a');
      link.download = `qrcode-${activeTab}-${Date.now()}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const handleCopySVG = async () => {
    if (!svgData) return;

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(svgData);
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
        return;
      } catch (error) {
        console.log('Clipboard API failed, trying fallback:', error);
      }
    }

    // Fallback: Use textarea method (works in Chrome and other browsers)
    try {
      const textarea = document.createElement('textarea');
      textarea.value = svgData;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } else {
        throw new Error('execCommand failed');
      }
    } catch (error) {
      console.error('All copy methods failed:', error);
      // Last resort: download the file
      try {
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${activeTab}-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Clipboard not available. SVG file downloaded instead.');
      } catch (downloadError) {
        console.error('Failed to download SVG:', downloadError);
        alert('Failed to copy SVG. Please try again.');
      }
    }
  };

  return (
    <main className="min-h-screen bg-white flex justify-center items-center px-4 py-8 md:px-0 md:py-0">
      <div className="flex flex-col md:flex-row w-full max-w-[1200px]">
      {/* Left Section */}
      <div className="flex flex-col justify-between p-6 md:p-12 transition-all duration-300 ease-in-out md:-mt-10">
        <div className="transition-all duration-300 ease-in-out">
          {/* Title */}
          <h1 
            className="mb-6 md:mb-8"
            style={{
              color: '#1E1E1F',
              textAlign: 'center',
              fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
              fontSize: 'clamp(32px, 8vw, 60px)',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              letterSpacing: '-1.897px',
            }}
          >
            QR Code Machine
          </h1>

          {/* Segmented Control */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div 
              className="self-stretch w-full md:w-auto"
              style={{
                display: 'flex',
                height: '56px',
                padding: '4px',
                gap: '8px',
                alignSelf: 'stretch',
                borderRadius: '12px',
                border: '1px solid #E2E6E8',
                background: '#ECEEEF',
              }}
            >
            <button
              onClick={() => setActiveTab('website')}
              className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 font-medium  text-gray-900"
              style={{
                flex: '1 0 0',
                borderRadius: activeTab === 'website' ? '8px' : '8px',
                border: activeTab === 'website' ? '1px solid #DCE2E5' : '1px solid rgba(220, 226, 229, 0)',
                background: activeTab === 'website' ? '#FFF' : 'transparent',
                color: activeTab === 'website' ? '#111827' : '#4B5563',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {tabIcons.website}
              <span>Website</span>
            </button>
            <button
              onClick={() => setActiveTab('wifi')}
              className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 font-medium  text-gray-900"
              style={{
                flex: '1 0 0',
                borderRadius: activeTab === 'wifi' ? '8px' : '8px',
                border: activeTab === 'wifi' ? '1px solid #DCE2E5' : '1px solid rgba(220, 226, 229, 0)',
                background: activeTab === 'wifi' ? '#FFF' : 'transparent',
                color: activeTab === 'wifi' ? '#111827' : '#4B5563',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {tabIcons.wifi}
              <span>Wi-Fi</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 font-medium  text-gray-900"
              style={{
                flex: '1 0 0',
                borderRadius: activeTab === 'contact' ? '8px' : '8px',
                border: activeTab === 'contact' ? '1px solid #DCE2E5' : '1px solid rgba(220, 226, 229, 0)',
                background: activeTab === 'contact' ? '#FFF' : 'transparent',
                color: activeTab === 'contact' ? '#111827' : '#4B5563',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {tabIcons.contact}
              <span>Contact</span>
            </button>
            </div>
          </div>

          {/* Input Fields */}
          <div 
            className="relative mb-6 md:mb-8 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ height: formHeight ? `${formHeight}px` : 'auto' }}
          >
              <div
                ref={formContentRef}
                key={activeTab}
              >
              {activeTab === 'website' && (
                <div className="space-y-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="creativeclub.dev"
                    className="w-full text-gray-900 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                  />
                </div>
              )}

              {activeTab === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                      placeholder="Enter your WiFi network name"
                      className="w-full text-gray-900 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiData.password}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                      placeholder="Enter your WiFi password"
                      className="w-full text-gray-900 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <input
                      type="text"
                      value={wifiData.message}
                      onChange={(e) => setWifiData({ ...wifiData, message: e.target.value })}
                      placeholder="Scan to connect to Wi-Fi"
                      className="w-full text-gray-900 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      placeholder="John Doe"
                      className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                    />
                  </div>
                </div>
              )}
              </div>
            
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              disabled={!qrCodeDataUrl}
              className="text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                display: 'flex',
                height: '56px',
                padding: '24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2px',
                flex: '1 0 0',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #3889F9 0%, #3D52EA 100%)',
                boxShadow: '0 0 6px 3px rgba(255, 255, 255, 0.25) inset, 0 6px 20px 0 rgba(59, 119, 244, 0.42)',
              }}
            >
              Download QR Code
            </button>
            <button
              onClick={handleCopySVG}
              disabled={!svgData}
              className="font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-900"
              style={{
                display: 'flex',
                height: '56px',
                padding: '24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2px',
                flex: '1 0 0',
                borderRadius: '8px',
                border: copySuccess ? '1px solid #1E1E1F' : '1px solid #E2E6E7',
                background: copySuccess ? '#1E1E1F' : '#FFF',
                color: copySuccess ? '#FFF' : '#111827',
              }}
            >
              {copySuccess ? 'Copied!' : 'Copy as SVG'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">
            *Beep* thank you for using this little machine!
          </p>
          <a 
            href="http://creativeclub.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover-bounce cursor-pointer"
          >
            <img 
              src="/creativeclub.svg" 
              alt="Creative Club" 
              className="h-5"
            />
          </a>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 relative overflow-hidden bg-white flex items-center justify-center mt-8 md:mt-0">

        {/* QR Code Card */}
        <div className="relative z-10 bg-white rounded-xl shadow-xl p-4 md:p-8 w-full max-w-sm mx-auto">
          {/* WiFi Message */}
          {activeTab === 'wifi' && wifiData.message && qrCodeDataUrl && (
            <div className="mb-4 text-center w-full max-w-xs mx-auto">
              <p className="text-base md:text-lg font-medium text-gray-800 break-words whitespace-normal">
                {wifiData.message}
              </p>
            </div>
          )}
          
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="QR Code"
              className="w-full max-w-xs md:w-80 md:h-80 mx-auto aspect-square"
            />
          ) : (
            <div className="w-full max-w-xs md:w-80 md:h-80 aspect-square flex items-center justify-center text-gray-400 mx-auto">
              <p className="text-center text-sm md:text-base">Enter data to generate QR code</p>
            </div>
          )}
        </div>
      </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
