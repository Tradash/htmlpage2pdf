# htmlpage2pdf
Сервис конвертации страниц html в pdf через puppeteer

## Установка

git clone https://github.com/Tradash/htmlpage2pdf.git

npm i

### Переменные окружения

Установка рабочего порта сервиса

HTML2PDFPORT=8080 //По умолчанию

## Запуск 
npm run start 

## Эксплуатация

Сервис поддерживает два режима работы

### 1. Конвертация по переданному URL адресу

GET/POST запрос

{адрес сервиса}/?url={URL}[&параметр1=значение1]...

Где параметр и значения могут быть одним из параметров PDF, описанных в разделе https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions

Пример: http://localhost:8080/?url=https:\\www.yandex.ru&format=A3

### 2. Конвертация по переданному файлу

GET/POST запрос

{адрес сервиса}/file[?параметр1=значение1][&параметр2=значение2]...

В form-data необходимо указать поле file с именем файла или строку в формате HTML.

Параметр и значения могут быть одним из параметров PDF, описанных в разделе https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions

### Результат

Сервис возвращает результат в виде 'Content-Type': 'application/pdf' или код ответа 400 в случае неудачного запроса.

### Использованные библиотеки, траблшутинг
 
Сервис использует библиотеку https://github.com/GoogleChrome/puppeteer

Устранение неполадок при установке https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-on-alpine

## Пример запроса для CURL

<!-- language: lang-none -->

Через загрузку файла

curl -X GET --form file=@testpage.html http://localhost:8080/file?format=A5 > myfile.pdf


Через загрузку строки в HTML

curl -X GET --form file=" <\h3>Тестовая строка<\/h3><\p><\b>Вторая тестовая строка<\/b><\/p>" http://localhost:8080/file?format=A5 > myfile1161.pdf


Через указания URL

curl -X GET http://localhost:8080/?url=https://www.yandex.ru > myYandex.pdf

