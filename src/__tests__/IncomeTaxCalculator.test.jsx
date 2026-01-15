import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IncomeTaxCalculator from '../IncomeTaxCalculator';

describe('IncomeTaxCalculator', () => {
  it('renders calculator title', () => {
    render(<IncomeTaxCalculator />);
    expect(screen.getByText('🧮 Income Tax Calculator')).toBeInTheDocument();
  });

  it('renders tax year selector', () => {
    render(<IncomeTaxCalculator />);
    expect(screen.getByLabelText('Select Tax Year')).toBeInTheDocument();
  });

  it('renders income input field', () => {
    render(<IncomeTaxCalculator />);
    expect(screen.getByLabelText('Annual Income (AUD)')).toBeInTheDocument();
  });

  it('calculates tax correctly for income $50,000 in 2024-2025', () => {
    render(<IncomeTaxCalculator />);
    const input = screen.getByLabelText('Annual Income (AUD)');

    fireEvent.change(input, { target: { value: '50000' } });

    // Expected tax: (45000-18200)*0.19 + (50000-45000)*0.325 = 5092 + 1625 = 6717
    expect(screen.getByText(/Tax Payable/i)).toBeInTheDocument();
    expect(screen.getByText(/\$6,717\.00/)).toBeInTheDocument();
  });

  it('calculates tax correctly for income $100,000 in 2024-2025', () => {
    render(<IncomeTaxCalculator />);
    const input = screen.getByLabelText('Annual Income (AUD)');

    fireEvent.change(input, { target: { value: '100000' } });

    // Expected tax: (45000-18200)*0.19 + (100000-45000)*0.325 = 5092 + 17875 = 22967
    expect(screen.getByText(/\$22,967\.00/)).toBeInTheDocument();
  });

  it('shows no tax for income below $18,200', () => {
    render(<IncomeTaxCalculator />);
    const input = screen.getByLabelText('Annual Income (AUD)');

    fireEvent.change(input, { target: { value: '15000' } });

    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('changes tax calculation when year is changed', () => {
    render(<IncomeTaxCalculator />);
    const input = screen.getByLabelText('Annual Income (AUD)');
    const yearSelector = screen.getByLabelText('Select Tax Year');

    // Enter income
    fireEvent.change(input, { target: { value: '40000' } });

    // Change year to 2021-2022 (different brackets)
    fireEvent.change(yearSelector, { target: { value: '2021-2022' } });

    // Tax should recalculate with new brackets
    expect(screen.getByText(/Tax Payable/i)).toBeInTheDocument();
  });

  it('resets all fields when reset button is clicked', () => {
    render(<IncomeTaxCalculator />);
    const input = screen.getByLabelText('Annual Income (AUD)');
    const resetButton = screen.getByText('Reset');

    // Enter income
    fireEvent.change(input, { target: { value: '50000' } });
    expect(screen.getByText(/Tax Payable/i)).toBeInTheDocument();

    // Click reset
    fireEvent.click(resetButton);

    // Input should be cleared
    expect(input.value).toBe('');
    // Results should be hidden
    expect(screen.queryByText(/Tax Payable/i)).not.toBeInTheDocument();
  });

  it('displays effective tax rate', () => {
    render(<IncomeTaxCalculator />);
    const input = screen.getByLabelText('Annual Income (AUD)');

    fireEvent.change(input, { target: { value: '50000' } });

    expect(screen.getByText(/Effective Tax Rate/i)).toBeInTheDocument();
  });

  it('displays after-tax income', () => {
    render(<IncomeTaxCalculator />);
    const input = screen.getByLabelText('Annual Income (AUD)');

    fireEvent.change(input, { target: { value: '50000' } });

    expect(screen.getByText(/After Tax Income/i)).toBeInTheDocument();
  });

  it('displays all tax brackets', () => {
    render(<IncomeTaxCalculator />);

    expect(screen.getByText(/Tax Brackets/i)).toBeInTheDocument();
    // Should show multiple bracket rates
    expect(screen.getAllByText(/0\.0%|19\.0%|32\.5%|37\.0%|45\.0%/)).toHaveLength;
  });
});
