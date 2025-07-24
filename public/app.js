async function fetchCSV() {
  const res = await fetch('compare.csv');
  const text = await res.text();
  return text;
}

function parseCSV(csvText) {
  const [headerLine, ...lines] = csvText.trim().split('\r\n');
  const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = lines.map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
  return { headers, data };
}

function createTable(headers, data) {
  const tableHead = document.getElementById('table-head');
  const tableBody = document.getElementById('table-body');
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  const tr = document.createElement('tr');
  headers.forEach((header, index) => {
    const th = document.createElement('th');
    th.textContent = header;
    th.onclick = () => sortTableBy(header);
    tr.appendChild(th);
  });
  tableHead.appendChild(tr);

  let low = 0, medium = 0, high = 0;
  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header];
      if (header.toLowerCase() === 'cpu' && row[header]) {
        const cpu = parseFloat(row[header]);
        if (cpu < 30) {
          td.classList.add('low'); low++;
        } else if (cpu < 60) {
          td.classList.add('medium'); medium++;
        } else {
          td.classList.add('high'); high++;
        }
      }
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });

  const total = low + medium + high;
  document.getElementById('cpu-summary').textContent = 
    `CPU Usage Distribution: Low: ${(low/total*100).toFixed(1)}%, Medium: ${(medium/total*100).toFixed(1)}%, High: ${(high/total*100).toFixed(1)}%`;
}

function downloadCSV() {
  const a = document.createElement('a');
  a.href = 'compare.csv';
  a.download = 'compare.csv';
  a.click();
}

function sortTableBy(header) {
  data.sort((a, b) => {
    const valA = parseFloat(a[header]) || a[header];
    const valB = parseFloat(b[header]) || b[header];
    return valA > valB ? 1 : -1;
  });
  createTable(headers, data);
}

async function triggerBuild() {
  await fetch('/trigger-build', { method: 'POST' });
  location.reload();
}

let headers = [], data = [];

fetchCSV().then(csv => {
  const parsed = parseCSV(csv);
  headers = parsed.headers;
  data = parsed.data;
  createTable(headers, data);
});
