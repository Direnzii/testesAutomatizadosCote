import * as utils from "../utils/utils";

export function checarSchollResumoDosPedidos() {
    cy.get('[class*="MuiTabs-flexContainer css-"]')
        .contains("Economia")
        .should("be.visible")
        .click();
    cy.get('[class*="MuiTableContainer-root css-"]')
        .scrollTo("bottom")
        .scrollTo("top")
        .scrollTo("right")
        .scrollTo("left");
    cy.get('[class*="MuiTabs-flexContainer css-"]')
        .contains("Retorno faturamento")
        .should("be.visible")
        .click();
    cy.get('[class*="MuiTableContainer-root css-"]')
        .scrollTo("bottom")
        .scrollTo("top")
        .scrollTo("right")
        .scrollTo("left");
    cy.get('[class*="MuiTabs-flexContainer css-"]')
        .contains("Produtos e unidades")
        .should("be.visible")
        .click();
    cy.get('[class*="MuiTableContainer-root css-"]')
        .scrollTo("bottom")
        .scrollTo("top")
        .scrollTo("right")
        .scrollTo("left");
}

export function enviarPedidoSemLooping() {
    utils.clicarEmBotaoPedidoGerado("Enviar Pedidos");
    modal.modalIsVisible();
    modal.clicarEmComponenteModalEnviarPedido("Enviar sem looping");
    utils.checarAvisoRevisaoEnvio("Pedidos enviados com sucesso.");
}
