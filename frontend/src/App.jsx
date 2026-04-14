import React, { useState } from 'react';
// Imports dos seus componentes - Verifique se os nomes dos arquivos estão idênticos
import SecurityAnalyzer from './components/SecurityAnalyzer';
import SastScan from './components/SastScan';
import DockerScanner from './components/DockerScanner';
import WafScan from './components/WafScan';

// Ícones
import { ShieldCheck, Code, Box, GlobeLock, ArrowLeft } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('menu');

  // Estilos padronizados
  const styles = {
    dashboard: {
      minHeight: '100vh',
      backgroundColor: '#0f172a', // Fundo escuro para garantir que não fique branco
      color: '#f8fafc',
      padding: '60px 20px',
      textAlign: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '25px',
      maxWidth: '1100px',
      margin: '50px auto'
    },
    card: {
      backgroundColor: '#1e293b',
      border: '2px solid #334155',
      borderRadius: '16px',
      padding: '40px 20px',
      cursor: 'pointer',
      transition: 'transform 0.2s, border-color 0.2s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px'
    },
    backBtn: {
      position: 'fixed',
      top: '20px',
      left: '20px',
      backgroundColor: '#38bdf8',
      color: '#0f172a',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 100
    }
  };

  // Função para renderizar o conteúdo baseado no estado
  const renderContent = () => {
    switch (currentPage) {
      case 'security-url':
        return <SecurityAnalyzer />;
      case 'sast-scan':
        return <SastScan />;
      case 'docker-scan':
        return <DockerScanner />;
      case 'waf-analyze':
        return <WafScan />;
      default:
        return (
          <div style={styles.grid}>
            {/* CARD 1 */}
            <div 
              style={{...styles.card, borderColor: '#38bdf8'}} 
              onClick={() => setCurrentPage('security-url')}
            >
              <ShieldCheck size={50} color="#38bdf8" />
              <h3>Segurança de URL</h3>
              <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Headers e Cookies</p>
            </div>

            {/* CARD 2 */}
            <div 
              style={{...styles.card, borderColor: '#38bdf8'}} 
              onClick={() => setCurrentPage('sast-scan')}
            >
              <Code size={50} color="#38bdf8" />
              <h3>Análise Estática</h3>
              <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Scan de Código (SAST)</p>
            </div>

            {/* CARD 3 */}
            <div 
              style={{...styles.card, borderColor: '#38bdf8'}} 
              onClick={() => setCurrentPage('docker-scan')}
            >
              <Box size={50} color="#38bdf8" />
              <h3>Imagem Docker</h3>
              <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Vulnerabilidades CVE</p>
            </div>

            {/* CARD 4 */}
            <div 
              style={{...styles.card, borderColor: '#38bdf8'}} 
              onClick={() => setCurrentPage('waf-analyze')}
            >
              <GlobeLock size={50} color="#38bdf8" />
              <h3>Detecção de WAF</h3>
              <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Firewall de Aplicação</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* Botão de voltar flutuante (só aparece se não estiver no menu) */}
      {currentPage !== 'menu' && (
        <button style={styles.backBtn} onClick={() => setCurrentPage('menu')}>
          <ArrowLeft size={18} /> Voltar ao Painel
        </button>
      )}

      <header>
        <h1 style={{ fontSize: '2.5rem', color: '#38bdf8', marginBottom: '10px' }}>
          CyberSecurity Portal
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          Sistema de Auditoria TCC - Uniceumar 2026
        </p>
      </header>

      {/* Renderização Dinâmica */}
      {renderContent()}

      <footer style={{ marginTop: '60px', color: '#475569', fontSize: '0.8rem' }}>
        Autor: José Leandro de Sousa Silva
      </footer>
    </div>
  );
}

export default App;