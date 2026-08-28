// =========================================
// BERNÔ IA
// FRONT-END + NETLIFY FUNCTION + OLLAMA
// =========================================


// =========================================
// ELEMENTOS
// =========================================

const chat =
    document.getElementById("chat");

const form =
    document.getElementById("chat-form");

const input =
    document.getElementById("question");

const sendButton =
    document.getElementById("send-button");


// =========================================
// CONTROLE DA PRIMEIRA PERGUNTA
// =========================================

let primeiraPergunta = true;


// =========================================
// ADICIONAR MENSAGEM
// =========================================

function adicionarMensagem(tipo, texto) {

    const message =
        document.createElement("div");

    message.className =
        tipo === "user"
            ? "message user-message"
            : "message ai-message";


    const icon =
        document.createElement("div");

    icon.className =
        "message-icon";

    icon.textContent =
        tipo === "user"
            ? "👤"
            : "🐯";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const name =
        document.createElement("span");

    name.className =
        "message-name";

    name.textContent =
        tipo === "user"
            ? "VOCÊ"
            : "BERNÔ IA";


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        texto;


    content.appendChild(name);
    content.appendChild(paragraph);

    message.appendChild(icon);
    message.appendChild(content);

    chat.appendChild(message);


    chat.scrollTop =
        chat.scrollHeight;


    return message;
}


// =========================================
// CONSULTAR NETLIFY FUNCTION
// =========================================

async function perguntarIA(pergunta) {

    const response =
        await fetch(
            "/.netlify/functions/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: pergunta,
                    primeiraPergunta: primeiraPergunta
                })
            }
        );


    const respostaBruta =
        await response.text();


    let data;


    try {

        data =
            JSON.parse(
                respostaBruta
            );

    }

    catch (error) {

        console.error(
            "Resposta recebida da Netlify Function:",
            respostaBruta
        );


        throw new Error(
            "A função da IA retornou uma resposta inválida."
        );
    }


    // =====================================
    // ERRO DA FUNCTION / IA
    // =====================================

    if (!response.ok) {

        throw new Error(
            data.error ||
            "Erro ao consultar o Bernô IA."
        );
    }


    // =====================================
    // SEM RESPOSTA
    // =====================================

    if (!data.answer) {

        throw new Error(
            "O Bernô IA não retornou nenhuma resposta."
        );
    }


    return data.answer;
}


// =========================================
// ENVIAR PERGUNTA
// =========================================

async function enviarPergunta(pergunta) {

    pergunta =
        pergunta.trim();


    if (!pergunta) {
        return;
    }


    // =====================================
    // MOSTRAR PERGUNTA DO USUÁRIO
    // =====================================

    adicionarMensagem(
        "user",
        pergunta
    );


    input.value = "";


    // =====================================
    // BLOQUEAR ENQUANTO RESPONDE
    // =====================================

    input.disabled = true;

    sendButton.disabled = true;

    sendButton.textContent = "…";


    // =====================================
    // LOADING
    // =====================================

    const loading =
        adicionarMensagem(
            "ai",
            "Pensando..."
        );


    try {

        const resposta =
            await perguntarIA(
                pergunta
            );


        const paragraph =
            loading.querySelector("p");


        paragraph.textContent =
            resposta;


        // Depois da primeira resposta com sucesso,
        // não se apresenta mais.

        primeiraPergunta = false;

    }

    catch (error) {

        console.error(
            "ERRO BERNÔ IA:",
            error
        );


        const paragraph =
            loading.querySelector("p");


        const erro =
            error.message.toLowerCase();


        if (
            erro.includes("ollama") &&
            (
                erro.includes("conectar") ||
                erro.includes("connection") ||
                erro.includes("failed")
            )
        ) {

            paragraph.textContent =
                "Não consegui conectar ao Ollama. " +
                "Verifique se o Ollama está aberto no computador. 🐯";

        }


        else if (
            erro.includes("ngrok") ||
            erro.includes("tunnel") ||
            erro.includes("túnel")
        ) {

            paragraph.textContent =
                "Não consegui acessar o túnel do Bernô IA. " +
                "Verifique se o ngrok está aberto no computador.";

        }


        else if (
            erro.includes("model") ||
            erro.includes("modelo")
        ) {

            paragraph.textContent =
                "O modelo Bernô não foi encontrado. " +
                "Verifique se o modelo 'berno' existe no Ollama.";

        }


        else if (
            erro.includes("function") ||
            erro.includes("função") ||
            erro.includes("404")
        ) {

            paragraph.textContent =
                "Não consegui acessar a função do Bernô IA no Netlify.";

        }


        else {

            paragraph.textContent =
                "Não consegui responder agora. Erro: " +
                error.message;

        }
    }

    finally {

        input.disabled = false;

        sendButton.disabled = false;

        sendButton.textContent = "→";


        input.focus();


        chat.scrollTop =
            chat.scrollHeight;
    }
}


// =========================================
// FORMULÁRIO
// =========================================

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        enviarPergunta(
            input.value
        );
    }
);


// =========================================
// BOTÕES DE SUGESTÃO
// =========================================

const suggestionButtons =
    document.querySelectorAll(
        "[data-question]"
    );


suggestionButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const pergunta =
                    this.dataset.question;

                enviarPergunta(
                    pergunta
                );
            }
        );
    }
);


// =========================================
// ENTER PARA ENVIAR
// =========================================

input.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            form.requestSubmit();
        }
    }
);


// =========================================
// LOGS
// =========================================

console.log(
    "🐯 Bernô IA carregado."
);

console.log(
    "Modo: Netlify + ngrok + Ollama"
);

console.log(
    "API: /.netlify/functions/chat"
);
