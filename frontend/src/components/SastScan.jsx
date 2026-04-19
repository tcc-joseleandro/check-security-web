import React, { useState } from 'react';
import axios from 'axios';
import { FileCode, UploadCloud, AlertCircle } from 'lucide-react';

const SastScan = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');

    // Função que identifica URLs no texto e as torna clicáveis
    const renderDescriptionWithLinks = (text) => {
        if (!text) return "Sem detalhes disponíveis.";
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        
        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                const cleanUrl = part.replace(/[).,]+$/, "");
                return (
                    <a 
                        key={index} 
                        href={cleanUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#38bdf8', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Selecione um arquivo .ZIP primeiro.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError('');
        setReport(null);

        try {
            const response = await axios.post('http://localhost:3000/sast/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReport(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Erro ao conectar com o servidor SAST.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <div style={containerStyle}>
                <UploadCloud size={40} color="#38bdf8" />
                <h2 style={{ color: '#38bdf8', margin: '15px 0' }}>Análise Estática de Código</h2>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Faça o upload do projeto em ZIP para escanear com Horusec.</p>
                
                <input 
                    type="file" 
                    accept=".zip" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    style={{ marginBottom: '20px', color: '#94a3b8' }}
                />
                
                <br />
                
                <button 
                    onClick={handleUpload} 
                    disabled={loading}
                    style={{...buttonStyle, opacity: loading ? 0.6 : 1}}
                >
                    {loading ? 'Analisando...' : 'Iniciar Análise'}
                </button>
            </div>

            {error && (
                <div style={errorStyle}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {report && (
                <div style={{ marginTop: '40px', textAlign: 'left' }}>
                    <h3 style={{ color: '#f8fafc' }}>
                        Encontradas {report.total_issues} vulnerabilidades
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                        {report.issues.map((issue, idx) => (
                            <div key={idx} style={cardStyle}>
                                <div style={{ marginBottom: '10px' }}>
                                    <span style={{...badgeStyle, backgroundColor: issue.severity === 'high' || issue.severity === 'critical' ? '#ef4444' : '#f59e0b'}}>
                                        {issue.severity.toUpperCase()}
                                    </span>
                                    <h4 style={{ color: '#38bdf8', margin: '10px 0 5px 0' }}>{issue.title}</h4>
                                </div>
                                
                                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                                    {renderDescriptionWithLinks(issue.description)}
                                </p>

                                <div style={footerStyle}>
                                    <FileCode size={14} /> 
                                    <span>{issue.file} | Linha: {issue.line}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Estilos Internos ---
const containerStyle = {
    backgroundColor: '#1e293b',
    padding: '40px',
    borderRadius: '16px',
    border: '2px dashed #334155',
};

const buttonStyle = {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '12px 25px',
    borderRadius: '8px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer'
};

const cardStyle = {
    backgroundColor: '#1e293b',
    padding: '20px',
    borderRadius: '12px',
    borderLeft: '4px solid #334155'
};

const badgeStyle = {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: '#fff'
};

const footerStyle = {
    marginTop: '15px',
    fontSize: '0.8rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderTop: '1px solid #334155',
    paddingTop: '10px'
};

const errorStyle = {
    backgroundColor: '#451a1a',
    color: '#f87171',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
};

export default SastScan;