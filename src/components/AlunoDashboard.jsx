import React from 'react';

const AlunoDashboard = () => {
  const [inscricaoFechada, setInscricaoFechada] = React.useState(false);

  const handleCadastrarProjeto = () => {
    // Lógica para cadastrar projeto
  };

  return (
    <div>
      { /* Texto: Cadastre seu primeiro projeto de iniciação científica! */ }
      <p>Cadastre seu primeiro projeto de iniciação científica!</p>
      <button
        onClick={handleCadastrarProjeto}
        disabled={inscricaoFechada}
      >
        Cadastrar Projeto
      </button>
    </div>
  );
};

export default AlunoDashboard;