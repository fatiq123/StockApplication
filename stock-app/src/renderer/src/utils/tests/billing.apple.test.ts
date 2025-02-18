// import { describe, it, expect } from 'jest';
import {expect, it, describe } from '@jest/globals';
import { calculateAppleBill } from '../billing';

// interface BillCalculationResult {
//   totalAmount: number;
//   details: string;
// }

describe('Apple Storage Billing Calculations', () => {
  const baseRate = 100; // PKR per crate per month

  it('should calculate bill for a single month storage', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');
    const quantity = 10;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    expect(result.totalAmount).toBe(1000); // 10 crates * 100 PKR
    expect(result.details).toContain('January 2025 (First Month)');
    expect(result.details).toContain('1000 PKR');
  });

  it('should apply exempt period for first 3 days of final month', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-02-03');
    const quantity = 5;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    expect(result.totalAmount).toBe(500); // Only first month charged
    expect(result.details).toContain('Exempt (days 1-3)');
    expect(result.details).toContain('No charge (exempt period)');
  });

  it('should apply half rate for days 4-18 of final month', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-02-15');
    const quantity = 8;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    // First month: 8 * 100 = 800
    // Second month (half rate): 8 * (100 * 0.5) = 400
    expect(result.totalAmount).toBe(1200);
    expect(result.details).toContain('Half rate (days 4-18');
  });

  it('should apply full rate for days 19 onwards of final month', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-02-25');
    const quantity = 6;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    // First month: 6 * 100 = 600
    // Second month (full rate): 6 * 100 = 600
    expect(result.totalAmount).toBe(1200);
    expect(result.details).toContain('Full rate');
  });

  it('should calculate correctly for multiple complete months', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-03-15');
    const quantity = 4;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    // First month: 4 * 100 = 400
    // Second month: 4 * 100 = 400
    // Third month (half rate): 4 * (100 * 0.5) = 200
    expect(result.totalAmount).toBe(1000);
    expect(result.details).toContain('January 2025');
    expect(result.details).toContain('February 2025');
    expect(result.details).toContain('March 2025');
  });

  it('should handle zero quantity correctly', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-02-15');
    const quantity = 0;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    expect(result.totalAmount).toBe(0);
    expect(result.details).toContain('Number of Crates: 0');
  });

  it('should validate date formatting in details', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');
    const quantity = 1;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    expect(result.details).toMatch(/Storage Period: \d{2} [A-Za-z]{3} \d{4} to \d{2} [A-Za-z]{3} \d{4}/);
    expect(result.details).toContain('BILLING DETAILS:');
    expect(result.details).toContain('MONTHLY BREAKDOWN:');
  });

  it('should handle different rates correctly', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-02-15');
    const quantity = 5;
    const customRate = 150;
    
    const result = calculateAppleBill(quantity, customRate, startDate, endDate);
    
    // First month: 5 * 150 = 750
    // Second month (half rate): 5 * (150 * 0.5) = 375
    expect(result.totalAmount).toBe(1125);
    expect(result.details).toContain('Base Rate: 150 PKR');
  });

  // Edge cases
  it('should handle same start and end date', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-01');
    const quantity = 3;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    expect(result.totalAmount).toBe(300); // Should charge for full first month
    expect(result.details).toContain('First Month');
  });

  it('should handle month transitions correctly', () => {
    const startDate = new Date('2025-01-31');
    const endDate = new Date('2025-02-01');
    const quantity = 2;
    
    const result = calculateAppleBill(quantity, baseRate, startDate, endDate);
    
    expect(result.totalAmount).toBe(200); // Should only charge for first month
    expect(result.details).toContain('January 2025');
    expect(result.details).toContain('Exempt (days 1-3)');
  });
});