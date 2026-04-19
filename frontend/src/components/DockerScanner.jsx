import React, { useState } from 'react';
import axios from 'axios';
import { Box, Search, AlertTriangle, Loader2, XCircle, CheckCircle, Shield } from 'lucide-react';

const DockerScanner = () => {
  const [imageName, setImageName] = useState('');
  const [scannerType, setScannerType] = useState('trivy'); // 'trivy' ou 'docker-scout'
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
        scanner: scannerType // Enviando a escolha para o backend
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <Box size={40} color="#38bdf8" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Scan de Imagem Docker</h2>
      </div>

      <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Ex: node:18-alpine ou nginx:latest"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
          />
          <button 
            disabled={loading} 
            style={{ 
                backgroundColor: '#38bdf8', color: '#0f172a', padding: '0 30px', 
                borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            {loading ? 'Analisando...' : 'Analisar'}
          </button>
        </div>

        {/* Opção de escolha do Scanner */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.9rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="scanner" 
              value="trivy" 
              checked={scannerType === 'trivy'} 
              onChange={(e) => setScannerType(e.target.value)} 
            />
            Scanner Trivy (Recomendado)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="scanner" 
              value="docker-scout" 
              checked={scannerType === 'docker-scout'} 
              onChange={(e) => setScannerType(e.target.value)} 
            />
            Docker Scout
          </label>
        </div>
      </form>

      {error && (
        <div style={{ backgroundColor: '#451a1a', border: '1px solid #ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fecaca' }}>
          <XCircle size={20} />
          {error}
        </div>
      )}

      {result && (
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ margin: 0 }}>Resultado: {result.image}</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', backgroundColor: '#0f172a', padding: '4px 12px', borderRadius: '12px', border: '1px solid #334155' }}>
              via {result.scanner_used}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div style={{ borderLeft: '4px solid #ef4444', padding: '10px 15px', backgroundColor: '#0f172a', borderRadius: '0 8px 8px 0' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Críticas</p>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>{result.critical}</span>
            </div>
            <div style={{ borderLeft: '4px solid #fbbf24', padding: '10px 15px', backgroundColor: '#0f172a', borderRadius: '0 8px 8px 0' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Altas</p>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24' }}>{result.high}</span>
            </div>
            <div style={{ borderLeft: '4px solid #38bdf8', padding: '10px 15px', backgroundColor: '#0f172a', borderRadius: '0 8px 8px 0' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Médias</p>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>{result.medium || 0}</span>
            </div>
          </div>

          {result.critical === 0 && result.high === 0 && (
            <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', justifyContent: 'center' }}>
              <CheckCircle size={20} />
              <span>Imagem segura para deploy!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DockerScanner;