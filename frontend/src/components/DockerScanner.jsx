import React, { useState } from 'react';
import axios from 'axios';
import { Box, Search, Loader2, XCircle, CheckCircle, Lock, User, Download, FileJson, FileSpreadsheet } from 'lucide-react';

const DockerScanner = () => {
  const [imageName, setImageName] = useState('');
  const [scannerType, setScannerType] = useState('trivy');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!imageName) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3000/container/scan', {
        image: imageName,
        scanner: scannerType,
        username: scannerType === 'docker-scout' ? username : null,
        password: scannerType === 'docker-scout' ? password : null
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };


  const exportJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, `scan_${result.image.replace(/[:/]/g, '_')}.json`);
  };

  const exportCSV = () => {
    const headers = "Imagem,Scanner,Criticas,Altas,Medias\n";
    const row = `${result.image},${result.scanner_used},${result.critical},${result.high},${result.medium || 0}`;
    const blob = new Blob([headers + row], { type: 'text/csv' });
    downloadFile(blob, `scan_${result.image.replace(/[:/]/g, '_')}.csv`);
  };

  const downloadFile = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <Box size={40} color="#38bdf8" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Scan de Imagem Docker</h2>
      </div>

      <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Ex: node:18-alpine"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            style={inputStyle}
          />
          <button disabled={loading} style={{ ...buttonStyle, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            {loading ? 'Analisando...' : 'Analisar'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '0.9rem', padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <label style={radioLabelStyle}>
            <input type="radio" value="trivy" checked={scannerType === 'trivy'} onChange={(e) => setScannerType(e.target.value)} />
            Scanner Trivy
          </label>
          <label style={radioLabelStyle}>
            <input type="radio" value="docker-scout" checked={scannerType === 'docker-scout'} onChange={(e) => setScannerType(e.target.value)} />
            Docker Scout
          </label>
        </div>

        {scannerType === 'docker-scout' && (
          <div style={authBoxStyle}>
            <div style={authTitleStyle}><Lock size={14} /> Autenticação Docker Hub</div>
            <div style={{ position: 'relative' }}>
              <User size={16} style={iconInputStyle} />
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ ...inputStyle, paddingLeft: '40px' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconInputStyle} />
              <input type="password" placeholder="PAT" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, paddingLeft: '40px' }} />
            </div>
          </div>
        )}
      </form>

      {error && <div style={errorBoxStyle}><XCircle size={20} /> {error}</div>}

      {result && (
        <div style={resultCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ margin: 0 }}>Relatório: {result.image}</h3>
            <span style={badgeStyle}>via {result.scanner_used}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div style={{ ...statusBoxStyle, borderLeftColor: '#ef4444' }}>
              <p style={statusLabelStyle}>Críticas</p>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>{result.critical}</span>
            </div>
            <div style={{ ...statusBoxStyle, borderLeftColor: '#fbbf24' }}>
              <p style={statusLabelStyle}>Altas</p>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24' }}>{result.high}</span>
            </div>
            <div style={{ ...statusBoxStyle, borderLeftColor: '#38bdf8' }}>
              <p style={statusLabelStyle}>Médias</p>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>{result.medium || 0}</span>
            </div>
          </div>

          {/* --- Seção de Exportação --- */}
          <div style={exportSectionStyle}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 10px 0' }}>Exportar Relatório:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={exportJSON} style={exportButtonStyle}>
                <FileJson size={16} /> JSON
              </button>
              <button onClick={exportCSV} style={exportButtonStyle}>
                <FileSpreadsheet size={16} /> CSV
              </button>
            </div>
          </div>

          {result.critical === 0 && result.high === 0 && (
            <div style={successMessageStyle}>
              <CheckCircle size={20} />
              <span>Imagem validada com sucesso!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const authBoxStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '20px', 
  backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155'
};

const authTitleStyle = {
  gridColumn: '1 / span 2', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '5px', 
  display: 'flex', alignItems: 'center', gap: '5px'
};

const exportSectionStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px solid #334155'
};

const exportButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: '#0f172a',
  color: '#cbd5e1',
  border: '1px solid #334155',
  padding: '8px 15px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  transition: 'all 0.2s'
};

const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none', fontSize: '0.9rem' };
const iconInputStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' };
const buttonStyle = { backgroundColor: '#38bdf8', color: '#0f172a', padding: '0 30px', borderRadius: '8px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' };
const radioLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1' };
const resultCardStyle = { backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' };
const statusBoxStyle = { borderLeft: '4px solid', padding: '10px 15px', backgroundColor: '#0f172a', borderRadius: '0 8px 8px 0' };
const statusLabelStyle = { margin: 0, fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };
const badgeStyle = { fontSize: '0.75rem', color: '#94a3b8', backgroundColor: '#0f172a', padding: '4px 12px', borderRadius: '12px', border: '1px solid #334155' };
const errorBoxStyle = { backgroundColor: '#451a1a', border: '1px solid #ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fecaca' };
const successMessageStyle = { marginTop: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', justifyContent: 'center' };

export default DockerScanner;