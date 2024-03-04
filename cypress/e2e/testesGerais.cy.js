import * as pedidoAuto from "../functions/pedidoAutomatico/pedidoAutomatico";
import * as pedidoManual from "../functions/pedidoManual/pedidoManual";
import * as resumo from "../functions/resumoPedido/resumoPedido";
import * as modal from "../functions/utils/validarModais";
import * as utils from "../functions/utils/utils";
import { TESTESGERAIS } from "../functions/utils/envVariaveis";
import {
    textBotaoPedidoManual,
    textBotaoPedidoAuto,
} from "../functions/utils/constants";

function logarEncerrarProcessarPed(botaoPedido) {
    utils.logarAcessarReiniciarCotacao(TESTESGERAIS);
    utils.encerrarCotacao(TESTESGERAIS);
    utils.processarPedido(botaoPedido, TESTESGERAIS);
}

describe("Checar nas telas do pedido manual se existe textos sobrepostos", () => {
    beforeEach(() => {
        logarEncerrarProcessarPed(textBotaoPedidoManual);
    });
    it("Deve acessar tela de pedido automatico e checar se textos ultrapassam o tamanho da div", () => {
        modal.reiniciarPedidoAlterandoVencimento(true);
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.reload(true);
        logarEncerrarProcessarPed(textBotaoPedidoAuto);
        utils.checarTextosSobrepostos("pedido", TESTESGERAIS); // checa a tabela de produtos do pedido automatico
    });
    it("Deve acessar tela de pedido manual e checar se textos a nivel item ultrapassam o tamanho da div", () => {
        utils.checarTextosSobrepostos("pedidoManual", TESTESGERAIS);
    });
    it("Deve acessar tela de pedido manual e checar se textos a nivel resposta ultrapassam o tamanho da div", () => {
        utils.checarTextosSobrepostos("pedidoManualResposta", TESTESGERAIS);
    });
});

describe("Checar na tela de resumo se existe textos sobrepostos", () => {
    beforeEach(() => {
        utils.logarAcessarReiniciarCotacao(TESTESGERAIS);
    });
    it("Deve acessar as tabelas da tela de resumo e checar se textos ultrapassam o tamanho da div", () => {
        utils.checarTextosSobrepostos("resumo", TESTESGERAIS); // checa a tabela de resposta tela de resumo
    });
    it("Deve acessar as tabelas dentro das modais de produtos respondidos na tela de resumo e checar se textos ultrapassam o tamanho da div", () => {
        resumo.checarTextosSobrepostosRespondidos();
    });
});

describe("Checar na tela revisão e envio se existe textos sobrepostos", () => {
    beforeEach(() => {
        logarEncerrarProcessarPed(textBotaoPedidoAuto);
    });
    it("Deve acessar as tabelas de produtos da tela de revisão e envio e checar se textos ultrapassam o tamanho da div", () => {
        utils.clicarEmBotaoPedidoGerado("Confirmar Pedido");
        pedidoAuto.checarSituacao("Confirmado");
        utils.checarTextosSobrepostos("revisaoEnvio", TESTESGERAIS); // checa a tabela de produtos da tela revisao e envio
    });
});

describe("Verificar no fluxo do cliente os dados de situação de cotacao e pedido", () => {
    beforeEach(() => {
        utils.logarAcessarReiniciarCotacao(TESTESGERAIS);
    });
    it("Deve passar por todo o fluxo de situações do pedido menos os enviados e checar se correspondem ao esperado", () => {
        pedidoAuto.checagemGeralSituacao(TESTESGERAIS);
        cy.get('[class*="MuiBox-root"]')
            .find("button")
            .contains("Pedido")
            .click();
        pedidoAuto.checarSituacao("Em criação");
        cy.get('[class*="MuiBox-root"]')
            .find("button")
            .contains("Resumo")
            .click();
        pedidoAuto.checarSituacao("Em Analise");
    });
});

describe("Testar envio do pedido", () => {
    beforeEach(() => {
        logarEncerrarProcessarPed(textBotaoPedidoManual);
    });
    it("Deve gerar o pedido manual, confirmar, enviar o pedido sem looping depois voltar o status da cotacao para em analise", () => {
        pedidoManual.gerarPedidoManualConfirmar();
        utils.enviarPedidoSemLooping();
        utils.deletarPedidosMudarParaEmAnalise(TESTESGERAIS);
        logarEncerrarProcessarPed(textBotaoPedidoManual);
    });
});
