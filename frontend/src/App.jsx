import React, { useState } from 'react';
import SecurityAnalyzer from './components/SecurityAnalyzer';
import DockerScanner from './components/DockerScanner';
import { ShieldCheck, Code, Box, GlobeLock, ArrowLeft } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('menu');

  // Estilos do Dashboard
  const dashboardStyle = {
    minHeight: '100vh',
    padding: '60px 20px',
    maxWidth: '1100px',
    margin: '0 auto',
    textAlign: 'center'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '25px',
    marginTop: '50px'
  };

  const cardStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '40px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    color: '#f8fafc'
  };

  // Função para padronizar o layout das ferramentas com o botão de voltar
  const renderWithBackButton = (Component) => (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <button 
        onClick={() => setCurrentPage('menu')}
        style={{
          position: 'absolute', top: '25px', left: '25px',
          backgroundColor: '#334155', color: 'white', border: 'none',
          padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 10
        }}
      >
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>
      {Component}
    </div>
  );

  // Navegação Condicional
  if (currentPage === 'security-url') {
    return renderWithBackButton(<SecurityAnalyzer />);
  }

  if (currentPage === 'docker-scan') {
    return renderWithBackButton(<DockerScanner />);
  }

  return (
    <div style={dashboardStyle}>
      <header>
        <h1 style={{ fontSize: '2.8rem', color: '#38bdf8', marginBottom: '15px' }}>
          Plataforma de Segurança Cibernética
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          Selecione uma das ferramentas abaixo para realizar auditorias e análises técnicas.
        </p>
      </header>

      <div style={gridStyle}>
        {/* BOTÃO 1: Análise de Segurança de URL */}
        <div 
          style={{ ...cardStyle, border: '2px solid #38bdf8' }} 
          onClick={() => setCurrentPage('security-url')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <ShieldCheck size={54} color="#38bdf8" />
          <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Análise de Segurança de URL</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Verificação de Headers e Cookies</p>
        </div>

        {/* BOTÃO 2: SAST (Ainda desativado) */}
        <div style={{ ...cardStyle, opacity: 0.6, cursor: 'not-allowed' }}>
          <Code size={54} color="#64748b" />
          <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Análise Estática (SAST)</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Em breve</p>
        </div>

        {/* BOTÃO 3: Docker (AGORA ATIVO) */}
        <div 
          style={{ ...cardStyle, border: '2px solid #38bdf8' }} 
          onClick={() => setCurrentPage('docker-scan')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Box size={54} color="#38bdf8" />
          <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Scan de Imagem Docker</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Análise de camadas e vulnerabilidades</p>
        </div>

        {/* BOTÃO 4: WAF (Placeholder) */}
        <div style={{ ...cardStyle, opacity: 0.6, cursor: 'not-allowed' }}>
          <GlobeLock size={54} color="#64748b" />
          <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Verificar WAF em URL</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Em breve</p>
        </div>
      </div>

      <footer style={{ marginTop: '80px', color: '#475569', fontSize: '0.9rem' }}>
        Trabalho de Conclusão de Curso - Uniceumar - 2026
        <br />
        Autor: José Leandro de Sousa Silva
      </footer>
    </div>
  );
}

export default App;