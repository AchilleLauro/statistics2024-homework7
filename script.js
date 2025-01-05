// Variabile globale per il grafico delle medie campionarie
let samplingChart;

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
            <li>Theoretical Mean: ${theoreticalMean}</li>
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
        type: 'histogram',
        data: {
            labels: sampleMeans,
            datasets: [
                {
                    label: 'Sample Means',
                    data: sampleMeans,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    binWidth: 0.1 // Regola la larghezza dei bin per il grafico a istogramma
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
    const numberOfSamples = 1000; // Puoi modificare questo valore

    // Genera le medie campionarie
    const sampleMeans = generateSamplingAverages(values, probabilities, numberOfSamples, sampleSize);

    // Calcola le statistiche teoriche
    const theoreticalMean = calculateTheoreticalMean(values, probabilities);
    const theoreticalVariance = calculateTheoreticalVariance(values, probabilities, theoreticalMean);

    // Traccia il grafico delle medie campionarie
    plotSamplingDistribution(sampleMeans, theoreticalMean, theoreticalVariance);
});
