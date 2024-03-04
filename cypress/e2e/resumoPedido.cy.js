import * as utils from "../functions/utils/utils";
import * as modais from "../functions/utils/validarModais";
import * as resumo from "../functions/resumoPedido/resumoPedido";
import * as reset from "../functions/utils/resetarCotacao";
import {
    RESUMOPEDIDO,
    RESUMOPEDIDOVERIFICARRESPOSTAS,
    URL_AMPLIFY,
    URL_AUTH_DEMO,
} from "../functions/utils/envVariaveis";
import except from "../functions/utils/except";

const login = (cotacao) => {
    cy.session(["resumoPedido"], () => {
        utils.logarAcessarReiniciarCotacao(cotacao);
    });
};

describe("Tela inicial de resposta da cotação (Resumo)", () => {
    beforeEach(() => {
        login(RESUMOPEDIDO);
        cy.visit(`${URL_AMPLIFY}/pedido-resumo/${RESUMOPEDIDO}`);
        cy.intercept(
            "GET",
            `${URL_AUTH_DEMO}/resumoresposta/getFornecedores/${RESUMOPEDIDO}?*`
        )
            .as("getFornecedores")
            .wait("@getFornecedores");
        reset.reiniciarCompletamenteCotacao();
        except();
    });
    it("Deve checar a visibilidade dos componentes principais", () => {
        resumo.checagemElementosTelaResumoPrincipais();
    });
    it("Deve checar o filtros por categorias", () => {
        resumo.checagemElementosTelaResumoCategoria();
    });
    it("Deve checar os dados de dentro dos acordeons do cliente", () => {
        resumo.checagemElementosTelaResumoAcordeonCliente();
    });
    it("Deve abrir as modais cancelar cotacao, alterar vencimento, geração do pedido automatico, geração do pedido manual", () => {
        modais.funcoesBotaoModal.cancelarCotacao();
        modais.funcoesBotaoModal.alterarVencimento();
        utils.encerrarCotacao(RESUMOPEDIDO);
        modais.funcoesBotaoModal.pedidoAutoAndManual();
    });
    it("Deve acessar as modais de resposta OK e checar os dados e a ordenação", () => {
        resumo.checarDadosModalLupa("dados", false);
    });
    it("Deve acessar as modais de resposta OK e checar se existem dados sobreposto", () => {
        resumo.checarDadosModalLupa("textoSobreposto", false);
    });
    it("Deve acessar as modais de resposta OK e checar o filtro", () => {
        resumo.checarDadosModalLupa("filtro", false);
    });
    it("Deve selecionar uma quantidade de representantes exibidos, clicar em verificar resposta e checar request", () => {
        resumo.checarSelectResumoResposta();
    });
});

describe.only("Tela inicial (Resumo) prevensão de bugs", () => {
    beforeEach(() => {
        login(RESUMOPEDIDOVERIFICARRESPOSTAS);
        cy.visit(
            `${URL_AMPLIFY}/pedido-resumo/${RESUMOPEDIDOVERIFICARRESPOSTAS}`
        );
        cy.intercept(
            "GET",
            `${URL_AUTH_DEMO}/resumoresposta/getFornecedores/${RESUMOPEDIDOVERIFICARRESPOSTAS}?*`
        )
            .as("getFornecedores")
            .wait("@getFornecedores");
        reset.reiniciarCompletamenteCotacao();
        except();
    });
    it("Deve pegar um sinalizador respondido, mudar para aguardando, clicar em verificar resposta e ver se realmente mudou, depois responder e verificar de novo", () => {
        resumo.validarVerificarRespostaSinalizadores(
            RESUMOPEDIDOVERIFICARRESPOSTAS
        );
    });
});
