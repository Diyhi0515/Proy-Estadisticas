let x = [];
let y = [];
let sumX = 0,
  sumY = 0,
  sumX2 = 0,
  sumY2 = 0,
  sumXY = 0;
  let scatterChart; // Hacerlo accesible globalmente


function addRow() {
  const table = document
    .getElementById("data-table")
    .getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `
        <td>${table.rows.length}</td>
        <td><input type="number" class="pub" placeholder="Pub"></td>
        <td><input type="number" class="vtas" placeholder="Vtas"></td>
        <td></td>
        <td></td>
        <td><button onclick="removeRow(this)">Eliminar</button></td>
    `;
}

function removeRow(button) {
  if (confirm("¿Estás seguro de que deseas eliminar esta fila?")) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateRowNumbers();
  }
}

function updateRowNumbers() {
  const rows = document.querySelectorAll("#data-table tbody tr");
  rows.forEach((row, index) => {
    row.cells[0].innerText = index + 1; // Update row number
  });
}

function calculate() {
  x = [];
  y = [];
  sumX = 0;
  sumY = 0;
  sumX2 = 0;
  sumY2 = 0;
  sumXY = 0;
  const rows = document.querySelectorAll("#data-table tbody tr");
  rows.forEach((row) => {
    const pubValue = parseFloat(row.querySelector(".pub").value) || 0;
    const vtasValue = parseFloat(row.querySelector(".vtas").value) || 0;
    x.push(pubValue);
    y.push(vtasValue);
    sumX += pubValue;
    sumY += vtasValue;
    sumX2 += pubValue ** 2;
    sumY2 += vtasValue ** 2;
    sumXY += pubValue * vtasValue;

    // Obtener las celdas para X² y Y²
    const cellX2 = row.cells[3]; // X² está en la cuarta celda
    const cellY2 = row.cells[4]; // Y² está en la quinta celda

    // Actualizar los campos X² y Y² en la tabla
    cellX2.innerText = (pubValue ** 2).toFixed(2); // X²
    cellY2.innerText = (vtasValue ** 2).toFixed(2); // Y²
  });

  const n = x.length;
  const Sxx = sumX2 - sumX ** 2 / n;
  const Syy = sumY2 - sumY ** 2 / n;
  const Sxy = sumXY - (sumX * sumY) / n;
  const r = Sxy / Math.sqrt(Sxx * Syy);
  const r2 = r ** 2;
  const r2Negado = 1 - r2;

  // Cálculo de la pendiente (m) e intercepto (b) de la línea de regresión
  const m = Sxy / Sxx; // Pendiente
  const b = sumY / n - m * (sumX / n); // Intercepto

  document.getElementById("total-pub").innerText = sumX.toFixed(2);
  document.getElementById("total-vtas").innerText = sumY.toFixed(2);
  document.getElementById("total-pub2").innerText = sumX2.toFixed(2);
  document.getElementById("total-vtas2").innerText = sumY2.toFixed(2);

  // Display results
  displayResults(Sxx, Syy, Sxy, r, r2, r2Negado, m, b);
  // Create scatter plot using m and b
  createScatterPlot(m, b);
}

function displayResults(Sxx, Syy, Sxy, r, r2, r2Negado, m, b) {
  const resultsDiv = document.getElementById("result-data");
  resultsDiv.innerHTML = `
        <h2>Resultados</h2>
        <p>Sxx = ${Sxx.toFixed(2)}</p>
        <p>Syy = ${Syy.toFixed(2)}</p>
        <p>Sxy = ${Sxy.toFixed(2)}</p>
        <p>r = ${r.toFixed(4)}</p>
        <p>R² = ${r2.toFixed(4)}</p>
        <p>1 - R² = ${r2Negado.toFixed(4)}</p>
        <p>Pendiente (m) = <span id="pendiente">${m.toFixed(4)}</span></p>
        <p>Intercepto (b) = <span id="intercepto">${b.toFixed(4)}</span></p>
    `;
  const interpretationDiv = document.getElementById("interpretation");
  let interpretation = `<h3>Interpretación:</h3>`;

  if (Math.abs(r) >= 0.8) {
    interpretation += `<p>- r indica una fuerte relación entre las variables. ${
      r > 0
        ? "A medida que Pub aumenta, Vtas también tiende a aumentar."
        : "A medida que Pub aumenta, Vtas tiende a disminuir."
    }</p>`;
  } else if (Math.abs(r) >= 0.5) {
    interpretation += `<p>- r indica una relación moderada entre las variables.</p>`;
  } else {
    interpretation += `<p>- r indica poca o ninguna relación entre las variables.</p>`;
  }

  if (r2 === 1) {
    interpretation += `<p>- R² = 1 significa que el modelo explica toda la variabilidad en Vtas.</p>`;
  } else {
    interpretation += `<p>- R² indica que Pub  explica el ${Math.round(r2 * 100)}% de las variaciones en las ventas.</p>`;
  }

  interpretation += `<p>- 1 - R² = ${r2Negado.toFixed(
    4
  )} indica la proporción de la variabilidad en Vtas que no es explicada por Pub.</p>`;

  // Interpretación de la tendencia lineal
  interpretation += `<h3>Interpretación de la Tendencia Lineal:</h3>`;
  if (m < 0) {
    interpretation += `<p>- Por cada unidad que aumenta la publicidad, las ventas disminuyen en ${Math.abs(m)} unidades. Esto indica una tendencia negativa en la relación entre ambas variables.`;
} else {
    interpretation += `<p>- Por cada unidad que aumenta la publicidad, las ventas aumentan en ${m} unidades. Esto indica una tendencia positiva en la relación entre ambas variables.`;
}
  
  interpretation += `<p>- El intercepto (b) es ${b.toFixed(
    4
  )}. Esto representa el valor de Vtas cuando Pub es cero. En este contexto, indica que si no hay publicidad, se espera que las ventas sean de ${b.toFixed(
    4
  )} unidades.</p>`;

  interpretationDiv.innerHTML = interpretation;

  // Interpretación logic remains here...
}

function createScatterPlot(m, b) {
  const ctx = document.createElement("canvas");
  document.getElementById("chart").innerHTML = ""; // Clear previous chart
  document.getElementById("chart").appendChild(ctx);
  const regressionLine = [];
  const minX = Math.min(...x);
  const maxX = Math.max(...x);

  // Generar puntos de la línea de regresión
  regressionLine.push({ x: minX, y: m * minX + b });
  regressionLine.push({ x: maxX, y: m * maxX + b });

  scatterChart = new Chart(ctx.getContext("2d"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Gráfico de Dispersión",
          data: x.map((xi, i) => ({ x: xi, y: y[i] })),
          backgroundColor: "rgba(255, 20, 147, 0.5)",
        },
        {
          label: "Línea de Regresión",
          data: regressionLine,
          type: "line", // Tipo de gráfico de la línea
          backgroundColor: "rgba(0, 0, 255, 0.5)", // Color de la línea
          borderColor: "rgba(0, 0, 255, 1)", // Color del borde de la línea
          fill: false, // No llenar el área debajo de la línea
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Pub",
          },
        },
        y: {
          title: {
            display: true,
            text: "Vtas",
          },
        },
      },
    },
  });
}

function resetData() {
  // Reiniciar los arrays x e y
  x = [];
  y = [];
  sumX = 0;
  sumY = 0;
  sumX2 = 0;
  sumY2 = 0;
  sumXY = 0;

  // Limpiar la tabla de datos
  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // Eliminar todas las filas

  // Agregar una fila inicial para la entrada de datos
  const newRow = tableBody.insertRow();
  newRow.innerHTML = `
        <td>1</td>
        <td><input type="number" class="pub" placeholder="Pub"></td>
        <td><input type="number" class="vtas" placeholder="Vtas"></td>
        <td></td>
        <td></td>
        <td><button onclick="removeRow(this)">Eliminar</button></td>
    `;

  // Limpiar resultados y gráfico
  document.getElementById("result-data").innerHTML = "";
  document.getElementById("chart").innerHTML = "";
  document.getElementById("total-pub").innerText = "";
  document.getElementById("total-vtas").innerText = "";
  document.getElementById("total-pub2").innerText = "";
  document.getElementById("total-vtas2").innerText = "";
  document.getElementById("interpretation").innerText = "";
}
function showStatistics() {
  if (x.length === 0 || y.length === 0) {
    alert("No hay datos para calcular estadísticas.");
    return;
  }

  // Calcular la media
  const meanX = x.reduce((a, b) => a + b, 0) / x.length;
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;

  // Calcular la mediana
  const medianX = calculateMedian(x);
  const medianY = calculateMedian(y);

  // Calcular la desviación estándar
  const stdDevX = calculateStandardDeviation(x, meanX);
  const stdDevY = calculateStandardDeviation(y, meanY);

  alert(
    `Media de Pub: ${meanX.toFixed(2)}\nMedia de Vtas: ${meanY.toFixed(2)}\n` +
      `Mediana de Pub: ${medianX.toFixed(
        2
      )}\nMediana de Vtas: ${medianY.toFixed(2)}\n` +
      `Desviación Estándar de Pub: ${stdDevX.toFixed(
        2
      )}\nDesviación Estándar de Vtas: ${stdDevY.toFixed(2)}`
  );
}

// Función para calcular la mediana
function calculateMedian(arr) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Función para calcular la desviación estándar
function calculateStandardDeviation(arr, mean) {
  const variance =
    arr.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}
function exportToExcel() {
    const rows = document.querySelectorAll("#data-table tbody tr");
    const data = [["#", "Pub", "Vtas", "X²", "Y²"]]; // Encabezados
  
    rows.forEach((row, index) => {
      const pub = row.querySelector(".pub").value || "";
      const vtas = row.querySelector(".vtas").value || "";
      const x2 = row.cells[3].innerText;
      const y2 = row.cells[4].innerText;
      data.push([index + 1, pub, vtas, x2, y2]); // Agregar cada fila
    });
  
    const ws = XLSX.utils.aoa_to_sheet(data); // Convertir el array a hoja Excel
    const wb = XLSX.utils.book_new(); // Crear un libro Excel
    XLSX.utils.book_append_sheet(wb, ws, "Datos"); // Agregar la hoja al libro
  
    XLSX.writeFile(wb, "datos.xlsx"); // Descargar el archivo Excel
  }
function exportChart() {
    if (scatterChart) {
      const link = document.createElement("a");
      link.href = scatterChart.toBase64Image();
      link.download = "grafico.png";
      link.click();
    } else {
      alert("No hay gráfico para exportar.");
    }
  }

function predictSales() {
    const pendienteElem = document.getElementById("pendiente");
    const interceptoElem = document.getElementById("intercepto");
  
    if (!pendienteElem || !interceptoElem) {
      alert("Asegúrate de calcular los resultados antes de predecir.");
      return;
    }
  
    const m = parseFloat(pendienteElem.innerText);
    const b = parseFloat(interceptoElem.innerText);
  
    const pubValue = parseFloat(prompt("Ingresa un valor de Pub para predecir las ventas:")) || 0;
    const predictedVtas = m * pubValue + b;
  
    alert(`Para Pub = ${pubValue}, la predicción de Vtas es: ${predictedVtas.toFixed(2)}`);
  }
  
