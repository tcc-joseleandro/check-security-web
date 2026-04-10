import React, { useState } from 'react';
import axios from 'axios';
import { GlobeLock, Search, Loader2, ShieldCheck, XCircle, Link2 } from 'lucide-react';

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

    // Garante que a URL comece com https:// para passar no seu middleware do backend
    const formattedUrl = url.toLowerCase().startsWith('https://') 
      ? url 
      : `https://${url.replace('http://', '')}`;

    try {
      const response = await axios.post('http://localhost:3000/waf/scan', {
        url: formattedUrl
      });
      
      setResult(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao processar análise de WAF.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <GlobeLock size={40} color="#38bdf8" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Análise de WAF</h2>
      </div>

      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>
        Identifique firewalls de aplicação web ativos utilizando fingerprinting do <strong>wafw00f</strong>.
      </p>

      {/* Formulário */}
      <form onSubmit={handleScan} style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Link2 size={20} style={{ position: 'absolute', left: '15px', top: '18px', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Ex: https://google.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px',
              border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white',
              fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
            }}
          />
        </div>
        <button 
          disabled={loading || !url}
          style={{
            backgroundColor: '#38bdf8', color: '#0f172a', border: 'none',
            padding: '0 30px', borderRadius: '12px', fontWeight: 'bold', 
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem'
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {loading ? 'Analisando...' : 'Scan'}
        </button>
      </form>

      {/* Erro */}
      {error && (
        <div style={{ 
          backgroundColor: '#451a1a', border: '1px solid #ef4444', 
          padding: '20px', borderRadius: '12px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px', color: '#fecaca'
        }}>
          <XCircle size={24} />
          <span>{error}</span>
        </div>
      )}

      {/* Resultado Final */}
      {result && (
        <div style={{ 
          backgroundColor: '#1e293b', padding: '35px', borderRadius: '16px', 
          border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '12px' }}>
              <ShieldCheck size={32} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>Resultado do Fingerprint</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Relatório gerado pelo wafw00f</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
              <p style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 'bold' }}>
                URL Analisada
              </p>
              <p style={{ margin: 0, fontSize: '1.1rem', wordBreak: 'break-all', color: '#cbd5e1' }}>
                {result.url}
              </p>
            </div>

            <div style={{ 
              padding: '20px', backgroundColor: '#0f172a', borderRadius: '12px', 
              border: `1px solid ${result.firewall !== 'None' ? '#38bdf8' : '#334155'}` 
            }}>
              <p style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 'bold' }}>
                Firewall Detectado
              </p>
              <p style={{ 
                margin: 0, fontSize: '1.5rem', fontWeight: 'bold', 
                color: result.firewall !== 'None' ? '#38bdf8' : '#f59e0b' 
              }}>
                {result.firewall === 'None' ? 'Nenhum Identificado' : result.firewall}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WafScan;