'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

type TabType = 'website' | 'wifi' | 'contact';

interface WiFiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
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
  });
  const [contactData, setContactData] = useState<ContactData>({
    name: 'John Doe',
    phone: '+1 234 567 8900',
    email: 'john@example.com',
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [svgData, setSvgData] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        className={`transition-all duration-300 ${activeTab === 'website' ? 'scale-110' : ''}`}
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
        className={`transition-all duration-300 ${activeTab === 'wifi' ? 'scale-110' : ''}`}
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
        className={`transition-all duration-300 ${activeTab === 'contact' ? 'scale-110' : ''}`}
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
        // Generate PNG data URL
        const dataUrl = await QRCode.toDataURL(data, {
          width: 400,
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

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${activeTab}-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
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
    <main className="min-h-screen bg-white flex">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-between p-12 max-w-2xl">
        <div>
          {/* Title */}
          <h1 className="text-5xl font-serif mb-8 text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>QR Code Machine</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('website')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'website'
                  ? 'bg-white border-2 border-gray-200 shadow-sm text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tabIcons.website}
              <span>Website</span>
            </button>
            <button
              onClick={() => setActiveTab('wifi')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'wifi'
                  ? 'bg-white border-2 border-gray-200 shadow-sm text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tabIcons.wifi}
              <span>Wi-Fi</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'contact'
                  ? 'bg-white border-2 border-gray-200 shadow-sm text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tabIcons.contact}
              <span>Contact</span>
            </button>
          </div>

          {/* Input Fields */}
          <div className="relative mb-8 min-h-[200px] overflow-hidden">
            <div
              key={activeTab}
              className="tab-content-enter"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all duration-300"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all duration-300"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Download QR Code
            </button>
            <button
              onClick={handleCopySVG}
              disabled={!svgData}
              className={`flex-1 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                copySuccess
                  ? 'bg-green-500 border-2 border-green-500 text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              {copySuccess ? 'Copied!' : 'Copy as SVG'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-sm text-gray-600 mb-2">
            *Beep* thank you for using this little machine!
          </p>
          <p className="text-2xl text-gray-800" style={{ fontFamily: 'var(--font-script)' }}>Creative Club</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 relative overflow-hidden bg-gray-50 flex items-center justify-center">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-20 gap-1 h-full w-full p-8">
            {Array.from({ length: 400 }).map((_, i) => {
              // Create a more controlled pattern with blue squares
              const row = Math.floor(i / 20);
              const col = i % 20;
              const seed = (row * 20 + col) % 37;
              const shouldColor = seed % 7 === 0 || seed % 11 === 0;
              const colorClass = shouldColor
                ? seed % 3 === 0
                  ? 'bg-blue-400'
                  : 'bg-blue-500'
                : 'bg-transparent';
              return (
                <div
                  key={i}
                  className={`${colorClass} rounded transition-all duration-700`}
                />
              );
            })}
          </div>
        </div>

        {/* QR Code Card */}
        <div className="relative z-10 bg-white rounded-xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="QR Code"
              className="w-80 h-80 transition-opacity duration-300"
            />
          ) : (
            <div className="w-80 h-80 flex items-center justify-center text-gray-400">
              <p className="text-center">Enter data to generate QR code</p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
