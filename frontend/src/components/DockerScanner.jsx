import React, { useState } from 'react';
import { Box, Search, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const DockerScanner = () => {
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulando a chamada para o backend de segurança
    setTimeout(() => {
      setResult({
        vulnerabilities: 12,
        critical: 2,
        high: 4,
        status: 'Risk Detected'
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <Box size={40} color="#38bdf8" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Scan de Imagem Docker</h2>
      </div>

      <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="Ex: node:latest ou meu-app:v1"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          style={{
            flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #334155',
            backgroundColor: '#0f172a', color: 'white', fontSize: '1rem'
          }}
        />
        <button 
          disabled={loading || !imageName}
          style={{
            backgroundColor: '#38bdf8', color: '#0f172a', border: 'none',
            padding: '0 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
          {loading ? 'Escaneando...' : 'Analisar'}
        </button>
      </form>

      {result && (
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertTriangle color="#fbbf24" />
            <h3 style={{ margin: 0 }}>Relatório de Vulnerabilidades</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '15px' }}>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0' }}>Críticas</p>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.critical}</span>
            </div>
            <div style={{ borderLeft: '4px solid #fbbf24', paddingLeft: '15px' }}>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0' }}>Alta Prioridade</p>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.high}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DockerScanner;