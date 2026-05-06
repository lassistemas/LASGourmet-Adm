import { useEffect, useState, useRef } from "react";
import LayoutBase from "../../components/layout/LayoutBase";
import api from "../../services/api";
import "./PedidosPage.css";
import "./PedidosModal.css";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("P");
  const [pedidoModal, setPedidoModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImpressao, setPreviewImpressao] = useState(null);

  const audioRef = useRef(null);
  const ultimoPedidoRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );

    audioRef.current.preload = "auto";
    audioRef.current.volume = 1;

    const ativarAudio = () => {
      audioRef.current
        ?.play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        })
        .catch(() => {});

      window.removeEventListener("click", ativarAudio);
      window.removeEventListener("touchstart", ativarAudio);
    };

    window.addEventListener("click", ativarAudio);
    window.addEventListener("touchstart", ativarAudio);

    return () => {
      window.removeEventListener("click", ativarAudio);
      window.removeEventListener("touchstart", ativarAudio);
    };
  }, []);

  async function carregarPedidos() {
    try {
      const response = await api.get("/pedido/delivery", {
        params: { status: statusFiltro },
      });

      const lista = response.data || [];

      setPedidos(lista);

      if (lista.length > 0) {
        const pedidoMaisRecente = lista[0]?.id;

        const pedidosPendentes = lista.filter(
          (pedido) =>
            !pedido.status ||
            pedido.status === "P" ||
            pedido.status === "Pendente",
        );

        const deveTocar =
          (ultimoPedidoRef.current &&
            ultimoPedidoRef.current !== pedidoMaisRecente) ||
          (statusFiltro === "P" && pedidosPendentes.length > 0);

        if (deveTocar && audioRef.current?.src) {
          audioRef.current.currentTime = 0;

          audioRef.current.play().catch(() => {});
        }

        ultimoPedidoRef.current = pedidoMaisRecente;
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);

    carregarPedidos();

    const interval = setInterval(() => {
      carregarPedidos();
    }, 15000);

    return () => clearInterval(interval);
  }, [statusFiltro]);

  async function atualizarStatusDireto(pedido, status) {
    try {
      const response = await api.put("/pedido/delivery/status", {
        codfil: pedido.filial,
        anoped: pedido.ano,
        numped: pedido.id,
        status,
      });

      if (response.data?.success) {
        /* SE ACEITOU */
        if (status === "E") {
          enviarPedidoWhatsApp(pedido);
        }

        carregarPedidos();

        if (pedidoModal?.id === pedido.id) {
          setPedidoModal(null);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  }

  async function abrirPedido(pedido) {
    try {
      const response = await api.get("/pedido/delivery/produtos", {
        params: {
          codfil: pedido.filial,
          anoped: pedido.ano,
          numped: pedido.id,
        },
      });
      console.log(response);
      setPedidoModal({
        ...pedido,
        itens: response.data || [],
      });
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    }
  }

  function fecharPedido() {
    setPedidoModal(null);
  }

  function formatarTelefone(fone) {
    if (!fone) return "Sem celular";

    const numero = String(fone).replace(/\D/g, "");

    /* CELULAR COM DDD */
    if (numero.length === 11) {
      return numero.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    /* FIXO COM DDD */
    if (numero.length === 10) {
      return numero.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    /* SEM DDD */
    if (numero.length === 9) {
      return numero.replace(/(\d{5})(\d{4})/, "$1-$2");
    }

    return fone;
  }
  /* WHATSAPP WEB NA MESMA JANELA NOMEADA
   Reutiliza a mesma aba/janela "las_whatsapp"
   Evita abrir múltiplas sessões separadas
*/
  let whatsappWindow = null;

  function enviarPedidoWhatsApp(pedido) {
    if (!pedido?.fone) return;

    const numero = String(pedido.fone).replace(/\D/g, "");
    if (!numero) return;

    /* GARANTE DDI BRASIL */
    const numeroCompleto = numero.startsWith("55") ? numero : `55${numero}`;

    const mensagem = encodeURIComponent(
      `Olá ${pedido.cliente || ""}! 👋

Seu pedido #${pedido.id} foi ACEITO e já entrou em preparo. 🍕🔥

📦 Tipo: ${pedido.tipo || ""}
📍 Endereço: ${pedido.endereco || ""}
💳 Pagamento: ${pedido.pagamento || ""}
💰 Total: ${Number(pedido.total || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}

Obrigado por pedir com a LASDelivery!`,
    );

    const url = `https://web.whatsapp.com/send?phone=${numeroCompleto}&text=${mensagem}`;

    /* REAPROVEITA MESMA JANELA */
    if (whatsappWindow && !whatsappWindow.closed) {
      whatsappWindow.location.href = url;
      whatsappWindow.focus();
    } else {
      whatsappWindow = window.open(
        url,
        "las_whatsapp",
        "width=1200,height=900,scrollbars=yes,resizable=yes",
      );
    }
  }
  const FiltroStatus = () => (
    <div className="pedido-filtro-box">
      <select
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
        className="pedido-filtro"
      >
        <option value="P">Pendentes</option>
        <option value="E">Preparo</option>
        <option value="M">Entregador</option>
        <option value="F">Fechados</option>
        <option value="R">Rejeitado</option>
        <option value="C">Cancelados</option>
        <option value="T">Todos</option>
      </select>
    </div>
  );

  if (loading) {
    return (
      <LayoutBase titulo="Pedidos">
        <div className="pedidos-dashboard">
          <h2>Carregando pedidos...</h2>
        </div>
      </LayoutBase>
    );
  }

  function abrirWhatsApp(fone, cliente) {
    if (!fone) return;

    const numero = String(fone).replace(/\D/g, "");
    if (!numero) return;

    /* AJUSTA BRASIL */
    const numeroCompleto = numero.startsWith("55") ? numero : `55${numero}`;

    const mensagem = encodeURIComponent(
      `Olá ${cliente || ""}, aqui é da LASDelivery sobre seu pedido.`,
    );

    /* MELHOR PARA WHATSAPP WEB DESKTOP */
    const url = `https://web.whatsapp.com/send?phone=${numeroCompleto}&text=${mensagem}`;

    /* REAPROVEITA A MESMA ABA/JANELA */
    if (whatsappWindow && !whatsappWindow.closed) {
      whatsappWindow.location.href = url;
      whatsappWindow.focus();
    } else {
      whatsappWindow = window.open(
        url,
        "las_whatsapp",
        "width=1200,height=900,scrollbars=yes,resizable=yes",
      );
    }
  }

  async function imprimirCozinha(pedido) {
    try {
      const response = await api.get("/pedido/delivery/produtos", {
        params: {
          codfil: pedido.filial,
          anoped: pedido.ano,
          numped: pedido.id,
        },
      });

      const itens = response.data || [];

      const conteudo = `
      <html>
        <head>
          <title>Cozinha Pedido #${pedido.id}</title>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 10px;
              width: 80mm;
              color: #000;
              font-size: 14px;
            }

            h1, h2, h3, p {
              margin: 4px 0;
            }

            .center {
              text-align: center;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }

            .item {
              margin-bottom: 8px;
            }

            .item strong {
              font-size: 16px;
            }

            .subitem {
              margin-left: 10px;
              font-size: 13px;
            }

            .obs {
              margin-top: 10px;
              padding: 8px;
              border: 1px dashed #000;
            }

            @media print {
              body {
                width: 80mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>LASDelivery</h2>
            <h3>COZINHA</h3>
            <h1>Pedido #${pedido.id}</h1>
          </div>

          <div class="divider"></div>

          <p><strong>Cliente:</strong> ${pedido.cliente || ""}</p>
          <p><strong>Tipo:</strong> ${pedido.tipo || ""}</p>
          <p><strong>Hora:</strong> ${pedido.hora || ""}</p>

          <div class="divider"></div>

          <h3>ITENS</h3>

          ${itens
            .map(
              (produto) => `
                <div class="item">
                  <strong>${produto.quantidade}x ${produto.nome}</strong>

                  ${
                    produto.subitens?.length
                      ? produto.subitens
                          .map(
                            (sub) => `
                              <div class="subitem">
                                + ${sub.quantidade}x ${sub.nome}
                              </div>
                            `,
                          )
                          .join("")
                      : ""
                  }
                </div>
              `,
            )
            .join("")}

          <div class="divider"></div>

          <div class="obs">
            <strong>Observação:</strong><br/>
            ${pedido.observacao || "Nenhuma"}
          </div>

          
        </body>
      </html>
    `;
      abrirPreview(`Cozinha Pedido #${pedido.id}`, conteudo);
    } catch (error) {
      console.error("Erro ao imprimir cozinha:", error);
    }
  }

  async function imprimirEntrega(pedido) {
    try {
      const response = await api.get("/pedido/delivery/produtos", {
        params: {
          codfil: pedido.filial,
          anoped: pedido.ano,
          numped: pedido.id,
        },
      });

      const itens = response.data || [];

      const conteudo = `
      <html>
        <head>
          <title>Entrega Pedido #${pedido.id}</title>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 10px;
              width: 80mm;
              color: #000;
              font-size: 14px;
            }

            h1, h2, h3, p {
              margin: 4px 0;
            }

            .center {
              text-align: center;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }

            .item {
              margin-bottom: 6px;
            }

            .address {
              padding: 8px;
              border: 1px dashed #000;
              margin: 8px 0;
            }

            @media print {
              body {
                width: 80mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>LASDelivery</h2>
            <h3>ENTREGA</h3>
            <h1>Pedido #${pedido.id}</h1>
          </div>

          <div class="divider"></div>

          <p><strong>Cliente:</strong> ${pedido.cliente || ""}</p>
          <p><strong>Telefone:</strong> ${pedido.fone || ""}</p>

          <div class="address">
            <strong>Endereço:</strong><br/>
            ${pedido.endereco_completo || pedido.endereco || ""}
          </div>

          <p><strong>Pagamento:</strong> ${pedido.pagamento || ""}</p>

          <div class="divider"></div>

          <h3>RESUMO</h3>

          ${itens
            .map(
              (produto) => `
                <div class="item">
                  ${produto.quantidade}x ${produto.nome}
                </div>
              `,
            )
            .join("")}

          <div class="divider"></div>

          <h2>Total: ${Number(pedido.total || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</h2>

          <div class="obs">
            <strong>Observação:</strong><br/>
            ${pedido.observacao || "Nenhuma"}
          </div>

          
        </body>
      </html>
    `;

      abrirPreview(`Entrega Pedido #${pedido.id}`, conteudo);
    } catch (error) {
      console.error("Erro ao imprimir entrega:", error);
    }
  }

  function abrirPreview(titulo, html) {
    setPreviewImpressao({
      titulo,
      html,
    });
  }

  function fecharPreview() {
    setPreviewImpressao(null);
  }

  function imprimirPreview() {
    const conteudo = document.getElementById("print-area").innerHTML;

    const largura = 500;
    const altura = 900;

    const left = window.screenX + (window.outerWidth - largura) / 2;
    const top = window.screenY + (window.outerHeight - altura) / 2;

    const win = window.open(
      "",
      "LASDelivery_Impressao",
      `
      width=${largura},
      height=${altura},
      left=${left},
      top=${top},
      scrollbars=yes,
      resizable=yes
    `,
    );

    win.document.write(`
    <html>
      <head>
        <title>LASDelivery Impressão</title>
        <meta charset="utf-8" />

        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 80mm;
            background: white;
            font-family: Arial, sans-serif;
          }

          body {
            padding: 3mm;
          }

          .print-container {
            width: 74mm;
            margin: 0 auto;
          }
        </style>
      </head>

      <body>
        <div class="print-container">
          ${conteudo}
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.focus();
              window.print();
            }, 600);
          };
        </script>
      </body>
    </html>
  `);

    win.document.close();
  }

  return (
    <LayoutBase titulo="Pedidos">
      <div className="pedidos-dashboard">
        <div className="pedidos-topo">
          <h2>Pedidos Ativos</h2>
          <FiltroStatus />
        </div>

        {!pedidos.length ? (
          <p>Nenhum pedido encontrado.</p>
        ) : (
          <div className="pedidos-lista-cards">
            {pedidos.map((pedido) => (
              <div
                key={`${pedido.filial}-${pedido.ano}-${pedido.id}`}
                className="pedido-card-full"
              >
                <div className="pedido-card-topo">
                  <div>
                    <h3>#{pedido.id}</h3>
                    <strong>{pedido.cliente}</strong>
                  </div>

                  <span className={`status-badge status-${pedido.status}`}>
                    {pedido.status}
                  </span>
                </div>

                <div className="pedido-tipo-linha">
                  <span className="pedido-tipo">{pedido.tipo}</span>

                  <span className="pedido-fone">
                    <button
                      className="pedido-fone whatsapp"
                      onClick={() => abrirWhatsApp(pedido.fone, pedido.cliente)}
                    >
                      {formatarTelefone(pedido.fone)}
                    </button>
                  </span>
                </div>

                <p>{pedido.endereco_completo || "Endereço não informado"}</p>

                <div className="pedido-card-resumo">
                  <span>{pedido.hora}</span>

                  <strong>
                    {Number(pedido.total || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>
                <div className="actions">
                  {/* STATUS P = Pendente */}
                  {pedido.status === "P" && (
                    <>
                      <button
                        className="btn accept_btn"
                        onClick={() => atualizarStatusDireto(pedido, "E")}
                      >
                        Aceitar
                      </button>

                      <button
                        className="btn reject_btn"
                        onClick={() => atualizarStatusDireto(pedido, "R")}
                      >
                        Rejeitar
                      </button>
                    </>
                  )}

                  {/* STATUS E = Em preparo */}
                  {pedido.status === "E" && (
                    <>
                      <button
                        className="btn delivery_btn"
                        onClick={() => atualizarStatusDireto(pedido, "M")}
                      >
                        Entregador
                      </button>
                      <button
                        className="btn kitchen_btn"
                        onClick={() => imprimirCozinha(pedido)}
                      >
                        Imprimir Cozinha
                      </button>

                      <button
                        className="btn cancel_btn"
                        onClick={() => atualizarStatusDireto(pedido, "C")}
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {/* STATUS M = Em entrega */}
                  {pedido.status === "M" && (
                    <>
                      <button
                        className="btn print_btn"
                        onClick={() => imprimirEntrega(pedido)}
                      >
                        Imprimir Entrega
                      </button>

                      <button
                        className="btn finish_btn"
                        onClick={() => atualizarStatusDireto(pedido, "F")}
                      >
                        Finalizar
                      </button>

                      <button
                        className="btn cancel_btn"
                        onClick={() => atualizarStatusDireto(pedido, "C")}
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  <button
                    className="btn details_btn"
                    onClick={() => abrirPedido(pedido)}
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {pedidoModal && (
          <div className="pedido-modal-overlay" onClick={fecharPedido}>
            <div className="pedido-modal" onClick={(e) => e.stopPropagation()}>
              <button className="fechar-modal" onClick={fecharPedido}>
                ×
              </button>

              <div className="pedido-modal-content">
                <h2>Pedido #{pedidoModal.id}</h2>

                <p>
                  <strong>Cliente:</strong> {pedidoModal.cliente}
                </p>

                <p>
                  <strong>Telefone:</strong> {pedidoModal.fone}
                </p>

                <p>
                  <strong>Pagamento:</strong> {pedidoModal.pagamento}
                </p>

                <p>
                  <strong>Endereço:</strong> {pedidoModal.endereco_completo}
                </p>

                <p>
                  <strong>Observação:</strong> {pedidoModal.observacao}
                </p>

                <div className="pedido-modal-produtos">
                  <h3>Itens do Pedido</h3>
                  {pedidoModal.itens?.map((produto, index) => {
                    /* TOTAL JÁ VEM CORRETO DO BACKEND */
                    const totalItemCompleto = Number(produto.total || 0);

                    const valorUnitario =
                      Number(produto.quantidade || 0) > 0
                        ? totalItemCompleto / Number(produto.quantidade || 1)
                        : totalItemCompleto;

                    return (
                      <div key={index} className="pedido-modal-produto-card">
                        <div className="pedido-modal-produto-header">
                          <strong>
                            {produto.tipo === 7
                              ? `${produto.descricao || ""} ${produto.quantidade}x ${produto.nome}`
                              : `${produto.quantidade}x ${produto.nome}`}
                          </strong>

                          <span className="pedido-modal-produto-preco">
                            {Number(totalItemCompleto).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>

                        <div className="pedido-modal-produto-unitario">
                          Unitário:{" "}
                          {valorUnitario.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>

                        {produto.subitens?.length > 0 && (
                          <div className="pedido-modal-produto-subitens">
                            {produto.subitens.map((subitem, subIndex) => {
                              const nome = subitem.nome.trim().toUpperCase();

                              const ehExtraPago =
                                Number(subitem.tipo || 0) !== 7 &&
                                (nome.includes("BORDA") ||
                                  nome.includes("ADICIONAL") ||
                                  nome.includes("EXTRA"));

                              return (
                                <div
                                  key={subIndex}
                                  className={`pedido-modal-subitem ${
                                    ehExtraPago
                                      ? "pedido-modal-subitem-pago"
                                      : "pedido-modal-subitem-info"
                                  }`}
                                >
                                  <span>
                                    {Number(subitem.tipo || 0) === 7
                                      ? `${subitem.nome || ""}`
                                      : `${subitem.quantidade}x ${subitem.nome} ${subitem.tipo}`}
                                  </span>

                                  <span className="pedido-modal-subitem-preco">
                                    {ehExtraPago
                                      ? Number(
                                          subitem.total || 0,
                                        ).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })
                                      : ""}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="pedido-modal-resumo-financeiro">
                  {/* SUBTOTAL */}
                  <div className="pedido-modal-resumo-linha">
                    <span>Sub-total</span>

                    <strong>
                      {Number(
                        pedidoModal.itens?.reduce((acc, item) => {
                          const extras =
                            item.subitens?.reduce((subAcc, sub) => {
                              const nome = String(sub.nome || "").toUpperCase();

                              /* IGNORA SABORES */
                              if (Number(sub.tipo || 0) === 7) {
                                return subAcc;
                              }

                              /* SOMA APENAS EXTRAS REAIS */
                              if (
                                nome.includes("BORDA") ||
                                nome.includes("ADICIONAL") ||
                                nome.includes("EXTRA")
                              ) {
                                return subAcc + Number(sub.total || 0);
                              }

                              return subAcc;
                            }, 0) || 0;

                          return acc + Number(item.total || 0) + extras;
                        }, 0) || 0,
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>

                  {/* TAXA */}
                  <div className="pedido-modal-resumo-linha">
                    <span>Taxa de Entrega</span>

                    <strong>
                      {Number(pedidoModal.taxa_entrega || 0).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        },
                      )}
                    </strong>
                  </div>

                  {/* TOTAL */}
                  <div className="pedido-modal-resumo-total">
                    <span>Total</span>

                    <strong>
                      {(
                        Number(
                          pedidoModal.itens?.reduce((acc, item) => {
                            const extras =
                              item.subitens?.reduce((subAcc, sub) => {
                                const nome = String(
                                  sub.nome || "",
                                ).toUpperCase();

                                if (Number(sub.tipo || 0) === 7) {
                                  return subAcc;
                                }

                                if (
                                  nome.includes("BORDA") ||
                                  nome.includes("ADICIONAL") ||
                                  nome.includes("EXTRA")
                                ) {
                                  return subAcc + Number(sub.total || 0);
                                }

                                return subAcc;
                              }, 0) || 0;

                            return acc + Number(item.total || 0) + extras;
                          }, 0) || 0,
                        ) + Number(pedidoModal.taxa_entrega || 0)
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {previewImpressao && (
        <div className="print-preview-overlay">
          <div className="print-preview-modal">
            <div className="print-preview-header">
              <h2>{previewImpressao.titulo}</h2>

              <div className="print-preview-actions">
                <button className="print_action_btn" onClick={imprimirPreview}>
                  Imprimir
                </button>

                <button className="close_action_btn" onClick={fecharPreview}>
                  Fechar
                </button>
              </div>
            </div>

            <div className="print-preview-body">
              <div
                id="print-area"
                className="thermal-paper"
                dangerouslySetInnerHTML={{ __html: previewImpressao.html }}
              />
            </div>
          </div>
        </div>
      )}
    </LayoutBase>
  );
}
