#include <SoftwareSerial.h>                                   //Gerekli kütüphaneleri ekledik.

String agAdi = "Üçlü Priz";                     //Ağ adı.    
String agSifresi = "elitwifi";                              //Ağ şifresi.

int rxPin = 10;                                               //ESP8266 TX pinine
int txPin = 11;                                               //ESP8266 RX pinine
const byte MQ4_Pin = A5; //MQ4 A0 pin
const int R_0 = 945; //Change this to your own R0 measurements

String ip = "184.106.153.149";                                //Thingspeak ip adresi

SoftwareSerial esp(rxPin, txPin);                             //Seri haberleşme pin ayarları

float getMethanePPM(){
   float a0 = analogRead(A5); // get raw reading from sensor
   float v_o = a0 * 5 / 1023; // convert reading to volts
   float R_S = (5-v_o) * 1000 / v_o; // apply formula for getting RS
   float PPM = pow(R_S/R_0,-2.95) * 1000; //apply formula for getting PPM
   return PPM; // return PPM value to calling function
}

void setup() {

  Serial.begin(9600);  //Seri port ile haberleşmemizi başlatıyoruz.
  Serial.println("Started");
  esp.begin(115200);                                          //ESP8266 ile seri haberleşmeyi başlatıyoruz.
  pinMode(A0, OUTPUT); // Set buzzer - pin 9 as an output
 
  esp.println("AT");                                          //AT komutu ile modül kontrolünü yapıyoruz.
  Serial.println("AT Yollandı");
  while (!esp.find("OK")) {                                   //Modül hazır olana kadar bekliyoruz.
    esp.println("AT");
    Serial.println("ESP8266 Bulunamadı.");
  }
  Serial.println("OK Komutu Alındı");
  esp.println("AT+CWMODE=1");                                 //ESP8266 modülünü client olarak ayarlıyoruz.
  while (!esp.find("OK")) {                                   //Ayar yapılana kadar bekliyoruz.
    esp.println("AT+CWMODE=1");
    Serial.println("Ayar Yapılıyor....");
  }
  Serial.println("Client olarak ayarlandı");
  Serial.println("Aga Baglaniliyor...");
  esp.println("AT+CWJAP=\"" + agAdi + "\",\"" + agSifresi + "\""); //Ağımıza bağlanıyoruz.
  while (!esp.find("OK"));                                    //Ağa bağlanana kadar bekliyoruz.
  Serial.println("Aga Baglandi.");
  delay(1000);
}

void loop() {
  esp.println("AT+CIPSTART=\"TCP\",\""+ip+"\",80");           //Thingspeak'e bağlanıyoruz.
  
  if(esp.find("Error")){                                      //Bağlantı hatası kontrolü yapıyoruz.
    Serial.println("AT+CIPSTART Error");
  }

  float methaneLevel = getMethanePPM();
  Serial.println(methaneLevel);
   if(digitalRead(3)){
     noTone(A0);
  }else{
  
   tone(A0,1000);
   }
  String veri = "GET https://api.thingspeak.com/update?api_key=DLAGWTSOKK14B5AZ";   //Thingspeak komutu. Key kısmına kendi api keyimizi yazıcaz.                                  
  veri += "&field1=";
  veri += String(methaneLevel);                                   //Gönderilecek sıcaklık değişkeni
  veri += "&field2=";
  veri += String(digitalRead(3));
  veri += "\r\n\r\n"; 
  esp.print("AT+CIPSEND=");                                   //ESP'ye gönderilecek veri uzunluğu.
  esp.println(veri.length()+2);
  if(esp.find(">")){                                          //ESP8266 hazır olduğunda içindeki komutlar çalışıyor.
    esp.print(veri);                                          //Veriyi gönderiyoruz.
    Serial.println(veri);
    Serial.println("Veri gonderildi.");
    delay(1000);
  }
  Serial.println("Baglantı Kapatildi.");
  esp.println("AT+CIPCLOSE");                                //Bağlantıyı kapatıyoruz
  delay(1000);                                               //Yeni veri gönderimi için 1 saniye bekliyoruz.
}
