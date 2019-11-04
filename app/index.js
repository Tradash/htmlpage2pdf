const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const multer = require("multer");
const file = require("fs");
const config = require("./config");
const elt = require("elapsed-time");

const tmpData = process.cwd() + "/tmp";

if (!file.existsSync(tmpData)) {
  file.mkdirSync(tmpData);
}

let counter = 0;

// Загрузка файла
const loadFile = fileName =>
  new Promise(function(resolve, reject) {
    file.readFile(fileName, { encoding: "utf-8" }, function(err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  });

const upload = multer({ dest: tmpData });

const browserStart = puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  executablePath: process.env.CHROME_BIN || null
});

const createPdf = (url, query, response, useSetContent = null) => {
  browserStart
    .then(async browser => {
      response.openBrowser = browser;
      const context = await browser.createIncognitoBrowserContext();
      let page = await context.newPage();
      if (useSetContent) {
        await page.setContent(url);
      } else {
        await page.goto(url, { waitUntil: "networkidle2" });
      }
      let pdf = await page.pdf(query);
      response.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdf.length
      });
      response.send(pdf);
      console.log(
        `Запрос N${
          response.requestCounter
        } выполнен за: ${response.requestElt.getValue()}`
      );
      await page.close();
      await context.close();
      // await browser.close();
    })
    .catch(err => {
      response
        .status(400)
        .send(
          `<h2>Ошибка при обработке запроса</h2><p>${JSON.stringify(
            err.message
          )}</p>`
        );
      console.log("Ошибка при генерации страницы\n", err);
    })
    .finally(() => {});
};
// мидл для добавления счетчиков и метрики
const addCounter = (req, res, next) => {
  counter++;
  res.requestCounter = counter;
  res.requestElt = elt.new().start();
  console.log(`Получен запрос N${res.requestCounter} по URL`);
  next();
};

app.use(addCounter);

app.all("/", async function(request, response) {
  let q = request.query;
  const pageURL = q.url;
  if (pageURL) {
    delete q.url;
    createPdf(pageURL, q, response);
  } else {
    response.status(200).send(`<p>В запросе отсутсвует строка запроса</p>`);
  }
});

app.all("/file", upload.single("file"), async function(request, response) {
  let q = request.query || { format: "A4" };
  if (request.hasOwnProperty("file")) {
    // Загружен файл, загружаем в буфер
    loadFile(request.file.path)
      .then(data => createPdf(data, q, response, 1))
      .finally(() =>
        file.unlink(request.file.path, err => {
          if (err) {
            console.error(err);
          }
        })
      );
  } else {
    // Получен текст файла
    if (request.body && request.body.file) {
      let data = request.body.file;
      createPdf(data, q, response, 1);
    } else {
      response
        .status(400)
        .send(`<h2>Ошибка, получены неправильные параметры запроса</h2>`);
    }
  }
});

console.log("Welcome on htmlpage2pdf service");

if (!module.parent) {
  app.listen(config.httpPort);
  console.log(`Service started on port ${config.httpPort}`);
}
