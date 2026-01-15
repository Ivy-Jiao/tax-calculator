import React, { useState } from 'react';
import './IncomeTaxCalculator.css';

// TaxBracket Component (using Props)
function TaxBracket({ limit, rate, previousLimit }) {
  const formatCurrency = (amount) => `$${amount.toLocaleString()}`;
  const formatRate = (rate) => `${(rate * 100).toFixed(1)}%`;
  
  return (
    <div className="tax-bracket">
      <span className="bracket-range">
        {formatCurrency(previousLimit)} - {limit === Infinity ? '∞' : formatCurrency(limit)}
      </span>
      <span className="bracket-rate">{formatRate(rate)}</span>
    </div>
  );
}

// Main Calculator Component (using State)
function IncomeTaxCalculator() {
  const [income, setIncome] = useState('');
  const [tax, setTax] = useState(null);
  const [effectiveRate, setEffectiveRate] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024-2025');

  // Tax brackets configuration for different years
  const taxYears = {
    '2024-2025': {
      year: '2024-2025',
      brackets: [
        { limit: 18200, rate: 0 },
        { limit: 45000, rate: 0.19 },
        { limit: 120000, rate: 0.325 },
        { limit: 180000, rate: 0.37 },
        { limit: Infinity, rate: 0.45 }
      ]
    },
    '2023-2024': {
      year: '2023-2024',
      brackets: [
        { limit: 18200, rate: 0 },
        { limit: 45000, rate: 0.19 },
        { limit: 120000, rate: 0.325 },
        { limit: 180000, rate: 0.37 },
        { limit: Infinity, rate: 0.45 }
      ]
    },
    '2022-2023': {
      year: '2022-2023',
      brackets: [
        { limit: 18200, rate: 0 },
        { limit: 45000, rate: 0.19 },
        { limit: 120000, rate: 0.325 },
        { limit: 180000, rate: 0.37 },
        { limit: Infinity, rate: 0.45 }
      ]
    },
    '2021-2022': {
      year: '2021-2022',
      brackets: [
        { limit: 18200, rate: 0 },
        { limit: 37000, rate: 0.19 },
        { limit: 90000, rate: 0.325 },
        { limit: 180000, rate: 0.37 },
        { limit: Infinity, rate: 0.45 }
      ]
    }
  };

  const currentBrackets = taxYears[selectedYear].brackets;

  // Calculate tax amount
  const calculateTax = (brackets, incomeAmount) => {
    let totalTax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
      if (incomeAmount <= previousLimit) break;
      
      const taxableIncome = Math.min(incomeAmount, bracket.limit) - previousLimit;
      totalTax += taxableIncome * bracket.rate;
      previousLimit = bracket.limit;
    }

    return totalTax;
  };

  // Handle input change
  const handleIncomeChange = (e) => {
    const value = e.target.value;
    setIncome(value);

    if (value && !isNaN(value) && parseFloat(value) >= 0) {
      const incomeAmount = parseFloat(value);
      const calculatedTax = calculateTax(currentBrackets, incomeAmount);
      setTax(calculatedTax);
      setEffectiveRate(incomeAmount > 0 ? (calculatedTax / incomeAmount) * 100 : 0);
    } else {
      setTax(null);
      setEffectiveRate(null);
    }
  };

  // Handle tax year change
  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    
    // Recalculate tax if income is already entered
    if (income && !isNaN(income) && parseFloat(income) >= 0) {
      const incomeAmount = parseFloat(income);
      const calculatedTax = calculateTax(taxYears[year].brackets, incomeAmount);
      setTax(calculatedTax);
      setEffectiveRate(incomeAmount > 0 ? (calculatedTax / incomeAmount) * 100 : 0);
    }
  };

  // Reset form
  const handleReset = () => {
    setIncome('');
    setTax(null);
    setEffectiveRate(null);
  };

  return (
    <div className="calculator-container">
      <h1>🧮 Income Tax Calculator</h1>
      <p className="subtitle">Australian Tax Calculator</p>

      {/* Input section */}
      <div className="input-section">
        <label htmlFor="tax-year">Select Tax Year</label>
        <select 
          id="tax-year" 
          value={selectedYear} 
          onChange={handleYearChange}
          className="year-selector"
        >
          {Object.keys(taxYears).map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <label htmlFor="income">Annual Income (AUD)</label>
        <input
          id="income"
          type="number"
          value={income}
          onChange={handleIncomeChange}
          placeholder="Enter your annual income"
          min="0"
        />
        <button onClick={handleReset} className="reset-btn">Reset</button>
      </div>

      {/* Result display */}
      {tax !== null && (
        <div className="result-section">
          <div className="result-card">
            <h3>Tax Payable</h3>
            <p className="result-amount">${tax.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="result-card">
            <h3>After Tax Income</h3>
            <p className="result-amount">${(parseFloat(income) - tax).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="result-card">
            <h3>Effective Tax Rate</h3>
            <p className="result-amount">{effectiveRate.toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Tax brackets table */}
      <div className="brackets-section">
        <h2>Tax Brackets ({selectedYear})</h2>
        {currentBrackets.map((bracket, index) => (
          <TaxBracket
            key={index}
            limit={bracket.limit}
            rate={bracket.rate}
            previousLimit={index === 0 ? 0 : currentBrackets[index - 1].limit}
          />
        ))}
      </div>
    </div>
  );
}

export default IncomeTaxCalculator;
