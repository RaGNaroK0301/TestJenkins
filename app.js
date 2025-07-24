const express = require('express');
const path = require('path');

const app = express();
const PORT = 8081;

const { exec } = require('child_process');
const scriptPath = 'scripts/a.ps1';
const child = exec('C://Program Files/PowerShell//7//pwsh.exe', ['-ExecutionPolicy Bypass -File', scriptPath]);

app.use(express.static('public'));

app.get('/getinfo',async (req, res) => {
  res.json({
	a: 1,
	b: 2
  })
});

app.post('/trigger-build', async (req, res) => {
  console.log('Trigger Jenkins API placeholder');
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
