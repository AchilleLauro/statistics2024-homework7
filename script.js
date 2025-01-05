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

            data.forEach((value) => {
                mean += value;
            });
            mean /= n;

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

            const empiricalStats = calculateEmpiricalStats(sampleMeans);
            const empiricalMean = empiricalStats.mean.toFixed(3);
            const empiricalVariance = empiricalStats.variance.toFixed(3);

            document.getElementById('stats').innerHTML = `
                <strong>Sampling Distribution Statistics:</strong><br>
                <ul>
                    <li>Empirical Mean of Sample Means: ${empiricalMean}</li>
                    <li>Theoretical Mean: ${theoreticalMean.toFixed(3)}</li>
                    <li>Empirical Variance of Sample Means: ${empiricalVariance}</li>
                    <li>Theoretical Variance of Sample Means: ${(theoreticalVariance / sampleMeans.length).toFixed(3)}</li>
                </ul>
            `;

            if (samplingChart) {
                samplingChart.destroy();
            }

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
                        x: { title: { display: true, text: 'Sample Mean' } },
                        y: { title: { display: true, text: 'Frequency' } }
                    }
                }
            });
        }

        // Event listener per il form modificato
        document.getElementById('dataForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const values = document.getElementById('values').value.split(',').map(v => parseFloat(v.trim()));
            const probabilities = document.getElementById('probabilities').value.split(',').map(p => parseFloat(p.trim()));

            const totalProbability = probabilities.reduce((sum, p) => sum + p, 0);
            if (Math.abs(totalProbability - 1) > 0.001) {
                alert('Le probabilità teoriche devono sommare a 1. Correggi i dati inseriti.');
                return;
            }

            const sampleSize = parseInt(document.getElementById('sampleSize').value, 10);
            const numberOfSamples = parseInt(document.getElementById('numberOfSamples').value, 10);

            const sampleMeans = generateSamplingAverages(values, probabilities, numberOfSamples, sampleSize);

            const theoreticalMean = calculateTheoreticalMean(values, probabilities);
            const theoreticalVariance = calculateTheoreticalVariance(values, probabilities, theoreticalMean);

            plotSamplingDistribution(sampleMeans, theoreticalMean, theoreticalVariance);
        });

        // Cryptographic analysis
        const generateDistribution = (g, n, maxU) => {
            const frequencies = new Array(n).fill(0);
            for (let U = 1; U <= maxU; U++) {
                const Y = Math.pow(g, U) % n;
                frequencies[Y]++;
            }
            return frequencies.map(freq => freq / maxU);
        };

        const calculateEntropy = (distribution) => {
            let entropy = 0;
            distribution.forEach(p => {
                if (p > 0) {
                    entropy -= p * Math.log2(p);
                }
            });
            return entropy.toFixed(3);
        };

        const plotCryptoDistribution = (g, n, frequencies, entropy) => {
            const chartContainer = document.getElementById('cryptoGraphs');
            chartContainer.innerHTML += `<canvas id="chart-${g}-${n}" width="400" height="200"></canvas>`;
            const ctx = document.getElementById(`chart-${g}-${n}`).getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: frequencies.map((_, i) => i),
                    datasets: [{
                        label: `g = ${g}, n = ${n}, Entropy: ${entropy}`,
                        data: frequencies,
                        backgroundColor: 'rgba(153, 102, 255, 0.7)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Distribution of Y = g^U mod ${n} (g = ${g})`
                        }
                    },
                    scales: {
                        x: { title: { display: true, text: 'Value of Y' } },
                        y: { title: { display: true, text: 'Frequency' } }
                    }
                }
            });
        };

        // Parameters for cryptographic distributions
        const caseA = { n: 19, gValues: [2, 3, 10, 17] };
        const caseB = { n: 15, gValues: [3, 6, 9, 12] };
        const maxU = 1000;

        caseA.gValues.forEach(g => {
            const frequencies = generateDistribution(g, caseA.n, maxU);
            const entropy = calculateEntropy(frequencies);
            plotCryptoDistribution(g, caseA.n, frequencies, entropy);
        });

        caseB.gValues.forEach(g => {
            const frequencies = generateDistribution(g, caseB.n, maxU);
            const entropy = calculateEntropy(frequencies);
            plotCryptoDistribution(g, caseB.n, frequencies, entropy);
        });
