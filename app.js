let x = [];
let y = [];

function addRow() {
    const table = document.getElementById("data-table").getElementsByTagName("tbody")[0];
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
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateRowNumbers();
}

function updateRowNumbers() {
    const rows = document.querySelectorAll("#data-table tbody tr");
    rows.forEach((row, index) => {
        row.cells[0].innerText = index+1; // Update row number
    });
}
function calculate() {
    x = [];
    y = [];
    const rows = document.querySelectorAll("#data-table tbody tr");
    let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;

    rows.forEach(row => {
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
        const cellX2 = row.cells[3];  // X² está en la cuarta celda
        const cellY2 = row.cells[4];  // Y² está en la quinta celda

        // Actualizar los campos X² y Y² en la tabla
        cellX2.innerText = (pubValue ** 2).toFixed(2);  // X²
        cellY2.innerText = (vtasValue ** 2).toFixed(2); // Y²
    });

    const n = x.length;
    const Sxx = sumX2 - (sumX ** 2 / n);
    const Syy = sumY2 - (sumY ** 2 / n);
    const Sxy = sumXY - (sumX * sumY / n);
    const r = Sxy / Math.sqrt(Sxx * Syy);
    const r2 = r ** 2;
    const r2Negado = 1 - r2;

    const resultsDiv = document.getElementById("result-data");
    resultsDiv.innerHTML = `
        <h2>Resultados</h2>
        <p>Sxx = ${Sxx.toFixed(2)}</p>
        <p>Syy = ${Syy.toFixed(2)}</p>
        <p>Sxy = ${Sxy.toFixed(2)}</p>
        <p>r = ${r.toFixed(4)}</p>
        <p>R² = ${r2.toFixed(4)}</p>
        <p>1 - R² = ${r2Negado.toFixed(4)}</p>
    `;

    const interpretationDiv = document.getElementById("interpretation");
    interpretationDiv.innerHTML = `
        <h3>Interpretación:</h3>
        <p>- r indica la fuerza y dirección de la relación lineal entre las variables. Un valor de r cerca de 1 o -1 indica una fuerte relación, mientras que un valor cerca de 0 indica poca o ninguna relación.</p>
        <p>- R² indica la proporción de la varianza en la variable dependiente que se puede predecir a partir de la variable independiente. Un R² de 1 significa que el modelo explica toda la variabilidad, mientras que un R² de 0 significa que no explica nada.</p>
    `;

    document.getElementById("total-pub").innerText = sumX.toFixed(2);
    document.getElementById("total-vtas").innerText = sumY.toFixed(2);
    document.getElementById("total-pub2").innerText = sumX2.toFixed(2);
    document.getElementById("total-vtas2").innerText = sumY2.toFixed(2);

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

    alert(`Media de Pub: ${meanX.toFixed(2)}\nMedia de Vtas: ${meanY.toFixed(2)}\n` +
          `Mediana de Pub: ${medianX.toFixed(2)}\nMediana de Vtas: ${medianY.toFixed(2)}\n` +
          `Desviación Estándar de Pub: ${stdDevX.toFixed(2)}\nDesviación Estándar de Vtas: ${stdDevY.toFixed(2)}`);
}

// Función para calcular la mediana
function calculateMedian(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Función para calcular la desviación estándar
function calculateStandardDeviation(arr, mean) {
    const variance = arr.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

function createScatterPlot() {
    const ctx = document.createElement("canvas");
    document.getElementById("chart").innerHTML = ''; // Clear previous chart
    document.getElementById("chart").appendChild(ctx);

    const scatterChart = new Chart(ctx.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Gráfico de Dispersión',
                data: x.map((xi, i) => ({ x: xi, y: y[i] })),
                backgroundColor: 'rgba(255, 20, 147, 0.5)',
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Pub'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Vtas'
                    }
                }
            }
        }
    });
}

function resetData() {
    // Reiniciar los arrays x e y
    x = [];
    y = [];

    // Limpiar la tabla de datos
    const tableBody = document.querySelector("#data-table tbody");
    tableBody.innerHTML = ''; // Eliminar todas las filas

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
    document.getElementById("results").innerHTML = '';
    document.getElementById("chart").innerHTML = '';
    document.getElementById("total-pub").innerText = '';
    document.getElementById("total-vtas").innerText = '';
    document.getElementById("total-pub2").innerText = '';
    document.getElementById("total-vtas2").innerText = '';
}

