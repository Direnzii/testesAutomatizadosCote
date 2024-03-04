const listNomeColunasModal = [
    "",
    "",
    "Código / EAN",
    "Nome do Produto / Fabricante",
    "Cot.",
    "Resp.",
    "Emb.",
    "Desc.",
    "Vl. S/ ST",
    "Vl. C/ ST",
];
const listDadosCabecalho = [
    "Fornecedor:",
    "Representante:",
    "Cliente:",
    "Faturamento mínimo:",
    "Validade da resposta:",
    "Prazo de pagamento:",
    "Prazo de entrega:",
    "Observação:",
    "Produto:",
];

let contador;

let listaSituacoes = ["Em Andamento", "Em Analise", "Em criação", "Confirmado"];

let textBotaoPedidoManual = "Pedido Manual";
let textBotaoPedidoAuto = "Pedido Automático";

const botoesPedidoClick = [
    "Ver Produtos Não Respondidos",
    "Limpar",
    "Filtrar",
    "Ver Produtos Excluidos",
    "Ver Respostas Por Produto",
    "Resolver Problemas De Embalagem",
    "Excluir Produtos",
    "Reiniciar Pedidos",
    "Confirmar Pedido",
];

const situacoesPedidoEnviado = [
    "Pedido(s) enviado(s) sem retorno",
    "Pedido(s) enviado(s) com retorno",
    "Aguardando código de pedido",
];

const botoesTelaResumoParaEncerrar = [
    "Exportar Produtos",
    "Verificar respostas",
    "Cancelar Cotação",
    "Alterar Vencimento",
    "Ver Produtos Não Respondidos",
    "Encerrar cotação",
];

export {
    listNomeColunasModal,
    listDadosCabecalho,
    contador,
    listaSituacoes,
    textBotaoPedidoManual,
    textBotaoPedidoAuto,
    botoesPedidoClick,
    situacoesPedidoEnviado,
    botoesTelaResumoParaEncerrar,
};
