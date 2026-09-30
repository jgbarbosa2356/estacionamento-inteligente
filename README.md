# Estacionamento inteligente — simulação 3D

Projeto acadêmico para a atividade **Projeto de um Sistema Embarcado**, Faculdade Nova Roma. A empresa fictícia **SmartPark Soluções Inteligentes** apresenta o produto **SmartPark — Estacionamento Inteligente**, desenvolvido por João Gabriel Barbosa Costa, Gabriel Sales e Antônio Carlos.

## Empresa

**Nome:** SmartPark Soluções Inteligentes.  
**Natureza:** empresa fictícia criada para este trabalho acadêmico.  
**Área de atuação:** automação de estacionamentos e desenvolvimento de soluções com sensores, microcontroladores e interfaces web.  
**Produto do projeto:** SmartPark — Estacionamento Inteligente.

A empresa propõe soluções para facilitar a consulta de vagas e o controle de acesso em estacionamentos de pequeno porte. Seu público-alvo são administradores de estacionamentos, estabelecimentos comerciais e instituições que precisam organizar a entrada e a saída de veículos. Os motoristas são os usuários da interface de disponibilidade.

**Missão:** tornar o acesso ao estacionamento mais claro, reduzindo a procura por vagas e demonstrando um controle de entrada condicionado à disponibilidade.  
**Visão:** desenvolver protótipos que possam evoluir para instalações físicas após validação técnica.  
**Valores:** clareza para o usuário, responsabilidade no tratamento de falhas, acessibilidade da interface e documentação reproduzível.

A entrega atual é um protótipo acadêmico de quatro vagas. Ela inclui um circuito virtual com Arduino Uno no Wokwi e uma simulação web independente, com modo 3D e modo leve. A empresa não possui operação comercial ou clientes reais documentados neste projeto.

## Equipe e funções

A divisão de responsabilidades definida para o trabalho é:

| Integrante | Função | Responsabilidades |
|---|---|---|
| João Gabriel Barbosa Costa | Desenvolvimento e integração | Organizar o repositório, trabalhar na lógica de entrada e saída e integrar os elementos do protótipo. |
| Gabriel Sales | Circuito e sensores | Organizar o circuito Wokwi, conferir sensores, LCD, LEDs, servo e pinagem, e preparar os cenários de ocupação das vagas. |
| Antônio Carlos | Interface, testes e documentação | Organizar os controles da simulação web, os roteiros de testes, a documentação e a demonstração do produto. |

Os integrantes podem colaborar em todas as etapas. Essa distribuição define a organização da equipe, sem afirmar que cada atividade já foi executada individualmente.

## Dor do cliente e solução proposta

**Dor:** o motorista chega sem saber se há vagas e pode circular desnecessariamente; o administrador precisa impedir novas entradas quando o estacionamento está lotado.

**Solução:** informar o total de vagas livres, receber uma solicitação de entrada e liberar a cancela apenas quando houver disponibilidade. Na página web, após a abertura o motorista escolhe uma vaga livre. Com lotação, a entrada é recusada e uma mensagem explica o motivo. A saída libera a vaga e atualiza a disponibilidade.

**Objetivo do produto:** demonstrar um fluxo completo de acesso, escolha de vaga, ocupação, lotação e saída. A demonstração automática preenche as quatro vagas, recusa uma quinta entrada e depois esvazia o estacionamento.

**Validação acadêmica do problema:** a discussão e aprovação com o professor ainda devem ser confirmadas pela equipe. Não há registro de aprovação no repositório.

## Documentação do produto

- **[Documentação técnica e acadêmica em PDF](docs/Documentacao_SmartPark_Nova_Roma.pdf)** — documento fornecido pela equipe.
- As seções abaixo descrevem tecnologias, componentes, funcionamento, execução e demonstração.


**[Abrir a simulação 3D](https://jgbarbosa2356.github.io/estacionamento-inteligente/)**. A página é um protótipo virtual que reproduz a lógica de presença por distância, lotação e cancelas. A cena 3D usa WebGL; se o navegador não oferecer WebGL, a página mostra automaticamente a versão interativa leve. No celular, os controles aparecem antes da cena, há botões de zoom e a opção **Modo leve** para aparelhos com desempenho limitado. A execução do código do Arduino com sensores e servo é feita separadamente no Wokwi; a página não recebe dados de um circuito físico ou do Wokwi.

## Arquivos

- `docs/Documentacao_SmartPark_Nova_Roma.pdf`: documentação técnica e acadêmica fornecida pela equipe.
- `sketch.ino`: código Arduino comentado.
- `diagram.json`: microcontrolador e ligações para o Wokwi.
- `libraries.txt`: dependências usadas no Wokwi.
- `index.html` e `parking3d.js`: página 3D publicada no GitHub Pages. Abra pelo link acima.
- `parking3d-source.js`: código fonte comentado da simulação 3D; `package.json` permite recompilar o arquivo de distribuição com `npm install` e `npm run build`.
- `THREE-LICENSE.txt`: licença da biblioteca Three.js incluída no código de distribuição.
- `simulacao_visual.html`: modo leve 2D, usado como alternativa à cena 3D.

## Demonstrar a versão 3D

1. Clique em **Solicitar entrada**. Um carro se aproxima, a cancela de entrada levanta e as vagas livres são destacadas.
2. Clique em uma vaga livre na lista ou na cena 3D. O carro trafega pela pista, estaciona e o sensor daquela vaga passa a indicar ocupação. A cancela fecha.
3. Repita com os quatro carros. Ao tentar entrar com lotação completa, a cancela permanece fechada e aparece **Estacionamento lotado**.
4. Clique em **Solicitar saída** e escolha um veículo estacionado; ele sai, o sensor detecta a vaga livre e o contador aumenta.
5. Use **Falhar sensor 2** para demonstrar a regra de segurança: novas entradas são bloqueadas enquanto houver falha, mas veículos ainda podem sair.

Para uma apresentação guiada, clique em **Iniciar demonstração completa**. A página reinicia com quatro vagas livres e mostra dez etapas: início, quatro entradas, tentativa recusada por lotação e quatro saídas, até o estacionamento voltar a ficar vazio. Use **Pausar/Continuar** quando quiser explicar uma etapa. **Reiniciar** volta ao estado inicial. Esses controles também existem na versão leve, que pode ser usada no celular.

Arraste na cena para mudar a câmera, use a roda do mouse para aproximar e clique em **Vista superior** ou **Vista inicial**. Os sensores virtuais são amostrados periodicamente: até 18 cm a vaga é ocupada, a partir de 25 cm é livre; entre esses limites o estado anterior é mantido. O carro só é contado quando chega à vaga, pois a distância é derivada de sua posição na cena.

## Executar a simulação embarcada

1. Acesse [Wokwi Arduino Uno](https://wokwi.com/projects/new/arduino-uno) e crie um projeto.
2. Substitua todo o conteúdo de `sketch.ino` pelo arquivo deste pacote.
3. Abra a aba `diagram.json`, mude para edição de texto se necessário e substitua pelo `diagram.json` deste pacote.
4. Crie/abra `libraries.txt` e cole o conteúdo do arquivo correspondente. Se a interface solicitar, adicione a biblioteca **LiquidCrystal I2C** pelo Library Manager.
5. Clique em **Start Simulation** (▶). O LCD começa com **4 vagas livres**; LED verde aceso e cancela fechada.
6. Clique em cada HC-SR04 e altere a distância: **10 cm = ocupada**; **100 cm = livre**. Entre 18 e 25 cm, o sistema preserva o estado anterior para evitar oscilação. Os números de vaga acompanham a posição da esquerda para a direita.
7. Pressione **ENTRADA** para solicitar abertura. O servo vai a 90° e volta a 0° após 3 s. Pressione **SAÍDA** para abrir independentemente da lotação. Os botões representam pedidos de passagem; para simular o carro estacionando ou saindo, altere também a distância do sensor da vaga.
8. Coloque os quatro sensores em 10 cm e tente entrar: o LCD informa **ESTAC. LOTADO**, LED vermelho acende e a cancela permanece fechada.

Na versão embarcada do Wokwi, a escolha da vaga é representada fisicamente pela aproximação do carro ao HC-SR04 correspondente (alterar sua distância para 10 cm após solicitar entrada). O display não oferece um menu de escolha de vaga.

## Componentes e ligações

| Elemento | Ligação ao Arduino Uno | Papel |
|---|---|---|
| HC-SR04 da vaga 1 | TRIG D2; ECHO D3 | Detectar carro por distância |
| HC-SR04 da vaga 2 | TRIG D4; ECHO D5 | Detectar carro por distância |
| HC-SR04 da vaga 3 | TRIG D6; ECHO D7 | Detectar carro por distância |
| HC-SR04 da vaga 4 | TRIG D8; ECHO D9 | Detectar carro por distância |
| Servo | Sinal D10 | Abrir/fechar cancela |
| Botão entrada; botão saída | D11; D12, respectivamente, até GND | Solicitar passagem; `INPUT_PULLUP` |
| LCD 16×2 I²C | SDA A4; SCL A5; endereço 0x27 | Exibir vagas livres e mensagens |
| LED verde; LED vermelho | A0; A1, através de resistores de 220 Ω | Livre; lotado/falha |
| Alimentação dos módulos | 5V e GND | Alimentação comum |

## Regras para explicar na apresentação

1. O Arduino mede a distância dos quatro sensores. Até **18 cm**, a vaga fica ocupada; a partir de **25 cm**, fica livre. A faixa entre esses valores mantém a leitura anterior.
2. O total de vagas livres é recalculado. Quando há vaga e todos os sensores respondem, o LED verde acende. Com lotação ou falha, acende o vermelho.
3. Ao solicitar entrada, a cancela abre somente quando há vaga e não há falha. A saída pode ser solicitada mesmo com lotação ou falha.
4. Sem resposta de um sensor em 30 ms, o sistema sinaliza falha e bloqueia **somente novas entradas**, uma decisão conservadora. O Monitor Serial registra distâncias e estados.

## Roteiro curto de demonstração

| Etapa | Ação | Resultado esperado |
|---|---|---|
| 1 | Iniciar com sensores em 100 cm | 4 vagas livres, LED verde |
| 2 | Mudar vaga 1 para 10 cm | 3 vagas livres |
| 3 | Solicitar entrada | Cancela abre e fecha após 3 s |
| 4 | Mudar as outras três vagas para 10 cm | 0 vagas livres, LED vermelho |
| 5 | Solicitar entrada; depois saída | Entrada negada; saída liberada |

## Documentação e entrega

A empresa fictícia, os integrantes, suas funções e o produto estão documentados neste README. O repositório contém o código-fonte, o esquema Wokwi, a simulação web e a [documentação em PDF](docs/Documentacao_SmartPark_Nova_Roma.pdf).

Para concluir a validação acadêmica, a equipe deve confirmar a discussão do problema com o professor e registrar as evidências dos testes. Capturas ou vídeos podem ser adicionados à pasta `docs/`. A página web representa um ambiente virtual independente; ela não recebe dados do Wokwi ou de sensores físicos.

Referências técnicas: [formato do diagrama](https://docs.wokwi.com/diagram-format), [sensor HC-SR04](https://docs.wokwi.com/parts/wokwi-hc-sr04), [LCD I²C](https://docs.wokwi.com/parts/wokwi-lcd1602), [servo](https://docs.wokwi.com/parts/wokwi-servo).

