# Guia de Publicação no IIS (Windows)

Este guia descreve os passos para publicar o sistema **Escola Van** no IIS (Internet Information Services) em um ambiente Windows local.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1.  **Node.js (v18+)**: [Download](https://nodejs.org/)
2.  **Python (v3.8+)**: [Download](https://www.python.org/) (Marque a opção "Add Python to PATH" na instalação)
3.  **IIS (Internet Information Services)**:
    *   Painel de Controle > Programas e Recursos > Ativar ou desativar recursos do Windows.
    *   Marque **Serviços de Informações da Internet**.
4.  **IIS URL Rewrite Module**: [Download](https://www.iis.net/downloads/microsoft/url-rewrite)
5.  **Application Request Routing (ARR)**: [Download](https://www.iis.net/downloads/microsoft/application-request-routing)

---

## Passo 1: Preparar a Aplicação

1.  Abra o terminal na pasta do projeto.
2.  Instale as dependências e faça o build:
    ```powershell
    npm install
    npm run build
    ```
    *Isso criará a pasta `dist` com o código compilado e copiará os scripts do chatbot.*

3.  Instale as dependências do Python (se ainda não fez):
    ```powershell
    pip install flask flask-cors scikit-learn pandas numpy
    ```

---

## Passo 2: Configurar o IIS

1.  **Habilitar Proxy Reverso no ARR:**
    *   Abra o **Gerenciador do IIS** (IIS Manager).
    *   Clique no nome do servidor (raiz) na árvore à esquerda.
    *   No painel central, clique duas vezes em **Application Request Routing Cache**.
    *   No painel da direita ("Actions"), clique em **Server Proxy Settings**.
    *   Marque a caixa **Enable proxy**.
    *   Clique em **Apply** à direita.

2.  **Criar o Site:**
    *   No IIS Manager, clique com o botão direito em **Sites** > **Adicionar Site**.
    *   **Nome do site:** `EscolaVan`
    *   **Caminho físico:** Selecione a pasta raiz do projeto (ex: `D:\ADS4NB\Transporte_Escolar_2025`).
    *   **Porta:** Escolha uma porta (ex: `8080`) ou deixe `80` se não houver outro site usando.
    *   **Nome do host:** Deixe em branco para acesso local via IP ou `localhost`.

3.  **Verificar o web.config:**
    *   O projeto já possui um arquivo `web.config` na raiz configurado para redirecionar todas as requisições para `http://localhost:3000`.
    *   Certifique-se de que este arquivo está na pasta raiz.

---

## Passo 3: Rodar a Aplicação

O IIS funcionará como um "Proxy Reverso", repassando as requisições para o Node.js. Portanto, o Node.js precisa estar rodando.

### Opção A: Rodar Manualmente (Teste)
1.  No terminal, dentro da pasta do projeto, execute:
    ```powershell
    npm run prod
    ```
2.  Acesse o site no navegador: `http://localhost:8080` (ou a porta que configurou no IIS).

### Opção B: Rodar como Serviço (Produção/Definitivo)
Para que o Node.js rode automaticamente em segundo plano (sem terminal aberto), use o **PM2** ou **NSSM**.

**Usando PM2 (Recomendado):**
1.  Instale o PM2 globalmente:
    ```powershell
    npm install pm2 -g
    ```
2.  Inicie a aplicação:
    ```powershell
    pm2 start dist/server.js --name "escola-van"
    ```
3.  Para salvar e iniciar com o Windows (requer configuração extra de permissões), ou apenas mantenha o PM2 rodando.

---

## Resolução de Problemas

*   **Erro 502.3 - Bad Gateway:** O Node.js não está rodando na porta 3000. Verifique se executou `npm run prod`.
*   **Chatbot não responde:** Verifique se o Python está no PATH do sistema. O Node.js tenta executar `python` via linha de comando. Teste rodando `python --version` no terminal.
*   **Permissões:** Certifique-se de que o usuário `IIS_IUSRS` tem permissão de leitura na pasta do projeto.
