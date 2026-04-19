import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Server, Cookie, Layout, AlertCircle, Download } from 'lucide-react';

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

  // --- Funções de Exportação ---
  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `security_report_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportCSV = () => {
    const headers = results.headers?.data || {};
    const server = results.server?.details || {};
    const cookies = results.cookies?.cookies || [];

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Categoria,Propriedade,Valor\n";
    
    // Headers
    csvContent += `Headers,HSTS,${headers.hsts}\n`;
    csvContent += `Headers,CSP,${headers.csp}\n`;
    csvContent += `Headers,X-Frame,${headers.xFrame}\n`;
    
    // Server
    csvContent += `Server,Header,${server.server_header}\n`;
    csvContent += `Server,Powered-By,${server.x_powered_by}\n`;
    
    // Cookies
    cookies.forEach(c => {
      csvContent += `Cookie,${c.name},Secure=${c.secure};HttpOnly=${c.httpOnly};SameSite=${c.sameSite}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "security_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', color: '#334155' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '10px' }}>Security Check Tool</h1>
        <p>Analise a segurança de cabeçalhos, servidores e cookies via HTTPS.</p>
      </header>

      <form onSubmit={handleCheck} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="https://exemplo.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Analisando...' : 'Verificar Agora'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Botões de Exportação - Só aparecem se houver resultados */}
      {results.headers && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={exportJSON} style={exportBtnStyle}>
             <Download size={16} /> Exportar JSON
          </button>
          <button onClick={exportCSV} style={{...exportBtnStyle, backgroundColor: '#059669'}}>
             <Download size={16} /> Exportar CSV
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <ResultCard title="Headers" icon={<Layout color="#60a5fa" />} data={results.headers} />
        <ResultCard title="Server" icon={<Server color="#60a5fa" />} data={results.server} />
        <ResultCard title="Cookies" icon={<Cookie color="#60a5fa" />} data={results.cookies} />
      </div>
    </div>
  );
};

const ResultCard = ({ title, icon, data }) => {
  const renderContent = () => {
    if (!data) return <p style={{ color: '#94a3b8' }}>Aguardando análise...</p>;

    switch (title) {
      case 'Headers':
        const { hsts, csp, xFrame } = data.data || {};
        return (
          <div style={listStyle}>
            <p><strong>HSTS:</strong> <StatusBadge active={hsts} /></p>
            <p><strong>CSP:</strong> <StatusBadge active={csp} /></p>
            <p><strong>X-Frame:</strong> <StatusBadge active={xFrame} /></p>
            {data.missing && data.missing !== "Nenhum" && (
                <p style={{marginTop: '10px', color: '#f87171', fontSize: '0.8rem'}}>Ausentes: {data.missing}</p>
            )}
          </div>
        );

      case 'Server':
        const { server_header, x_powered_by } = data.details || {};
        return (
          <div style={listStyle}>
            <p><strong>Server:</strong> {server_header}</p>
            <p><strong>X-Powered-By:</strong> {x_powered_by}</p>
            <p style={{ marginTop: '10px', fontSize: '0.8rem', color: data.is_exposed ? '#f87171' : '#4ade80' }}>
               <em>{data.recommendation}</em>
            </p>
          </div>
        );

      case 'Cookies':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.85rem', color: data.verdict === "Seguro" ? '#4ade80' : '#fb7185' }}>
              <strong>Veredito:</strong> {data.verdict}
            </p>
            {data.cookies?.map((cookie, idx) => (
              <div key={idx} style={cookieBoxStyle}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>{cookie.name}</span>
                <div style={{ fontSize: '0.75rem', marginTop: '5px', opacity: 0.8, display: 'flex', gap: '8px' }}>
                  <span>S: {cookie.secure ? '✅' : '❌'}</span>
                  <span>H: {cookie.httpOnly ? '✅' : '❌'}</span>
                  <span>SS: {cookie.sameSite}</span>
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
        {icon} <strong style={{ fontSize: '1.1rem' }}>{title}</strong>
      </div>
      {renderContent()}
    </div>
  );
};

// Componente simples para mostrar status
const StatusBadge = ({ active }) => (
    <span style={{ color: active ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
        {active ? 'Protegido' : 'Vulnerável'}
    </span>
);

// --- Estilos ---
const cardStyle = {
  backgroundColor: '#1e293b',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #334155',
  color: '#f8fafc'
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  fontSize: '0.95rem'
};

const cookieBoxStyle = {
  backgroundColor: '#0f172a',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #334155'
};

const exportBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  backgroundColor: '#475569',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '600',
  transition: 'opacity 0.2s'
};

export default SecurityCheckApp;