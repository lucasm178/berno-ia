export default async (request) => {
    try {
        const body = await request.json();

        const pergunta = (body.message || "").trim();

        if (!pergunta) {
            return Response.json(
                {
                    error: "Digite uma pergunta."
                },
                {
                    status: 400
                }
            );
        }

        const dadosBerno = `
INFORMAÇÕES SOBRE O SÃO BERNARDO FUTEBOL CLUBE:

Nome:
São Bernardo Futebol Clube.

Apelidos:
- Bernô
- Tigre
- Tigre do ABC

Cidade:
São Bernardo do Campo, São Paulo.

Fundação:
2004.

Cores:
Amarelo e preto.

Estádio:
Estádio Municipal Primeiro de Maio.

O clube participa de competições do futebol paulista e brasileiro.

Caso uma informação específica não esteja disponível,
não invente.
`;

        const prompt = `
Você é o Bernô IA.

Você é especializado no São Bernardo Futebol Clube.

Use as informações abaixo como base:

${dadosBerno}

PERGUNTA DO USUÁRIO:

${pergunta}

INSTRUÇÕES:

- Responda em português do Brasil.
- Seja curto, claro e natural.
- Seja simpático.
- Não invente informações.
- Se não souber, diga que não sabe.
- Nunca diga que você é Gemma, Ollama ou ChatGPT.
- Seu nome é Bernô IA.
`;

        const resposta = await fetch(
            "https://tightwad-dealing-duller.ngrok-free.dev/api/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },

                body: JSON.stringify({
                    model: "berno",

                    prompt: prompt,

                    stream: false,

                    options: {
                        temperature: 0.2,
                        num_predict: 180
                    }
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            return Response.json(
                {
                    error:
                        resultado.error ||
                        "Erro ao consultar o Bernô IA."
                },
                {
                    status: 500
                }
            );
        }

        const texto =
            (resultado.response || "").trim();

        if (!texto) {
            return Response.json(
                {
                    error:
                        "O Bernô IA não retornou nenhuma resposta."
                },
                {
                    status: 500
                }
            );
        }

        return Response.json({
            answer: texto
        });

    } catch (error) {

        console.error(error);

        return Response.json(
            {
                error:
                    "Erro ao conectar com o Bernô IA: " +
                    error.message
            },
            {
                status: 500
            }
        );
    }
};