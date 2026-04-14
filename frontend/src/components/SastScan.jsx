import React, { useState } from 'react';
import axios from 'axios';
import { Code, Loader2, ShieldCheck, AlertCircle, FileCode, Upload, FileArchive } from 'lucide-react';

const SastScan = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/x-zip-compressed" || selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo .zip válido.");
      setFile(null);
    }
  };

  const handleSastScan = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Importante: Ao enviar arquivos, o axios configura o Content-Type automaticamente
      const response = await axios.post('http://localhost:3000/sast/scan', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao processar o arquivo ZIP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '100px 20px', maxWidth: '900px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <Code size={40} color="#38bdf8" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Análise Estática (SAST)</h2>
      </div>

      <form onSubmit={handleSastScan} style={{ marginBottom: '40px', textAlign: 'center' }}>
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px', border: '2px dashed #334155', borderRadius: '16px',
          backgroundColor: '#0f172a', cursor: 'pointer', transition: 'border-color 0.2s',
          gap: '10px'
        }}>
          {file ? <FileArchive size={40} color="#38bdf8" /> : <Upload size={40} color="#64748b" />}
          <span style={{ color: '#94a3b8' }}>{file ? file.name : "Clique para selecionar o código em .zip"}</span>
          <input type="file" accept=".zip" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        <button 
          disabled={loading || !file} 
          style={{ 
            marginTop: '20px', width: '100%', backgroundColor: '#38bdf8', color: '#0f172a', 
            padding: '15px', borderRadius: '12px', fontWeight: 'bold', 
            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Auditoria de Código'}
        </button>
      </form>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#451a1a', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ef4444' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Relatório SAST</h3>
            <span style={{ backgroundColor: '#0f172a', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', color: '#38bdf8', border: '1px solid #38bdf8' }}>
              {result.total_issues || 0} Vulnerabilidades
            </span>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {result.issues && result.issues.length > 0 ? (
              result.issues.map((issue, index) => (
                <div key={index} style={{ padding: '15px', backgroundColor: '#0f172a', borderRadius: '10px', borderLeft: `4px solid ${issue.severity === 'high' ? '#ef4444' : '#fbbf24'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <AlertCircle size={16} color={issue.severity === 'high' ? '#ef4444' : '#fbbf24'} />
                    <strong style={{ fontSize: '1rem' }}>{issue.title}</strong>
                  </div>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#94a3b8' }}>{issue.description}</p>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.8rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileCode size={14} /> {issue.file}</span>
                    <span>Linha: {issue.line}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <ShieldCheck size={48} color="#10b981" style={{ marginBottom: '10px' }} />
                <p>Código Limpo! Nenhuma vulnerabilidade detectada.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SastScan;