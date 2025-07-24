// backend/server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

let processing = false;
let processedData = [];

// 接收 trigger 请求
app.post('/trigger', async (req, res) => {
  if (processing) return res.status(409).send('Already processing');
  processing = true;

  const { runProcess, pollResult } = require('./public/app');
  processedData = await runProcess();

  processing = false;
  res.sendStatus(200);
});

// 前端轮询结果
app.get('/result', async (req, res) => {
  const data = await require('./public/app').pollResult();
  if (data) {
    res.json(data);
  } else {
    res.status(202).send('Processing');
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});


// public/app.js (后台处理逻辑)
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

let latestResult = [];
let processingDone = false;

async function runProcess() {
  const csvFile = path.join(__dirname, '../data.csv');
  const rows = [];
  processingDone = false;

  return new Promise((resolve) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        const updatedRows = [...rows];
        const limit = 10;
        let index = 0;

        async function worker() {
          while (index < rows.length) {
            const i = index++;
            try {
              const payload = rows[i][Object.keys(rows[i])[0]];
              const response = await axios.post('https://example.com/api', { data: payload });
              updatedRows[i].Result = response.data.result || 'Success';
            } catch (err) {
              updatedRows[i].Result = 'Error';
            }
          }
        }

        await Promise.all(Array.from({ length: limit }, () => worker()));
        latestResult = updatedRows;
        processingDone = true;
        resolve(updatedRows);
      });
  });
}

function pollResult() {
  return processingDone ? latestResult : null;
}

module.exports = { runProcess, pollResult };


// frontend server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8081;

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});


// public/index.html (前端页面)
/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSV Table</title>
  <style>
    table, th, td { border: 1px solid black; border-collapse: collapse; }
    th, td { padding: 8px; }
    #loading { display: none; }
  </style>
</head>
<body>
  <button id="processBtn">开始处理</button>
  <div id="loading">加载中...</div>
  <table id="resultTable"></table>
  <script>
    document.getElementById('processBtn').addEventListener('click', async () => {
      document.getElementById('loading').style.display = 'block';
      await fetch('http://localhost:3000/trigger', { method: 'POST' });
      const res = await fetch('/result');
      const data = await res.json();
      document.getElementById('loading').style.display = 'none';

      const table = document.getElementById('resultTable');
      table.innerHTML = '';

      const headers = Object.keys(data[0]);
      const thead = document.createElement('tr');
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        thead.appendChild(th);
      });
      table.appendChild(thead);

      data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          td.textContent = row[h];
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
    });
  </script>
</body>
</html>
*/
