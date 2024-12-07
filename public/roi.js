document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('roiForm');
    const results = document.getElementById('results');
    const roiResult = document.getElementById('roiResult');
    const annualizedRoiResult = document.getElementById('annualizedRoiResult');
    const summary = document.getElementById('summary');
    const errorElement = document.getElementById('error');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatPercentage = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value / 100);
    };

    const showError = (message) => {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        errorElement.classList.add('visible');
        results.classList.add('hidden');
        results.classList.remove('visible');

        setTimeout(() => {
            errorElement.classList.remove('visible');
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 300);
        }, 5000);
    };

    const calculateROI = (initialInvestment, finalValue, years) => {
        const roi = ((finalValue - initialInvestment) / initialInvestment) * 100;
        let annualizedRoi = null;

        if (years > 1) {
            annualizedRoi = (Math.pow((finalValue / initialInvestment), (1 / years)) - 1) * 100;
        }

        return { roi, annualizedRoi };
    };

    const generateSummary = (initialInvestment, finalValue, years, roi) => {
        const profit = finalValue - initialInvestment;
        const profitText = profit >= 0 ? 'profit' : 'loss';
        
        return `Your ${formatCurrency(initialInvestment)} investment ${
            years === 1 ? 'over 1 year' : `over ${years} years`
        } resulted in a ${profitText} of ${formatCurrency(Math.abs(profit))}.`;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const initialInvestment = parseFloat(document.getElementById('initialInvestment').value);
        const finalValue = parseFloat(document.getElementById('finalValue').value);
        const years = parseFloat(document.getElementById('years').value);

        // Validation
        if (initialInvestment <= 0) {
            showError('Initial investment must be greater than zero.');
            return;
        }

        if (years <= 0) {
            showError('Investment duration must be greater than zero.');
            return;
        }

        // Calculate ROI
        const { roi, annualizedRoi } = calculateROI(initialInvestment, finalValue, years);

        // Update UI
        roiResult.textContent = formatPercentage(roi);
        annualizedRoiResult.textContent = annualizedRoi ? formatPercentage(annualizedRoi) : 'N/A';
        summary.textContent = generateSummary(initialInvestment, finalValue, years, roi);

        // Show results with animation
        errorElement.classList.add('hidden');
        results.classList.remove('hidden');
        setTimeout(() => {
            results.classList.add('visible');
        }, 50);
    });

    // Add input validation
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9.-]/g, '');
        });
    });
});