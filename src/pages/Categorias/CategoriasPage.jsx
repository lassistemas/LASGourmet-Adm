import { useEffect, useState } from "react";
import LayoutBase from "../../components/layout/LayoutBase";
import api from "../../services/api";
import ModalCategoria from "./ModalCategoria";
import "./CategoriasPage.css";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [tamanhos, setTamanhos] = useState([]);

  // 🔥 NORMALIZA STATUS
  function isAtivo(valor) {
    return String(valor).trim().toUpperCase() === "S";
  }

  async function carregar() {
    try {
      const res = await api.get("/adm/categorias");
      console.log("Categorias:", res.data);

      // 🔥 normaliza dados
      const dados = res.data.map((c) => ({
        ...c,
        grp_flgatv: String(c.grp_flgatv).trim().toUpperCase(),
      }));

      setCategorias(dados);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function abrirTamanhos(cat) {
    setCategoriaSelecionada(cat);

    try {
      const res = await api.get(`/categorias/${cat.grp_codgrp}/tamanhos`);
      setTamanhos(res.data);
    } catch (err) {
      console.error(err);
      setTamanhos([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setModalOpen(true);
  }

  function editar(item) {
    setEditando(item);
    setModalOpen(true);
  }

  async function salvar(form) {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key !== "preview") {
          formData.append(key, form[key] ?? "");
        }
      });

      if (editando) {
        await api.put(`/adm/categorias/${editando.grp_codgrp}`, formData);
      } else {
        await api.post("/adm/categorias", formData);
      }

      setModalOpen(false);
      carregar();
    } catch (err) {
      console.error(err);
    }
  }

  async function excluir(id) {
    if (!window.confirm("Deseja excluir?")) return;

    await api.delete(`/adm/categorias/${id}`);
    carregar();
  }

  return (
    <LayoutBase titulo="Categorias">
      <div className="cat-page">
        {/* HEADER */}
        <div className="cat-header">
          <h2>Categorias</h2>
          <button className="btn-primary" onClick={abrirNovo}>
            + Nova Categoria
          </button>
        </div>

        {/* LISTA */}
        <div className="cat-grid">
          {loading && <p>Carregando...</p>}

          {categorias.map((c) => (
            <div key={c.grp_codgrp} className="cat-card">
              <img src={c.grp_urlfot || "/sem-imagem.png"} alt="" />

              <h3>{c.grp_desgrp}</h3>

              {/* 🔥 STATUS CORRIGIDO */}
              <span
                className={`status ${isAtivo(c.grp_flgatv) ? "on" : "off"}`}
              >
                {isAtivo(c.grp_flgatv) ? "Ativo" : "Inativo"}
              </span>

              <div className="cat-actions">
                <button onClick={() => editar(c)}>Editar</button>

                <button onClick={() => abrirTamanhos(c)}>Tamanhos</button>

                <button
                  className="danger"
                  onClick={() => excluir(c.grp_codgrp)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 MODAL CATEGORIA (SEPARADO) */}
        <ModalCategoria
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={salvar}
          editando={editando}
        />

        {/* 🔥 MODAL TAMANHOS */}
        {categoriaSelecionada && (
          <div className="modal-overlay">
            <div className="modal large">
              <h3>Tamanhos - {categoriaSelecionada.grp_desgrp}</h3>

              <TabelaTamanhos
                tamanhos={tamanhos}
                setTamanhos={setTamanhos}
                categoria={categoriaSelecionada}
              />

              <button
                className="btn-cancel"
                onClick={() => setCategoriaSelecionada(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </LayoutBase>
  );
}
