import * as login from "../functions/login/login";
import { URL_DEMO } from "../functions/utils/envVariaveis";

describe("Login incorreto no sistema", () => {
    it("Deve validar caso o login esteja incorreto", () => {
        login.login_incorreto("usuario.errado", "445566", URL_DEMO);
    });
});

describe.skip("Logando no sistema", () => {
    it("Deve logar como adm", () => {
        untilLogin.login(USUARIO_DEMO, SENHA_DEMO, URL_DEMO);
    });
});

describe.skip("Logando no cliente", () => {
    it("Deve logar no cliente e acessar a tela principal", () => {
        untilAutoOrder.except(); // estava retornando um erro da aplicação porem que nao afeta o teste
        untilLogin.login(USUARIO_DEMO, SENHA_DEMO, URL_DEMO);
        untilLogin.acessandoCliente(CLIENTE_USUARIO);
    });
});

describe.skip("Acessando cotação pela aba cotações", () => {
    it("Deve abrir a aba cotações e clicar na cotação com o ID selecionado", () => {
        untilLogin.login(USUARIO_DEMO, SENHA_DEMO, URL_DEMO);
        untilLogin.acessandoCliente(CLIENTE_USUARIO);
        untilLogin.acessandoCotacao(COTACAO);
    });
});
