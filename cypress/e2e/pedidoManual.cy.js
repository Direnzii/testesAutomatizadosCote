import * as utils from "../functions/utils/utils";
import * as pedidoManual from "../functions/pedidoManual/pedidoManual";
import * as check from "../functions/pedidoManual/checkBoxPedidoManual";
import { textBotaoPedidoManual } from "../functions/utils/constants";
import { PEDIDOMANUAL, URL_AMPLIFY } from "../functions/utils/envVariaveis";
import except from "../functions/utils/except";

const login = (cotacao) => {
    cy.session(["pedidoManual-auto"], () => {
        utils.acessarProcessarPedido(textBotaoPedidoManual, cotacao);
    });
};

beforeEach(() => {
    login(PEDIDOMANUAL);
    cy.visit(`${URL_AMPLIFY}/pedido-manual/${PEDIDOMANUAL}`);
    cy.wait(2000); // pois o pedido manual carrega por varios gets e demora, 2s é um tempo razoavel para trazer pelo menos os itens
    pedidoManual.confirmarTelaManualCerta();
    pedidoManual.desmarcarSwitch();
    check.marcarTodasCheckboxItem();
    except();
});

describe("Testar elementos, exclusão e insersão no pedido manual", () => {
    it("Deve acessar o pedido manual e verificar todos os elementos", () => {
        pedidoManual.verificarElementos();
    });
    it("Deve acessar o pedido manual, excluir um item e validar na aba dos excluidos se o mesmo consta, depois inserir no pedido novamente e validar", () => {
        pedidoManual.validarExcluscaoInsercaoItem();
    });
});
