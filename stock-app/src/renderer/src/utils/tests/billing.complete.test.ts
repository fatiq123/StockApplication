// src/renderer/src/utils/tests/billing.complete.test.ts
import { expect, it, describe } from '@jest/globals';
import { calculateAppleBill, calculatePotatoBill } from '../billing';

describe('Complete Billing System Tests', () => {
  describe('Apple Storage Edge Cases', () => {
    const appleRate = 100;

    it('should handle withdrawal on rate change day (day 3 to 4)', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-02-04'); // First day of half-rate
      const quantity = 10;
      
      const result = calculateAppleBill(quantity, appleRate, startDate, endDate);
      expect(result.totalAmount).toBe(1500); // 1000 (first month) + 500 (half rate)
    });

    it('should handle withdrawal on half to full rate transition (day 18 to 19)', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-02-19'); // First day of full rate
      const quantity = 10;
      
      const result = calculateAppleBill(quantity, appleRate, startDate, endDate);
      expect(result.totalAmount).toBe(2000); // 1000 (first month) + 1000 (full rate)
    });

    it('should handle long-term storage (6+ months)', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-07-15'); // 6.5 months
      const quantity = 5;
      
      const result = calculateAppleBill(quantity, appleRate, startDate, endDate);
      // 6 full months + half month in July
      expect(result.totalAmount).toBe(3250); // (6 * 500) + 250
    });

    it('should handle year transition correctly', () => {
      const startDate = new Date('2025-12-15');
      const endDate = new Date('2026-01-05');
      const quantity = 4;
      
      const result = calculateAppleBill(quantity, appleRate, startDate, endDate);
      expect(result.totalAmount).toBe(400); // Only December charge as January is in exempt period
    });
  });



  

  describe('Potato Storage Edge Cases', () => {
    const potatoRate = 1200; // Fixed rate for 10 months

    it('should calculate correct amount for January start', () => {
      const startDate = new Date('2025-01-01');
      const quantity = 5;
      
      const result = calculatePotatoBill(quantity, potatoRate, startDate);
      expect(result.totalAmount).toBe(6000); // 5 sacks * 1200 PKR
    });

    it('should calculate same amount for October start', () => {
      const startDate = new Date('2025-10-31');
      const quantity = 5;
      
      const result = calculatePotatoBill(quantity, potatoRate, startDate);
      expect(result.totalAmount).toBe(6000); // Should be same as January start
    });

    it('should validate start date format properly', () => {
      expect(() => {
        calculatePotatoBill(5, potatoRate, new Date('2025-11-01'));
      }).toThrow('Potato storage must start between January and October');
    });

    it('should handle zero quantity input', () => {
      const startDate = new Date('2025-01-01');
      const quantity = 0;
      
      const result = calculatePotatoBill(quantity, potatoRate, startDate);
      expect(result.totalAmount).toBe(0);
    });

    it('should handle large quantities correctly', () => {
      const startDate = new Date('2025-01-01');
      const quantity = 1000; // Large number of sacks
      
      const result = calculatePotatoBill(quantity, potatoRate, startDate);
      expect(result.totalAmount).toBe(1200000); // 1000 * 1200
    });
  });

  describe('Input Validation and Error Handling', () => {
    it('should handle negative quantities', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-02-01');
      
      expect(() => {
        calculateAppleBill(-5, 100, startDate, endDate);
      }).toThrow('Quantity must be positive');
      
      expect(() => {
        calculatePotatoBill(-5, 1200, startDate);
      }).toThrow('Quantity must be positive');
    });

    it('should handle invalid dates', () => {
      expect(() => {
        calculateAppleBill(5, 100, new Date('invalid'), new Date('2025-02-01'));
      }).toThrow('Invalid date');
      
      expect(() => {
        calculatePotatoBill(5, 1200, new Date('invalid'));
      }).toThrow('Invalid date');
    });

    it('should handle end date before start date', () => {
      const startDate = new Date('2025-02-01');
      const endDate = new Date('2025-01-01');
      
      expect(() => {
        calculateAppleBill(5, 100, startDate, endDate);
      }).toThrow('End date cannot be before start date');
    });

    it('should handle negative rates', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-02-01');
      
      expect(() => {
        calculateAppleBill(5, -100, startDate, endDate);
      }).toThrow('Rate must be positive');
      
      expect(() => {
        calculatePotatoBill(5, -1200, startDate);
      }).toThrow('Rate must be positive');
    });
  });
});