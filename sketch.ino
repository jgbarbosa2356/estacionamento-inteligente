/*
  Estacionamento Inteligente — projeto de sistema embarcado
  Equipe: preencher com os tres integrantes

  Quatro sensores HC-SR04 monitoram as vagas. A cancela de entrada
  abre apenas quando existe vaga e todos os sensores respondem.
  O botao de saida abre a cancela independentemente da lotacao.
  A posicao real dos carros e determinada pelos sensores: apertar
  um botao nao altera artificialmente a contagem de vagas.
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

const byte NUM_VAGAS = 4;
const byte TRIG[NUM_VAGAS] = {2, 4, 6, 8};
const byte ECHO[NUM_VAGAS] = {3, 5, 7, 9};
const byte PIN_SERVO = 10;
const byte BOTAO_ENTRADA = 11;
const byte BOTAO_SAIDA = 12;
const byte LED_VERDE = A0;
const byte LED_VERMELHO = A1;

const float LIMIAR_OCUPADA_CM = 18.0;
const float LIMIAR_LIVRE_CM = 25.0; // histerese evita oscilacao
const unsigned long INTERVALO_LEITURA_MS = 450;
const unsigned long TEMPO_CANCELA_MS = 3000;
const unsigned long DEBOUNCE_MS = 35;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo cancela;
bool ocupada[NUM_VAGAS] = {false, false, false, false};
bool falhaSensor[NUM_VAGAS] = {false, false, false, false};
byte livres = NUM_VAGAS;
bool falhaGeral = false;
bool aberta = false;
unsigned long aberturaEm = 0;
unsigned long ultimaLeitura = 0;
unsigned long mensagemAte = 0;
const char* mensagem = "";

struct Botao {
  byte pin;
  bool ultimaLeitura;
  bool estadoEstavel;
  unsigned long mudouEm;
};

Botao entrada = {BOTAO_ENTRADA, HIGH, HIGH, 0};
Botao saida = {BOTAO_SAIDA, HIGH, HIGH, 0};

// Retorna true somente no instante de um novo aperto estavel.
bool foiPressionado(Botao &b, unsigned long agora) {
  bool leitura = digitalRead(b.pin);
  if (leitura != b.ultimaLeitura) b.mudouEm = agora;
  b.ultimaLeitura = leitura;
  if (agora - b.mudouEm >= DEBOUNCE_MS && leitura != b.estadoEstavel) {
    b.estadoEstavel = leitura;
    return leitura == LOW;
  }
  return false;
}

// Zero indica ausencia de ECHO: estado desconhecido e entrada bloqueada.
float medirDistancia(byte i) {
  digitalWrite(TRIG[i], LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG[i], HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG[i], LOW);
  unsigned long duracao = pulseIn(ECHO[i], HIGH, 30000UL);
  if (duracao == 0) return 0;
  return duracao / 58.0;
}

void atualizarSensores() {
  livres = 0;
  falhaGeral = false;
  for (byte i = 0; i < NUM_VAGAS; i++) {
    float cm = medirDistancia(i);
    falhaSensor[i] = cm == 0;
    if (falhaSensor[i]) {
      falhaGeral = true;
    } else {
      if (cm <= LIMIAR_OCUPADA_CM) ocupada[i] = true;
      else if (cm >= LIMIAR_LIVRE_CM) ocupada[i] = false;
      if (!ocupada[i]) livres++;
    }
    Serial.print("Vaga "); Serial.print(i + 1);
    Serial.print(": ");
    if (falhaSensor[i]) Serial.println("FALHA SENSOR");
    else {
      Serial.print(cm, 1); Serial.print(" cm - ");
      Serial.println(ocupada[i] ? "OCUPADA" : "LIVRE");
    }
  }
  Serial.print("Livres: "); Serial.println(livres);
  digitalWrite(LED_VERDE, !falhaGeral && livres > 0);
  digitalWrite(LED_VERMELHO, falhaGeral || livres == 0);
}

void mostrarMensagem(const char* texto, unsigned long agora) {
  mensagem = texto;
  mensagemAte = agora + 2200;
}

void abrirCancela(const char* motivo, unsigned long agora) {
  cancela.write(90);
  aberta = true;
  aberturaEm = agora;
  mostrarMensagem(motivo, agora);
  Serial.println(motivo);
}

void atualizarDisplay(unsigned long agora) {
  lcd.setCursor(0, 0);
  lcd.print("LIVRES: "); lcd.print(livres);
  lcd.print(" / 4    ");
  lcd.setCursor(0, 1);
  const char* linha = "PRESSIONE BOTAO";
  if (aberta) linha = "CANCELA ABERTA";
  else if (agora < mensagemAte) linha = mensagem;
  else if (falhaGeral) linha = "FALHA NO SENSOR";
  else if (livres == 0) linha = "LOTADO";
  lcd.print(linha);
  byte len = strlen(linha);
  while (len++ < 16) lcd.print(' ');
}

void setup() {
  Serial.begin(115200);
  for (byte i = 0; i < NUM_VAGAS; i++) {
    pinMode(TRIG[i], OUTPUT);
    pinMode(ECHO[i], INPUT);
  }
  pinMode(BOTAO_ENTRADA, INPUT_PULLUP);
  pinMode(BOTAO_SAIDA, INPUT_PULLUP);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);
  cancela.attach(PIN_SERVO);
  cancela.write(0);
  lcd.init();
  lcd.backlight();
  atualizarSensores();
  atualizarDisplay(millis());
}

void loop() {
  unsigned long agora = millis();
  if (agora - ultimaLeitura >= INTERVALO_LEITURA_MS) {
    ultimaLeitura = agora;
    atualizarSensores();
  }
  if (foiPressionado(entrada, agora)) {
    if (aberta) mostrarMensagem("AGUARDE...", agora);
    else if (falhaGeral) mostrarMensagem("SENSOR COM FALHA", agora);
    else if (livres == 0) mostrarMensagem("ESTAC. LOTADO", agora);
    else abrirCancela("ENTRADA LIBERADA", agora);
  }
  if (foiPressionado(saida, agora)) {
    if (!aberta) abrirCancela("SAIDA LIBERADA", agora);
  }
  if (aberta && agora - aberturaEm >= TEMPO_CANCELA_MS) {
    cancela.write(0);
    aberta = false;
    Serial.println("Cancela fechada");
  }
  atualizarDisplay(agora);
}
