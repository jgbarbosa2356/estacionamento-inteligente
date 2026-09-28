# Estacionamento inteligente — simulação virtual

Projeto para a atividade **Projeto de um Sistema Embarcado**, Faculdade Nova Roma. Equipe de três integrantes: preencher os nomes antes da entrega. Problema proposto: motoristas perdem tempo procurando vagas e o estacionamento precisa impedir entrada quando está lotado. **Validar o problema escolhido com o professor antes de fechá-lo**, conforme o enunciado.

## Arquivos

- `sketch.ino`: código Arduino comentado.
- `diagram.json`: microcontrolador e ligações para o Wokwi.
- `libraries.txt`: dependências usadas no Wokwi.
- `simulacao_visual.html`: demonstração interativa local; abrir com dois cliques no navegador. Nela, o motorista solicita entrada, a cancela abre e ele escolhe uma vaga livre. Quando as quatro vagas estão ocupadas, a entrada é recusada com a mensagem **ESTAC. LOTADO**. A interface ilustra as mesmas regras; o código embarcado executa no Wokwi.

## Executar a simulação embarcada

1. Acesse [Wokwi Arduino Uno](https://wokwi.com/projects/new/arduino-uno) e crie um projeto.
2. Substitua todo o conteúdo de `sketch.ino` pelo arquivo deste pacote.
3. Abra a aba `diagram.json`, mude para edição de texto se necessário e substitua pelo `diagram.json` deste pacote.
4. Crie/abra `libraries.txt` e cole o conteúdo do arquivo correspondente. Se a interface solicitar, adicione a biblioteca **LiquidCrystal I2C** pelo Library Manager.
5. Clique em **Start Simulation** (▶). O LCD começa com **4 vagas livres**; LED verde aceso e cancela fechada.
6. Clique em cada HC-SR04 e altere a distância: **10 cm = ocupada**; **100 cm = livre**. Entre 18 e 25 cm, o sistema preserva o estado anterior para evitar oscilação. Os números de vaga acompanham a posição da esquerda para a direita.
7. Pressione **ENTRADA** para solicitar abertura. O servo vai a 90° e volta a 0° após 3 s. Pressione **SAÍDA** para abrir independentemente da lotação. Os botões representam pedidos de passagem; para simular o carro estacionando ou saindo, altere também a distância do sensor da vaga.
8. Coloque os quatro sensores em 10 cm e tente entrar: o LCD informa **ESTAC. LOTADO**, LED vermelho acende e a cancela permanece fechada.

### Demonstrar a versão visual

1. Abra `simulacao_visual.html` no navegador e clique em **Solicitar entrada**.
2. Com a cancela aberta, clique em uma **vaga livre**; o carro ocupa essa vaga e a cancela fecha.
3. Repita até ocupar as quatro vagas e tente **Solicitar entrada**: a cancela continua fechada e aparece **ESTAC. LOTADO**.
4. Clique em **Solicitar saída** e escolha uma **vaga ocupada**. Ela volta a ficar livre.

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

Preencher empresa fictícia, nomes e papéis dos **três integrantes**, problema aprovado pelo professor, link do repositório Git, esquema, arquivos de código e evidências da simulação (capturas ou vídeo). O pacote fornece o protótipo e sua documentação técnica; ainda é preciso criar o repositório da equipe e discutir o problema com o professor.

Referências técnicas: [formato do diagrama](https://docs.wokwi.com/diagram-format), [sensor HC-SR04](https://docs.wokwi.com/parts/wokwi-hc-sr04), [LCD I²C](https://docs.wokwi.com/parts/wokwi-lcd1602), [servo](https://docs.wokwi.com/parts/wokwi-servo).
