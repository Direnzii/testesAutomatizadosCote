import * as pedidoManual from "../functions/pedidoManual/pedidoManual";
import * as reset from "../functions/utils/resetarCotacao";
import * as utils from "../functions/utils/utils";
import * as revEnvio from "../functions/revisaoEnvio/revisaoEnvio";
import { textBotaoPedidoManual } from "../functions/utils/constants";
import { REVISAOENVIO, URL_AMPLIFY } from "../functions/utils/envVariaveis";
import except from "../functions/utils/except";
import { situacoesPedidoEnviado } from "../functions/utils/constants";
import { marcarTodasCheckboxItem } from "../functions/pedidoManual/checkBoxPedidoManual";

const login = (cotacao) => {
    cy.session(["revisaoEnvio"], () => {
        utils.acessarProcessarPedido(textBotaoPedidoManual, cotacao);
        marcarTodasCheckboxItem();
        utils.clicarEmBotaoPedidoGerado("Inserir no Pedido");
    });
};

beforeEach(() => {
    login(REVISAOENVIO);
    cy.visit(`${URL_AMPLIFY}/pedido-automatico/${REVISAOENVIO}`);
    utils.confirmarPedido();
    except();
    reset.getSituacao().then((situacao) => {
        if (situacoesPedidoEnviado.includes(situacao)) {
            Cypress.session.clearAllSavedSessions();
            login(REVISAOENVIO);
            cy.visit(`${URL_AMPLIFY}/pedido-automatico/${REVISAOENVIO}`);
            utils.confirmarPedido();
            except();
        }
    });
});

describe("Tela de revisão e envio", () => {
    it("Deve checar scroll das tabelas economia, retorno faturamento, produtos e unidades pós envio de pedido", () => {
        utils.enviarPedidoSemLooping();
        revEnvio.checarSchollResumoDosPedidos();
        utils.deletarPedidosMudarParaEmAnalise(REVISAOENVIO);
        utils.acessarProcessarPedido(textBotaoPedidoManual, REVISAOENVIO);
        marcarTodasCheckboxItem();
        utils.clicarEmBotaoPedidoGerado("Inserir no Pedido");
    });
});
