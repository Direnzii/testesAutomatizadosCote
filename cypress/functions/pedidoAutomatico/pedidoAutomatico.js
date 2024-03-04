import * as utils from "../utils/utils";
import {
    listaSituacoes,
    botoesPedidoClick,
    textBotaoPedidoAuto,
} from "../utils/constants";
import { PEDIDOAUTOMATICO, URL_AUTH_DEMO } from "../utils/envVariaveis";

export function acessarPedidoAutoGerado() {
    cy.get('[class="pedido-resumo-page"]')
        .find("button")
        .contains("Ver Pedidos")
        .click();
}

export function validarBotoesPedidoAuto() {
    cy.get('input[name="produto"]')
        .should("be.visible")
        .type("Testando o input")
        .clear(); //input do filtro de produtos
    cy.get('select[name="fornecedor"]')
        .should("be.visible")
        .find("option")
        .each((optionsForn) => {
            cy.get('select[name="fornecedor"]')
                .should("be.visible")
                .select(optionsForn.text());
        }); //select de fornecedores
    cy.get('select[name="status"]')
        .should("be.visible")
        .select("acima")
        .select("abaixo")
        .select("acima"); //acima abaixo para referencia, historico e cot X ped
    cy.get('select[name="tipoComparacao"]')
        .should("be.visible")
        .select("Valor de histórico")
        .select("Qtd ped. em relação à cot.")
        .select("Valor de referência"); //select referencia, historico e cot X ped
    cy.get('select[name="tipoComparacao"]')
        .next()
        .should("be.visible")
        .type("99.99")
        .type("999.99")
        .type("0.99")
        .type("0.09")
        .clear(); //Valor 0.00 da porcentagem
    cy.get('select[name="filtroPorcentagem"]')
        .should("be.visible")
        .select("%")
        .select("R$"); //select % ou R$
    cy.get("#conflitoDeEmbalagem").should("be.visible").click().click(); //checkbox confito emb
    cy.get("#problemaDeMinimo").should("be.visible").click().click(); //checkbox minimo uni
    cy.get("#oportunidade").should("be.visible").click().click(); //oportunidade de desc
    cy.get("#problemaFaturamentoMinimo").should("be.visible").click().click(); //problema de minimo pedido
    botoesPedidoClick.forEach((botao) => {
        cy.get('[class="content"]')
            .find("button")
            .contains(botao)
            .should("be.visible");
    });
    cy.get('[class="content"]')
        .find("label")
        .contains("Salvar")
        .should("be.visible"); //salvar
    cy.get('[class="content"]')
        .find("label")
        .contains("Total dos Pedidos:")
        .should("be.visible"); //total de pedidos
    cy.get("#todos").should("be.visible"); //checkbox Selecionar todos os produtos
}

export function abrirAcordeonPrimeiroPedido() {
    cy.get('[class="MuiAccordion-region"]')
        .eq(2)
        .find('[data-testid="DoubleArrowIcon"]')
        .first()
        .should("be.visible")
        .click(); // clico no primeiro acordeon eq(2)
    cy.get('[data-testid="conteudo-tabela-row"]').should("be.visible");
    cy.get('[data-testid="conteudo-tabela-cell"]').should("be.visible");
}

export function clicarEmTodasOrdenacoesPedidoAuto() {
    cy.intercept("GET", `${URL_AUTH_DEMO}/pedidoAutomatico/*/itens?busca=*`).as(
        "filtro"
    );
    cy.get('[class*="MuiTable-root"]')
        .find("thead")
        .first()
        .find("td")
        .each((celulaCabecalhoTabelaPedidoAuto) => {
            if (
                celulaCabecalhoTabelaPedidoAuto.text() &&
                celulaCabecalhoTabelaPedidoAuto.get(0).style.cssText !==
                    "display: none;" // existem celulas invisiveis dentro dessa tag, aqui eu filtro elas
            ) {
                cy.get(celulaCabecalhoTabelaPedidoAuto).click().click().click();
                cy.wait("@filtro").its("response.statusCode").should("eq", 200);
            }
        });
}

function filtrarPedidoAuto(textoParaPesquisar) {
    cy.get('[class="MuiAccordion-region"]')
        .first()
        .find("input")
        .first()
        .clear();
    cy.get('[class="MuiAccordion-region"]')
        .first()
        .find("input")
        .first()
        .type(textoParaPesquisar); // escrever o texto no input do filtro
    cy.get('[class="content"]')
        .find("button")
        .contains("Filtrar")
        .should("be.visible")
        .click(); // clicar em filtrar
}

function checarFiltroDeProdutoPedidoAuto(textoParaPesquisar, excluido = false) {
    filtrarPedidoAuto(textoParaPesquisar);
    if (excluido === true) {
        cy.get("span").contains("Nenhum dado encontrado.").should("be.visible");
        cy.get('[class="content"]')
            .find("button")
            .contains("Limpar")
            .should("be.visible")
            .click();
    } else {
        abrirAcordeonPrimeiroPedido();
        cy.get('[data-testid="conteudo-tabela-row"]')
            .first()
            .contains(textoParaPesquisar)
            .should("be.visible"); // verificar se o retorno do filtro esta correto
    }
    cy.get('[class="content"]')
        .find("button")
        .contains("Limpar")
        .should("be.visible")
        .click();
    abrirAcordeonPrimeiroPedido();
}

function validarSeFiltroFunciona(objeto) {
    cy.get(objeto).each((linhaObjt) => {
        checarFiltroDeProdutoPedidoAuto(linhaObjt.text());
    });
}

export function validacaoDoFiltroPedidoAuto() {
    checagemDeAlertasPadraoPedidoAuto();
    cy.get('[data-testid="conteudo-tabela-row"]').then((listObjtProduto) => {
        let indexRandom = Math.floor(
            Math.random() * listObjtProduto.length // randomizo um index para pegar um produto aleatorio dentro da modal
        );
        cy.get('[data-testid="conteudo-tabela-row"]')
            .eq(indexRandom)
            .find('[data-testid="conteudo-tabela-cell"]')
            .each((_, idx_linha) => {
                if (idx_linha === 5 || idx_linha === 6) {
                    cy.get('[data-testid="conteudo-tabela-row"]')
                        .eq(indexRandom)
                        .find('[data-testid="conteudo-tabela-cell"]')
                        .eq(idx_linha)
                        .find("span")
                        .each((spanLinha) => {
                            checarFiltroDeProdutoPedidoAuto(spanLinha.text());
                        });
                }
            });
    });
}

export function abrirTelaProdutosExcluidos() {
    cy.get("button").contains("Ver Produtos Excluidos").click();
}

function verificarEanPedidoManual(ean) {
    cy.get('[class="field"]').contains(ean).should("be.visible");
    cy.get('[class="table-pedido-manual-body--row--column "]')
        .first()
        .should("be.visible")
        .wait(500);
}

function checarSeProdutoEstaNoPedido(ean, excluido) {
    cy.get(".content").find("button").contains("Inserir no Pedido").click();
    if (excluido === true) {
        checarFiltroDeProdutoPedidoAuto(ean, excluido);
        return;
    }
    checarFiltroDeProdutoPedidoAuto(ean);
}

function checagemDeAlertasPadraoPedidoAuto() {
    cy.get(".MuiButtonBase-root").contains("Excluir Produtos").click();
    cy.get("#alert")
        .contains("ATENÇÃO! Nenhum produto foi selecionado.")
        .should("be.visible");
    cy.get("#alert").find("svg").click();
    cy.get("button").contains("Ver Produtos Excluidos").click();
    cy.get("#alert")
        .contains(
            'Não existem produtos excluídos. Para excluir um produto, selecione o produto e clique em "Excluir".'
        )
        .should("be.visible");
    cy.get("#alert").find("svg").click();
}

export function validarExclusaoPedidoAutomatico() {
    // Nessa função eu excluo um produto aleatorio do pedido e depois verifico se ele foi realmente excluído na tela
    checagemDeAlertasPadraoPedidoAuto();
    cy.get('[data-testid="conteudo-tabela-row"]').then((listObjtProduto) => {
        let indexRandom = Math.floor(
            Math.random() * listObjtProduto.length // randomizo um index para pegar um produto aleatorio dentro da modal
        );
        cy.get('[data-testid="conteudo-tabela-row"]')
            .eq(indexRandom)
            .then((objExcluido) => {
                let ean = objExcluido.get(0).querySelector(
                    `[data-testid="conteudo-tabela-cell"]:nth-child(6) span:first-child` // coluna do ean e codigo
                ).textContent;
                let descricao = objExcluido.get(0).querySelector(
                    `[data-testid="conteudo-tabela-cell"]:nth-child(7) span:first-child` // coluna descricao e fabricante
                ).textContent;
                filtrarPedidoAuto(ean);
                cy.get("#todos").click();
                cy.get(".MuiButtonBase-root")
                    .contains("Excluir Produtos")
                    .click();
                checarFiltroDeProdutoPedidoAuto(ean, true);
                checarFiltroDeProdutoPedidoAuto(descricao, true);
            });
    });
}

export function checarSituacao(situacao) {
    cy.get('[class="content"]')
        .find('[class*="jss"]')
        .find('[class*="MuiBox-root"]')
        .find("span")
        .contains(situacao)
        .should("be.visible");
}

export function passarParaProximaSituacao(situacaoAtual, cotacao) {
    if (situacaoAtual === "Em Andamento") {
        utils.encerrarCotacao(cotacao); // esta em andamento, eu encesso para passar para em analise
    } else if (situacaoAtual === "Em Analise") {
        utils.processarPedido(textBotaoPedidoAuto, cotacao); // esta em analise, processo para entrar em criacao
    } else if (situacaoAtual === "Em criação") {
        cy.get("button")
            .should("be.visible")
            .contains("Confirmar Pedido")
            .click(); // esta em criacao, clico em confirmar para ir para confirmado
        cy.get(
            '[class*="MuiButtonBase-root MuiAccordionSummary-root Mui-expanded"]'
        ).contains("Resumo dos pedidos");
        cy.get(
            '[class*="MuiPaper-root MuiPaper-elevation MuiPaper-elevation0 MuiAccordion-root"]'
        )
            .find("strong")
            .contains(" - Pedido Confirmado")
            .should("be.visible");
    }
}

export function checagemGeralSituacao(cotacao) {
    listaSituacoes.forEach((situacao) => {
        checarSituacao(situacao);
        passarParaProximaSituacao(situacao, cotacao);
    });
}

export function marcarCheckTodos() {
    cy.get("#todos")
        .invoke("prop", "checked")
        .then((statusCheck) => {
            if (!statusCheck) {
                cy.get("#todos").click().wait(500);
            }
        });
}
