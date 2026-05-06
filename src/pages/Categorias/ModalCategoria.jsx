import { useEffect, useState } from "react";
import "./CategoriasPage.css";

export default function ModalCategoria({ open, onClose, onSave, editando }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (editando) {
      setForm({
        ...editando,
        grp_flgatv: editando.grp_flgatv || "S",
      });
    } else {
      setForm({
        grp_codgrp: "",
        grp_desgrp: "",
        grp_ramgrp: "P",
        grp_flgatv: "S",
      });
    }
  }, [editando]);

  function handleImagem(e) {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      grp_imgfile: file,
      preview,
    }));
  }

  function salvar() {
    onSave(form);
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <h3>{editando ? "Editar" : "Nova"} Categoria</h3>

        <input
          placeholder="Código"
          value={form.grp_codgrp || ""}
          disabled={true} //{!!editando}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              grp_codgrp: e.target.value,
            }))
          }
        />

        <input
          placeholder="Descrição"
          value={form.grp_desgrp || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              grp_desgrp: e.target.value,
            }))
          }
        />

        <select
          value={form.grp_ramgrp || "P"}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              grp_ramgrp: e.target.value,
            }))
          }
        >
          <option value="P">Pizza</option>
          <option value="B">Bebida</option>
          <option value="D">Diversos</option>
        </select>

        <select
          value={form.grp_flgatv || "S"}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              grp_flgatv: e.target.value,
            }))
          }
        >
          <option value="S">Ativo</option>
          <option value="N">Inativo</option>
        </select>

        {/* 🔥 UPLOAD */}
        <div className="upload-box">
          <label>Imagem</label>

          <input type="file" accept="image/*" onChange={handleImagem} />

          {(form.preview || form.grp_urlfot) && (
            <img
              src={form.preview || form.grp_urlfot}
              className="preview-img"
            />
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="btn-primary" onClick={salvar}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
