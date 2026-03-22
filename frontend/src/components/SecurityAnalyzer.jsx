import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Server, Cookie, Layout, AlertCircle } from 'lucide-react';

const SecurityCheckApp = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ headers: null, server: null, cookies: null });
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:3000/check';

  const handleCheck = async (e) => {
    e.preventDefault();
    
    if (!url.startsWith('https://')) {
      setError('A URL deve começar com https://');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Realiza as três chamadas simultaneamente
      const [headersRes, serverRes, cookiesRes] = await Promise.all([
        axios.get(`${API_BASE}/headers?url=${url}`),
        axios.get(`${API_BASE}/server?url=${url}`),
        axios.get(`${API_BASE}/cookies?url=${url}`)
      ]);

      setResults({
        headers: headersRes.data,
        server: serverRes.data,
        cookies: cookiesRes.data
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2563eb' }}>Security Check Tool</h1>
        <p>Analise a segurança de cabeçalhos, servidores e cookies via HTTPS.</p>
      </header>

      <form onSubmit={handleCheck} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="https://exemplo.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Analisando...' : 'Verificar Agora'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <ResultCard title="Headers" icon={<Layout />} data={results.headers} />
        <ResultCard title="Server" icon={<Server />} data={results.server} />
        <ResultCard title="Cookies" icon={<Cookie />} data={results.cookies} />
      </div>
    </div>
  );
};

const ResultCard = ({ title, icon, data }) => {
  // Função para renderizar o conteúdo baseado no título do Card
  const renderContent = () => {
    if (!data) return <p style={{ color: '#64748b' }}>Aguardando busca...</p>;

    switch (title) {
      case 'Headers':
        const { hsts, csp, xFrame } = data.data || {};
        return (
          <div style={listStyle}>
            <p><strong>HSTS:</strong> {String(hsts)}</p>
            <p><strong>CSP:</strong> {String(csp)}</p>
            <p><strong>X-Frame:</strong> {String(xFrame)}</p>
          </div>
        );

      case 'Server':
        const { server_header, x_powered_by } = data.details || {};
        return (
          <div style={listStyle}>
            <p><strong>Server Header:</strong> {server_header}</p>
            <p><strong>X-Powered-By:</strong> {x_powered_by}</p>
          </div>
        );

      case 'Cookies':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '10px' }}>
              <em>{data.verdict}</em>
            </p>
            {data.cookies?.map((cookie, idx) => (
              <div key={idx} style={cookieBoxStyle}>
                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '5px' }}>
                  {cookie.name}
                </strong>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  <span><strong>Secure:</strong> {String(cookie.secure)}</span> | 
                  <span> <strong>HttpOnly:</strong> {String(cookie.httpOnly)}</span> | 
                  <span> <strong>SameSite:</strong> {String(cookie.sameSite)}</span>
                </div>
              </div>
            ))}

          </div>
        );

      default:
        return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        {icon} <strong style={{ fontSize: '1.2rem' }}>{title}</strong>
      </div>
      {renderContent()}
    </div>
  );
};

// --- Estilos Auxiliares (Coloque fora do componente ou no topo do arquivo) ---

const cardStyle = {
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '24px',
  backgroundColor: '#1e293b',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  color: '#f8fafc',
  height: 'fit-content'
};

const listStyle = {
  lineHeight: '1.8',
  fontSize: '0.95rem',
  color: '#e2e8f0'
};

const cookieBoxStyle = {
  backgroundColor: '#0f172a',
  padding: '12px',
  borderRadius: '8px',
  borderLeft: '4px solid #38bdf8'
};

export default SecurityCheckApp;