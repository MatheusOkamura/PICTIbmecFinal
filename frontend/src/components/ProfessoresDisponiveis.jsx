import React from 'react';

const ProfessoresDisponiveis = ({ professores, inscricaoFechada, escolherOrientador }) => {
  return (
    <div>
      <h2>Professores Disponíveis</h2>
      <ul>
        {professores.map(professor => (
          <li key={professor.id}>
            {professor.nome}
            <button
              onClick={() => escolherOrientador(professor.id)}
              disabled={inscricaoFechada}
            >
              Escolher Orientador
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfessoresDisponiveis;