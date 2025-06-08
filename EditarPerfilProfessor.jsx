import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "./EditarPerfilProfessor.css";

const EditarPerfilProfessor = () => {
  const { id } = useParams();
  const [perfil, setPerfil] = useState({
    nome: "",
    email: "",
    telefone: "",
    areas_interesse: [],
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await api.get(`/professores/${id}`);
        setPerfil(response.data);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    };

    fetchPerfil();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPerfil({ ...perfil, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/professores/${id}`, perfil);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao atualizar perfil. Tente novamente.");
    }
  };

  return (
    <div className="editar-perfil-container">
      <h1>Editar Perfil Professor</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={perfil.nome}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={perfil.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone:</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={perfil.telefone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="areas_interesse">Áreas de Interesse:</label>
          <div className="areas-interesse-container">
            {Array.isArray(perfil.areas_interesse) &&
              (perfil.areas_interesse.map((area, idx) => (
                <div key={idx} className="area-interesse-item">
                  {area}
                </div>
              )) || null)}
          </div>
        </div>
        <button type="submit" className="btn-submit">
          Atualizar Perfil
        </button>
      </form>
    </div>
  );
};

export default EditarPerfilProfessor;