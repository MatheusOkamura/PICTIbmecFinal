from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Atividade(Base):
    __tablename__ = "atividades"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)
    projeto_id = Column(Integer, ForeignKey("projetos.id"))
    professor_id = Column(Integer, ForeignKey("orientadores.id"))
    data_criacao = Column(DateTime)