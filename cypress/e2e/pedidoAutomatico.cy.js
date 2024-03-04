import * as pedidoAuto from "../functions/pedidoAutomatico/pedidoAutomatico";
import * as utils from "../functions/utils/utils";
import * as pedidoManual from "../functions/pedidoManual/pedidoManual";
import { textBotaoPedidoAuto } from "../functions/utils/constants";
import except from "../functions/utils/except";
import { PEDIDOAUTOMATICO, URL_AMPLIFY } from "../functions/utils/envVariaveis";

const login = (cotacao) => {
    cy.session(["pedidoAutomatico"], () => {
        utils.acessarProcessarPedido(textBotaoPedidoAuto, cotacao);
    });
};

describe("Realizar o processamento e checagens do pedido automático", () => {
    beforeEach(() => {
        login(PEDIDOAUTOMATICO);
        cy.visit(`${URL_AMPLIFY}/pedido-automatico/${PEDIDOAUTOMATICO}`);
        except();
    });
    it("Deve validar a visibilidade dos elementos da aba filtrar produtos da tela do pedido automático", () => {
        pedidoAuto.validarBotoesPedidoAuto();
    });
    it("Deve abrir o acordeon de analise do pedido e realizar ordenações", () => {
        pedidoAuto.abrirAcordeonPrimeiroPedido();
        pedidoAuto.clicarEmTodasOrdenacoesPedidoAuto();
    });
    it("Deve pegar o EAN, Código, Descrição e Fabricante, filtrar no input e validar o resultado do filtro", () => {
        pedidoAuto.abrirAcordeonPrimeiroPedido();
        pedidoAuto.validacaoDoFiltroPedidoAuto();
    });
    it("Deve excluir um produto aleatorio utilizando o filtro e o check geral e validar se o mesmo não consta no pedido, ao final reiniciar o pedido", () => {
        pedidoAuto.abrirAcordeonPrimeiroPedido();
        pedidoAuto.validarExclusaoPedidoAutomatico();
    });
    it("Deve acessar o pedido manual pelo pedido automatico, com todos os itens e depois reiniciar o pedido", () => {
        pedidoManual.acessarPedidoManualTodosProdutos();
    });
});
