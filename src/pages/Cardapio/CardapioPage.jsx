import { useState } from "react";
import LayoutBase from "../../components/layout/LayoutBase";
import "./CardapioPage.css";

export default function CardapioPage() {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [nomeProduto, setNomeProduto] = useState("");

  function adicionarProduto() {
    if (!nomeProduto) return;

    const novo = {
      id: Date.now(),
      nome: nomeProduto,
      tamanhos: [],
      massas: [],
      bordas: [],
    };

    setProdutos([...produtos, novo]);
    setNomeProduto("");
  }

  function selecionarProduto(produto) {
    setProdutoSelecionado(produto);
  }

  function atualizarProduto(novoProduto) {
    setProdutos((prev) =>
      prev.map((p) => (p.id === novoProduto.id ? novoProduto : p)),
    );
    setProdutoSelecionado(novoProduto);
  }

  return (
    <LayoutBase titulo="Cardápio">
      <div className="cardapio-page">
        {/* ESQUERDA */}
        <div className="lista-produtos">
          <h3>Produtos</h3>

          <div className="novo-produto">
            <input
              placeholder="Novo produto"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
            />
            <button onClick={adicionarProduto}>+</button>
          </div>

          {produtos.map((p) => (
            <div
              key={p.id}
              className={`produto-item ${
                produtoSelecionado?.id === p.id ? "ativo" : ""
              }`}
              onClick={() => selecionarProduto(p)}
            >
              🍕 {p.nome}
            </div>
          ))}
        </div>

        {/* DIREITA */}
        <div className="editor-produto">
          {!produtoSelecionado && (
            <div className="empty">Selecione um produto</div>
          )}

          {produtoSelecionado && (
            <EditorProduto
              produto={produtoSelecionado}
              onChange={atualizarProduto}
            />
          )}
        </div>
      </div>
    </LayoutBase>
  );
}

//////////////////////////////////////////////////////////
// 🔥 EDITOR
//////////////////////////////////////////////////////////

function EditorProduto({ produto, onChange }) {
  function addItem(lista, campo, novo) {
    onChange({
      ...produto,
      [campo]: [...produto[campo], novo],
    });
  }

  function remover(campo, id) {
    onChange({
      ...produto,
      [campo]: produto[campo].filter((i) => i.id !== id),
    });
  }

  return (
    <div className="editor">
      <h2>{produto.nome}</h2>

      <SecaoVariacao
        titulo="Tamanhos"
        campo="tamanhos"
        produto={produto}
        onAdd={(item) => addItem("tamanhos", "tamanhos", item)}
        onRemove={(id) => remover("tamanhos", id)}
        comPreco
      />

      <SecaoVariacao
        titulo="Massas"
        campo="massas"
        produto={produto}
        onAdd={(item) => addItem("massas", "massas", item)}
        onRemove={(id) => remover("massas", id)}
      />

      <SecaoVariacao
        titulo="Bordas"
        campo="bordas"
        produto={produto}
        onAdd={(item) => addItem("bordas", "bordas", item)}
        onRemove={(id) => remover("bordas", id)}
        comPreco
      />
    </div>
  );
}

//////////////////////////////////////////////////////////
// 🔧 SEÇÃO GENÉRICA
//////////////////////////////////////////////////////////

function SecaoVariacao({
  titulo,
  campo,
  produto,
  onAdd,
  onRemove,
  comPreco = false,
}) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  function adicionar() {
    if (!nome) return;

    onAdd({
      id: Date.now(),
      nome,
      preco: comPreco ? Number(preco) : 0,
    });

    setNome("");
    setPreco("");
  }

  return (
    <div className="secao">
      <h3>{titulo}</h3>

      <div className="form">
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        {comPreco && (
          <input
            type="number"
            placeholder="Preço"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
        )}

        <button onClick={adicionar}>Adicionar</button>
      </div>

      <div className="lista">
        {produto[campo].map((item) => (
          <div key={item.id} className="item">
            <span>
              {item.nome}
              {comPreco && ` - R$ ${item.preco}`}
            </span>

            <button onClick={() => onRemove(item.id)}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
}
