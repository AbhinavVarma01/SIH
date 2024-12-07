const ctx = document.getElementById('stockChart').getContext('2d');
const companyNameInput = document.getElementById('companyName');
const submitBtn = document.getElementById('submitBtn');

// Initialize the chart variable
let stockChart;

// Function to create/update the chart
function updateChart(companyName) {
    // Clear previous chart if it exists
    if (stockChart) {
        stockChart.destroy();
    }

    // Fetch data from the Alpha Vantage API
    const apiKey = 'C5OCC4VDCUTYNTRG'; // Your API key
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${companyName}&apikey=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('API response:', data); // Log the full response for debugging
            const timeSeries = data['Monthly Time Series'];
            if (!timeSeries) {
                alert('No data available for this company!');
                return;
            }

            // Prepare labels and data for the chart
            const labels = [];
            const profitsLosses = [];
            for (const [date, values] of Object.entries(timeSeries)) {
                labels.push(date);
                profitsLosses.push(parseFloat(values['4. close']) - parseFloat(values['1. open']));
            }

            // Reverse the data to show it in chronological order
            labels.reverse();
            profitsLosses.reverse();

            const chartData = {
                labels: labels,
                datasets: [{
                    label: `${companyName} Profit/Loss (in USD)`,
                    data: profitsLosses,
                    backgroundColor: function(context) {
                        const value = context.raw;
                        return value > 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)';
                    },
                    borderColor: function(context) {
                        const value = context.raw;
                        return value > 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)';
                    },
                    borderWidth: 1
                }]
            };

            // Chart configuration
            const config = {
                type: 'bar', // Change to 'line' if you want a line chart
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Allow height adjustment
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.raw > 0 ? `Profit: $${context.raw}` : `Loss: $${-context.raw}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Profit/Loss Amount (in USD)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Years'
                            }
                        }
                    }
                }
            };

            // Render the chart
            stockChart = new Chart(ctx, config);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data from the API.');
        });
}

// Event listener for the button
submitBtn.addEventListener('click', () => {
    const companyName = companyNameInput.value.trim().toUpperCase(); // Ensure the symbol is uppercase
    if (companyName) {
        updateChart(companyName);
    } else {
        alert('Please enter a company symbol!');
    }
});
