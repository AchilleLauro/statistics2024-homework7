// Variabile globale per il grafico delle medie campionarie
let samplingChart;

// Funzione per generare campioni empirici da una distribuzione teorica
function generateEmpiricalData(values, probabilities, sampleSize) {
    const empiricalData = [];
    for (let i = 0; i < sampleSize; i++) {
        const random = Math.random();
        let cumulativeProbability = 0;
        for (let j = 0; j < probabilities.length; j++) {
            cumulativeProbability += probabilities[j];
            if (random <= cumulativeProbability) {
                empiricalData.push(values[j]);
                break;
            }
        }
    }
    return empiricalData;
}

// Funzione per calcolare media e varianza dai dati simulati (empiriche)
function calculateEmpiricalStats(data) {
    let mean = 0;
    let variance = 0;
    const n = data.length;

    // Calcolo della media empirica
    data.forEach((value) => {
        mean += value;
    });
    mean /= n;

    // Calcolo della varianza empirica
    data.forEach((value) => {
        variance += Math.pow(value - mean, 2);
    });
    variance /= n;

    return { mean, variance };
}

// Funzione per calcolare la media teorica
function calculateTheoreticalMean(values, probabilities) {
    return values.reduce((sum, val, i) => sum + val * probabilities[i], 0);
}

// Funzione per calcolare la varianza teorica
function calculateTheoreticalVariance(values, probabilities, mean) {
    return values.reduce((sum, val, i) => sum + probabilities[i] * Math.pow(val - mean, 2), 0);
}

// Funzione per generare campioni e calcolare medie campionarie
function generateSamplingAverages(values, probabilities, m, n) {
    const sampleMeans = [];
    for (let i = 0; i < m; i++) {
        const sample = generateEmpiricalData(values, probabilities, n);
        const sampleStats = calculateEmpiricalStats(sample);
        sampleMeans.push(sampleStats.mean);
    }
    return sampleMeans;
}

// Funzione per tracciare il grafico delle medie campionarie
function plotSamplingDistribution(sampleMeans, theoreticalMean, theoreticalVariance) {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Calcola media e varianza delle medie campionarie
    const empiricalStats = calculateEmpiricalStats(sampleMeans);
    const empiricalMean = empiricalStats.mean.toFixed(3);
    const empiricalVariance = empiricalStats.variance.toFixed(3);

    // Mostra le statistiche nella UI
    document.getElementById('stats').innerHTML = `
        <strong>Sampling Distribution Statistics:</strong><br>
        <ul>
            <li>Empirical Mean of Sample Means: ${empiricalMean}</li>
            <li>Theoretical Mean: ${theoreticalMean.toFixed(3)}</li>
            <li>Empirical Variance of Sample Means: ${empiricalVariance}</li>
            <li>Theoretical Variance of Sample Means: ${(theoreticalVariance / sampleMeans.length).toFixed(3)}</li>
        </ul>
    `;

    // Distruggi il grafico precedente, se esiste
    if (samplingChart) {
        samplingChart.destroy();
    }

    // Crea il nuovo grafico
    samplingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sampleMeans,
            datasets: [
                {
                    label: 'Sample Means',
                    data: sampleMeans,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribution of Sample Means'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Sample Mean'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        }
    });
}

// Event listener per il form modificato
document.getElementById('dataForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Leggi i valori e le probabilità inseriti
    const values = document.getElementById('values').value.split(',').map(v => parseFloat(v.trim()));
    const probabilities = document.getElementById('probabilities').value.split(',').map(p => parseFloat(p.trim()));

    // Controlla che le probabilità siano valide
    const totalProbability = probabilities.reduce((sum, p) => sum + p, 0);
    if (Math.abs(totalProbability - 1) > 0.001) {
        alert('Le probabilità teoriche devono sommare a 1. Correggi i dati inseriti.');
        return;
    }

    // Leggi il sample size e il numero di campioni
    const sampleSize = parseInt(document.getElementById('sampleSize').value, 10);
    const numberOfSamples = parseInt(document.getElementById('numberOfSamples').value, 10);

    // Genera le medie campionarie
    const sampleMeans = generateSamplingAverages(values, probabilities, numberOfSamples, sampleSize);

    // Calcola le statistiche teoriche
    const theoreticalMean = calculateTheoreticalMean(values, probabilities);
    const theoreticalVariance = calculateTheoreticalVariance(values, probabilities, theoreticalMean);

    // Traccia il grafico delle medie campionarie
    plotSamplingDistribution(sampleMeans, theoreticalMean, theoreticalVariance);
});
