#include "SoftwareSerial.h"
String ssid = "Üçlü Priz";

String password = "elitwifi";

SoftwareSerial esp(10, 11);  // RX, TX

String data;

String server = "arduino.yildizcep.com";  // www.example.com

String uri = "/data";  // our example is /esppost.php

const byte MQ4_Pin = A5;  //MQ4 A0 pin
const int R_0 = 945;      //Change this to your own R0 measurements

float getMethanePPM() {
  float a0 = analogRead(A5);                 // get raw reading from sensor
  float v_o = a0 * 5 / 1023;                 // convert reading to volts
  float R_S = (5 - v_o) * 1000 / v_o;        // apply formula for getting RS
  float PPM = pow(R_S / R_0, -2.95) * 1000;  //apply formula for getting PPM
  return int(PPM);                                // return PPM value to calling function
}

void setup() {

  esp.begin(115200);

  Serial.begin(9600);

  reset();

  connectWifi();
}

//reset the esp8266 module

void reset() {

  esp.println("AT+RST");

  delay(1000);

  if (esp.find("OK")) Serial.println("Module Reset");
}

//connect to your wifi network

void connectWifi() {

  String cmd = "AT+CWJAP=\"" + ssid + "\",\"" + password + "\"";

  esp.println(cmd);

  delay(4000);

  if (esp.find("OK")) {

    Serial.println("Connected!");

  }

  else {

    connectWifi();

    Serial.println("Cannot connect to wifi");
  }
}

void loop() {

  //start_test();

  // convert the bit data to string form

  // hum = String(dat[0]);

  // temp = String(dat[2]);

  int gas_ppm = getMethanePPM();
  int danger = int(digitalRead(3));

  if (danger) {
    noTone(A0);
  } else {
    tone(A0, 1000);
  }

  data = "gas_ppm=" + String(gas_ppm) + "&danger=" + String(danger);  // data sent must be under this form //name1=value1&name2=value2.
  Serial.println("...");
  httppost();

  delay(1000);
}

void httppost() {

  esp.println("AT+CIPSTART=\"TCP\",\"" + server + "\",80");  //start a TCP connection.

  if (esp.find("OK")) {

    Serial.println("TCP connection ready");
  }
  delay(1000);

  String postRequest =

    "GET " + uri + " HTTP/1.0\r\n" +

    "Host: " + server + "\r\n" +

    "Accept: *" + "/" + "*\r\n" +

    "Content-Length: " + data.length() + "\r\n" +

    "Content-Type: application/x-www-form-urlencoded\r\n" +

    "\r\n" + data;

  String sendCmd = "AT+CIPSEND=";  //determine the number of caracters to be sent.

  esp.print(sendCmd);

  esp.println(postRequest.length());

  delay(500);

  if (esp.find(">")) {
    Serial.println("Sending..");
    esp.print(postRequest);

    if (esp.find("SEND OK")) {
      Serial.println("Packet sent");

      while (esp.available()) {

        String tmpResp = esp.readString();

        Serial.println(tmpResp);
      }

      // close the connection

      esp.println("AT+CIPCLOSE");
    }
  }
  delay(2000);
}