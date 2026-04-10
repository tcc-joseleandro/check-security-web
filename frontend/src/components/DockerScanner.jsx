import React, { useState } from 'react';
import axios from 'axios';
import { Box, Search, AlertTriangle, Loader2, XCircle, CheckCircle } from 'lucide-react';

const DockerScanner = () => {
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // O Axios envia para o seu backend Node na porta 3000
      const response = await axios.post('http://localhost:3000/container/scan', {
        image: imageName
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

      <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="Ex: node:18-alpine"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
        />
        <button disabled={loading} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '0 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? <Loader2 className="animate-spin" /> : 'Analisar'}
        </button>
      </form>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}><XCircle size={20} /> {error}</div>}

      {result && (
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3 style={{ marginBottom: '20px' }}>Resultado para: {result.image}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '15px' }}>
              <p>Críticas</p>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.critical}</span>
            </div>
            <div style={{ borderLeft: '4px solid #fbbf24', paddingLeft: '15px' }}>
              <p>Altas</p>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.high}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DockerScanner;