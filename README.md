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
- **Atualização do circuito em 07/10/2026:** o README e os arquivos Wokwi descrevem as regras atuais. O PDF é uma versão anterior e pode apresentar diferenças nas regras da cancela e nos LEDs por vaga.


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

**[Abrir o circuito SmartPark no Wokwi](https://wokwi.com/projects/477249283136966657)**.

1. Abra o link e clique em **Start Simulation** (▶). Com os sensores inicialmente em 100 cm, o sistema começa vazio, com quatro vagas livres e a cancela fechada.
2. Localize **CANCELA (SERVO)** à direita. O braço vermelho fica horizontal quando fechado e vertical quando aberto.
3. Pressione **ENTRADA**. A cancela abre somente se existir uma vaga disponível e nenhum sensor estiver com falha.
4. Com a cancela aberta, clique no HC-SR04 de uma vaga livre e ajuste para **10 cm**. O sistema registra um carro entrando, acende o LED vermelho dessa vaga e reduz a disponibilidade.
5. Pressione **ENTRADA** novamente para fechar a cancela. Cada abertura autoriza a movimentação de apenas um carro; repita a sequência para ocupar as demais vagas.
6. Quando as quatro vagas estiverem ocupadas, pressione **ENTRADA**: a cancela permanece fechada e o LCD mostra **ESTAC. LOTADO**.
7. Para retirar um carro, pressione **SAÍDA**, ajuste o sensor de uma vaga ocupada para **100 cm** e pressione **SAÍDA** novamente para fechar. O LED da vaga volta a verde.
8. Quando não houver carros, **SAÍDA** não abre a cancela e o LCD mostra **ESTAC. VAZIO**.

Os números das vagas seguem os sensores da esquerda para a direita. Até **18 cm**, a leitura indica presença; a partir de **25 cm**, indica ausência. Entre esses valores, a leitura anterior é preservada para evitar oscilações.

**Limite do simulador:** o Arduino não consegue bloquear o controle de distância da interface do Wokwi. Neste modelo didático, alterações feitas com a cancela fechada, na direção errada ou após a movimentação já autorizada são ignoradas na ocupação registrada. Os sensores continuam sendo lidos para detectar falhas. Caso altere uma distância sem autorização, restaure-a ao estado registrado antes de solicitar a movimentação correta.

O circuito não apresenta um menu de vagas no LCD: a escolha é representada pela alteração do sensor correspondente. Não há fechamento automático por tempo; um novo aperto em um dos botões fecha a cancela e confere a última leitura antes do fechamento. A leitura inicial considera as distâncias configuradas ao iniciar a simulação.

### Reproduzir a partir dos arquivos

Crie um [projeto Arduino Uno no Wokwi](https://wokwi.com/projects/new/arduino-uno), substitua integralmente `sketch.ino`, `diagram.json` e `libraries.txt` pelos arquivos deste repositório e inicie a simulação. As bibliotecas são **LiquidCrystal I2C**, **Servo** e **Adafruit NeoPixel**.

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
| LED geral verde; LED geral vermelho | A0; A1, através de resistores de 220 Ω | Há vagas; lotação/falha |
| Quatro LEDs endereçáveis WS2812 | D13 → DIN do primeiro; DOUT → DIN do seguinte; 5V e GND | Uma luz por vaga: verde livre, vermelho ocupada/falha |
| Alimentação dos módulos | 5V e GND | Alimentação comum |

## Regras para explicar na apresentação

1. O Arduino lê os quatro sensores e aplica os limites de **18 cm** e **25 cm**, preservando o estado anterior na faixa intermediária.
2. Cada vaga tem um LED endereçável: **verde** para livre e **vermelho** para ocupada ou falha. O LED vermelho geral indica lotação completa ou falha.
3. **ENTRADA** só abre quando há vaga e nenhum sensor está com falha. Uma vaga vermelha não bloqueia as outras livres; a lotação ocorre quando as quatro estão ocupadas.
4. **SAÍDA** só abre se existir um carro registrado, inclusive quando estiver lotado ou houver falha.
5. Cada abertura autoriza uma movimentação na direção solicitada. Com a cancela fechada, mudanças de ocupação são ignoradas pelo modelo.
6. Um novo aperto fecha a cancela. Antes de fechar, o código confere o sensor para registrar a última movimentação autorizada.
7. Sem eco de um sensor em **30 ms**, novas entradas são bloqueadas. O Monitor Serial registra movimentações, bloqueios, quantidade de carros e alterações ignoradas.
8. O código está organizado e comentado por configuração, botões, sensores, cancela, display, inicialização e execução.

## Roteiro curto de demonstração do Wokwi

| Etapa | Ação | Resultado esperado |
|---|---|---|
| 1 | Iniciar com os quatro sensores em 100 cm; pressionar SAÍDA | Quatro vagas livres; saída bloqueada por estacionamento vazio |
| 2 | Mudar um sensor para 10 cm com a cancela fechada | Alteração ignorada; ocupação registrada permanece igual |
| 3 | Restaurar esse sensor para 100 cm; ENTRADA → sensor em 10 cm → ENTRADA | Cancela abre, um carro é registrado, LED da vaga fica vermelho e cancela fecha |
| 4 | Repetir a entrada autorizada nas outras três vagas | Quatro carros; nenhuma vaga livre; LED vermelho geral aceso |
| 5 | Pressionar ENTRADA | Entrada bloqueada por lotação |
| 6 | SAÍDA → sensor ocupado em 100 cm → SAÍDA | Um carro sai, a vaga fica verde e a cancela fecha |
| 7 | Repetir até esvaziar; pressionar SAÍDA | Quatro vagas livres; nova saída bloqueada |

A lógica foi validada com um teste de cenários usando o firmware e componentes simulados: saída vazia, mudança de sensor com cancela fechada, quatro entradas, bloqueio por lotação, quatro saídas e novo bloqueio por vazio. A compilação e a abertura da cancela também foram verificadas no Wokwi.

## Documentação e entrega

A empresa fictícia, os integrantes, suas funções e o produto estão documentados neste README. O repositório contém o código-fonte, o esquema Wokwi, a simulação web e a [documentação em PDF](docs/Documentacao_SmartPark_Nova_Roma.pdf).

Para concluir a validação acadêmica, a equipe deve confirmar a discussão do problema com o professor e registrar as evidências dos testes. Capturas ou vídeos podem ser adicionados à pasta `docs/`. A página web representa um ambiente virtual independente; ela não recebe dados do Wokwi ou de sensores físicos.

Referências técnicas: [formato do diagrama](https://docs.wokwi.com/diagram-format), [sensor HC-SR04](https://docs.wokwi.com/parts/wokwi-hc-sr04), [LCD I²C](https://docs.wokwi.com/parts/wokwi-lcd1602), [servo](https://docs.wokwi.com/parts/wokwi-servo).


