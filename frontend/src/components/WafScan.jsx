import React, { useState } from 'react';
import axios from 'axios';
import { GlobeLock, Search, Loader2, ShieldCheck, XCircle, Link2, FileJson, FileSpreadsheet } from 'lucide-react';

const WafScan = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formattedUrl = url.toLowerCase().startsWith('https://') 
      ? url 
      : `https://${url.replace('http://', '')}`;

    try {
      const response = await axios.post('http://localhost:3000/waf/scan', {
        url: formattedUrl
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao processar análise de WAF.");
    } finally {
      setLoading(false);
    }
  };

  // --- Funções de Exportação ---
  const exportJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, `waf_scan_${new Date().getTime()}.json`);
  };

  const exportCSV = () => {
    const headers = "URL,Data,Detectado,WAF_Nome,Fabricante\n";
    const row = `${result.url},${result.scan_date},${result.detected},${result.waf_name},${result.manufacturer}`;
    const blob = new Blob([headers + row], { type: 'text/csv' });
    downloadFile(blob, `waf_scan_${new Date().getTime()}.csv`);
  };

  const downloadFile = (blob, fileName) => {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <GlobeLock size={40} color="#38bdf8" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Análise de WAF</h2>
      </div>

      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>
        Identifique firewalls de aplicação web ativos utilizando fingerprinting do <strong>wafw00f</strong>.
      </p>

      <form onSubmit={handleScan} style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Link2 size={20} style={{ position: 'absolute', left: '15px', top: '18px', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Ex: https://google.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button disabled={loading || !url} style={{ ...buttonStyle, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {loading ? 'Analisando...' : 'Scan'}
        </button>
      </form>

      {error && <div style={errorBoxStyle}><XCircle size={24} /> {error}</div>}

      {result && (
        <div style={resultCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '12px' }}>
              <ShieldCheck size={32} color={result.detected ? "#38bdf8" : "#94a3b8"} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Resultado do Fingerprint</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Relatório consolidado</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={dataBoxStyle}>
              <p style={labelStyle}>URL Analisada</p>
              <p style={{ margin: 0, fontSize: '1.1rem', wordBreak: 'break-all', color: '#cbd5e1' }}>{result.url}</p>
            </div>

            <div style={{ ...dataBoxStyle, borderLeft: `4px solid ${result.detected ? '#38bdf8' : '#f59e0b'}` }}>
              <p style={labelStyle}>Firewall Detectado</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: result.detected ? '#38bdf8' : '#f59e0b' }}>
                {result.waf_name}
              </p>
              {result.detected && (
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Fabricante: {result.manufacturer}
                </p>
              )}
            </div>
          </div>

          {/* Seção de Exportação */}
          <div style={exportSectionStyle}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>Exportar Relatório:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={exportJSON} style={exportButtonStyle}><FileJson size={16} /> JSON</button>
              <button onClick={exportCSV} style={exportButtonStyle}><FileSpreadsheet size={16} /> CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Estilos Reutilizados e Novos ---
const inputStyle = { width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', fontSize: '1rem', outline: 'none' };
const buttonStyle = { backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0 30px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' };
const errorBoxStyle = { backgroundColor: '#451a1a', border: '1px solid #ef4444', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fecaca' };
const resultCardStyle = { backgroundColor: '#1e293b', padding: '35px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' };
const dataBoxStyle = { padding: '20px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' };
const labelStyle = { color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 'bold' };
const exportSectionStyle = { marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #334155' };
const exportButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' };

export default WafScan;