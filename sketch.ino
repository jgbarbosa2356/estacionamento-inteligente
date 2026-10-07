/*
 * SmartPark — Estacionamento Inteligente
 *
 * Equipe:
 *   João Gabriel Barbosa Costa
 *   Gabriel Sales
 *   Antônio Carlos
 *
 * Funcionamento:
 *   - LED verde: vaga livre.
 *   - LED vermelho: vaga ocupada ou falha no sensor.
 *   - ENTRADA abre somente quando existe uma vaga disponível.
 *   - SAÍDA abre somente quando existe um carro no estacionamento.
 *   - Um novo aperto fecha a cancela.
 *   - Cada abertura autoriza a movimentação de um carro.
 *
 * Este é um modelo didático. Os sensores continuam sendo lidos, mas
 * mudanças sem autorização não alteram a ocupação registrada.
 * O Arduino não consegue desativar os controles de distância do Wokwi.
 */

// Bibliotecas
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>
#include <Adafruit_NeoPixel.h>

// Pinos e tempo de estabilização dos botões
const byte TRIG[4] = {2, 4, 6, 8}, ECHO[4] = {3, 5, 7, 9};
const byte PIN_SERVO = 10, BOTAO_ENTRADA = 11, BOTAO_SAIDA = 12,
           LED_VERDE = A0, LED_VERMELHO = A1;
const unsigned long DEBOUNCE_MS = 35;

// Componentes
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo cancela;
Adafruit_NeoPixel indicadores(4, 13, NEO_GRB + NEO_KHZ800);

// Ocupação e falhas das quatro vagas
bool ocupada[4] = {false, false, false, false},
     falhaSensor[4] = {false, false, false, false};
byte livres = 4;
bool falhaGeral = false, aberta = false;

// Controle de tempo e direção da movimentação
unsigned long ultimaLeitura = 0, mensagemAte = 0, ultimoDisplay = 0;
const byte FECHADA = 0, ENTRANDO = 1, SAINDO = 2;
byte modo = FECHADA;
bool leituraOcupada[4] = {false, false, false, false};
bool movimentoConfirmado = false;
const char* mensagem = "";

// Estado usado para evitar vários eventos durante o mesmo aperto
struct Botao {
  byte pin;
  bool ultimaLeitura;
  bool estadoEstavel;
  unsigned long mudouEm;
};

Botao entrada = {BOTAO_ENTRADA, HIGH, HIGH, 0},
      saida = {BOTAO_SAIDA, HIGH, HIGH, 0};

// Leitura dos botões com debounce
bool foiPressionado(Botao &b, unsigned long agora) {
  bool leitura = digitalRead(b.pin);

  if (leitura != b.ultimaLeitura)
    b.mudouEm = agora;

  b.ultimaLeitura = leitura;

  if (agora - b.mudouEm >= DEBOUNCE_MS && leitura != b.estadoEstavel) {
    b.estadoEstavel = leitura;
    return leitura == LOW;
  }

  return false;
}

// Distância em centímetros. Ausência de eco retorna zero.
float medirDistancia(byte i) {
  digitalWrite(TRIG[i], LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG[i], HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG[i], LOW);

  unsigned long duracao = pulseIn(ECHO[i], HIGH, 30000UL);

  return duracao == 0 ? 0 : duracao / 58.0;
}

// <=18 cm: ocupado; >=25 cm: livre.
// Entre os limites, preserva a leitura anterior para evitar oscilações.
// Somente uma transição autorizada altera a ocupação registrada.
void atualizarSensores(bool inicial) {
  bool houveMudanca = inicial;
  livres = 0;
  falhaGeral = false;

  for (byte i = 0; i < 4; i++) {
    float cm = medirDistancia(i);
    bool falha = cm == 0;

    if (falha != falhaSensor[i])
      houveMudanca = true;

    falhaSensor[i] = falha;

    if (falha)
      falhaGeral = true;
    else {
      bool nova = leituraOcupada[i];

      if (cm <= 18)
        nova = true;
      else if (cm >= 25)
        nova = false;

      bool mudou = nova != leituraOcupada[i];
      leituraOcupada[i] = nova;

      if (inicial)
        ocupada[i] = nova;
      else if (mudou && nova != ocupada[i]) {
        bool permitido = aberta && !movimentoConfirmado &&
                         ((modo == ENTRANDO && nova) ||
                          (modo == SAINDO && !nova));

        Serial.print("Vaga ");
        Serial.print(i + 1);

        if (permitido) {
          ocupada[i] = nova;
          movimentoConfirmado = true;
          houveMudanca = true;
          Serial.println(nova ? ": CARRO ENTROU" : ": CARRO SAIU");
        }
        else
          Serial.println(": ALTERACAO IGNORADA - SEM AUTORIZACAO");
      }
    }

    if (!ocupada[i] && !falhaSensor[i])
      livres++;

    indicadores.setPixelColor(
      i,
      (ocupada[i] || falhaSensor[i])
        ? indicadores.Color(180, 0, 0)
        : indicadores.Color(0, 180, 0)
    );
  }

  indicadores.show();
  digitalWrite(LED_VERDE, !falhaGeral && livres > 0);
  digitalWrite(LED_VERMELHO, falhaGeral || livres == 0);

  if (houveMudanca) {
    Serial.print("Carros: ");
    byte carros = 0;

    for (byte i = 0; i < 4; i++)
      if (ocupada[i])
        carros++;

    Serial.print(carros);
    Serial.print(" | Livres: ");
    Serial.println(livres);
  }
}

// Quantidade de carros registrada no estacionamento
byte contarCarros() {
  byte carros = 0;

  for (byte i = 0; i < 4; i++)
    if (ocupada[i])
      carros++;

  return carros;
}

// Mensagem temporária no LCD
void mostrarMensagem(const char* texto, unsigned long agora) {
  mensagem = texto;
  mensagemAte = agora + 2200;
}

// Confirma a última leitura antes de baixar a cancela
void fecharCancela(unsigned long agora) {
  atualizarSensores(false);
  cancela.write(0);
  aberta = false;
  modo = FECHADA;

  mostrarMensagem("CANCELA FECHADA", agora);
  Serial.println("Cancela fechada pelo botao");
}

// Abre e autoriza uma movimentação na direção solicitada
void abrirCancela(const char* motivo, unsigned long agora, byte direcao) {
  cancela.write(90);
  aberta = true;
  modo = direcao;
  movimentoConfirmado = false;

  mostrarMensagem(motivo, agora);
  Serial.println(motivo);
}

// Disponibilidade e situação da cancela no LCD
void atualizarDisplay(unsigned long agora) {
  lcd.setCursor(0, 0);
  lcd.print("LIVRES: ");
  lcd.print(livres);
  lcd.print(" / 4    ");
  lcd.setCursor(0, 1);

  const char* linha = "PRESSIONE BOTAO";

  if (aberta)
    linha = "CANCELA ABERTA";
  else if ((long)(mensagemAte - agora) > 0)
    linha = mensagem;
  else if (falhaGeral)
    linha = "FALHA NO SENSOR";
  else if (livres == 0)
    linha = "LOTADO";

  lcd.print(linha);
  byte len = strlen(linha);

  while (len++ < 16)
    lcd.print(" ");
}

// Inicialização do Arduino e dos componentes
void setup() {
  Serial.begin(115200);

  for (byte i = 0; i < 4; i++) {
    pinMode(TRIG[i], OUTPUT);
    pinMode(ECHO[i], INPUT);
  }

  pinMode(BOTAO_ENTRADA, INPUT_PULLUP);
  pinMode(BOTAO_SAIDA, INPUT_PULLUP);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);

  indicadores.begin();
  cancela.attach(PIN_SERVO);
  cancela.write(0);

  lcd.init();
  lcd.backlight();
  atualizarSensores(true);
  atualizarDisplay(millis());
}

// Monitoramento das vagas e atendimento das solicitações
void loop() {
  unsigned long agora = millis();

  if (agora - ultimaLeitura >= 250) {
    ultimaLeitura = agora;
    atualizarSensores(false);
  }

  bool pediuEntrada = foiPressionado(entrada, agora);
  bool pediuSaida = foiPressionado(saida, agora);

  // Entrada: fecha se estiver aberta; caso contrário, valida a abertura.
  if (pediuEntrada) {
    if (aberta)
      fecharCancela(agora);
    else {
      atualizarSensores(false);

      if (falhaGeral) {
        mostrarMensagem("SENSOR COM FALHA", agora);
        Serial.println("ENTRADA BLOQUEADA: FALHA");
      }
      else if (livres == 0) {
        mostrarMensagem("ESTAC. LOTADO", agora);
        Serial.println("ENTRADA BLOQUEADA: LOTADO");
      }
      else
        abrirCancela("ENTRADA LIBERADA", agora, ENTRANDO);
    }
  }
  // Saída: somente abre quando existe um carro dentro.
  else if (pediuSaida) {
    if (aberta)
      fecharCancela(agora);
    else if (contarCarros() == 0) {
      mostrarMensagem("ESTAC. VAZIO", agora);
      Serial.println("SAIDA BLOQUEADA: VAZIO");
    }
    else
      abrirCancela("SAIDA LIBERADA", agora, SAINDO);
  }

  // Limita o redesenho do LCD para melhorar a resposta da simulação.
  if (pediuEntrada || pediuSaida || agora - ultimoDisplay >= 250) {
    ultimoDisplay = agora;
    atualizarDisplay(agora);
  }

  delay(1);
}

