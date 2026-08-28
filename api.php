<?php

header("Content-Type: application/json; charset=UTF-8");


// ==========================================
// RECEBER DADOS DO JAVASCRIPT
// ==========================================

$dados = json_decode(
    file_get_contents("php://input"),
    true
);

$pergunta = trim(
    $dados["message"] ?? ""
);


// ==========================================
// VALIDAR PERGUNTA
// ==========================================

if ($pergunta === "") {

    http_response_code(400);

    echo json_encode(
        [
            "error" => "Digite uma pergunta."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ==========================================
// DADOS BÁSICOS DO SÃO BERNARDO
// ==========================================

$dadosBerno = <<<DADOS

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

O clube participa de competições do futebol paulista
e brasileiro.

Caso uma informação específica não esteja disponível
ou você não tenha certeza, não invente.

DADOS;


// ==========================================
// PROMPT
// ==========================================

$prompt = <<<PROMPT

Você é o Bernô IA, uma inteligência artificial
especializada no São Bernardo Futebol Clube.

Use as informações abaixo como base para responder:

$dadosBerno

PERGUNTA DO USUÁRIO:

$pergunta

INSTRUÇÕES:

- Responda em português do Brasil.
- Seja simpático.
- Seja direto.
- Responda normalmente em até 3 parágrafos.
- Não invente informações.
- Se não souber, diga que não sabe.
- Seu nome é Bernô IA.
- Nunca diga que você é Gemma, Ollama ou ChatGPT.

PROMPT;


// ==========================================
// DADOS ENVIADOS PARA O OLLAMA
// ==========================================

$body = [

    "model" => "berno",

    "prompt" => $prompt,

    "stream" => false,

    "options" => [

        "temperature" => 0.2,

        "num_predict" => 180

    ]

];


$jsonBody = json_encode(
    $body,
    JSON_UNESCAPED_UNICODE
);


// ==========================================
// URL PÚBLICA DO NGROK
// ==========================================

$url = "https://tightwad-dealing-duller.ngrok-free.dev/api/generate";


// ==========================================
// CURL
// ==========================================

$ch = curl_init($url);


curl_setopt_array(
    $ch,
    [

        CURLOPT_RETURNTRANSFER => true,

        CURLOPT_POST => true,

        CURLOPT_HTTPHEADER => [

            "Content-Type: application/json",

            "ngrok-skip-browser-warning: true"

        ],

        CURLOPT_POSTFIELDS => $jsonBody,

        CURLOPT_CONNECTTIMEOUT => 15,

        CURLOPT_TIMEOUT => 120,

        CURLOPT_SSL_VERIFYPEER => true

    ]
);


$resposta = curl_exec($ch);


$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);


$erroCurl = curl_error($ch);


curl_close($ch);


// ==========================================
// ERRO DE CONEXÃO
// ==========================================

if ($resposta === false) {

    http_response_code(500);

    echo json_encode(
        [
            "error" =>
                "Não consegui conectar ao Bernô IA. " .
                "Verifique se o Ollama e o ngrok estão abertos. " .
                $erroCurl
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ==========================================
// CONVERTER RESPOSTA DO OLLAMA
// ==========================================

$resultado = json_decode(
    $resposta,
    true
);


// ==========================================
// VERIFICAR SE VEIO JSON
// ==========================================

if ($resultado === null) {

    http_response_code(500);

    echo json_encode(
        [
            "error" =>
                "O servidor da IA retornou uma resposta inválida."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ==========================================
// ERRO HTTP
// ==========================================

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code(500);

    echo json_encode(
        [
            "error" =>
                $resultado["error"]
                ??
                "Erro ao consultar o Bernô IA. Código HTTP: " .
                $httpCode
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ==========================================
// PEGAR RESPOSTA GERADA
// ==========================================

$texto = trim(
    $resultado["response"] ?? ""
);


// ==========================================
// VERIFICAR RESPOSTA
// ==========================================

if ($texto === "") {

    http_response_code(500);

    echo json_encode(
        [
            "error" =>
                "O Bernô IA não retornou nenhuma resposta."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// ==========================================
// DEVOLVER PARA O JAVASCRIPT
// ==========================================

echo json_encode(
    [
        "answer" => $texto
    ],
    JSON_UNESCAPED_UNICODE
);

?>