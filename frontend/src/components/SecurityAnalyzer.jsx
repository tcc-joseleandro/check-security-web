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

const ResultCard = ({ title, icon, data }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#f9fafb' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#374151' }}>
      {icon} <strong style={{ fontSize: '1.1rem' }}>{title}</strong>
    </div>
    <pre style={{ fontSize: '0.85rem', overflowX: 'auto', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
      {data ? JSON.stringify(data, null, 2) : 'Aguardando busca...'}
    </pre>
  </div>
);

export default SecurityCheckApp;