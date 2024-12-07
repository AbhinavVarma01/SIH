function calculateRetirement() {
    const currentAge = parseFloat(document.getElementById('currentAge').value);
    const retirementAge = parseFloat(document.getElementById('retirementAge').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const annualContribution = parseFloat(document.getElementById('annualContribution').value);
    const annualReturnRate = parseFloat(document.getElementById('annualReturnRate').value) / 100;

    if (isNaN(currentAge) || isNaN(retirementAge) || isNaN(currentSavings) || 
        isNaN(annualContribution) || isNaN(annualReturnRate)) {
        showResult('Please fill in all fields with valid numbers.', 'error');
        return;
    }

    if (currentAge >= retirementAge) {
        showResult('Retirement age must be greater than current age.', 'error');
        return;
    }

    let totalSavings = currentSavings;
    for (let i = 0; i < retirementAge - currentAge; i++) {
        totalSavings += annualContribution;
        totalSavings *= (1 + annualReturnRate);
    }

    const formattedSavings = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(totalSavings);

    showResult(`Projected savings at retirement: <strong>${formattedSavings}</strong>`, 'success');
}

function showResult(message, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>${message}</p>`;
    resultDiv.className = `result ${type}`;
}

// Make the calculate function available globally
window.calculateRetirement = calculateRetirement;