// billing.test.ts
import { validatePotatoDate, calculatePotatoBill, calculateAppleBill } from '../billing';
import dayjs from 'dayjs';

describe('Potato Storage Billing Tests', () => {
  const POTATO_RATE = 1200;  // Fixed rate per sack for 10 months

  describe('validatePotatoDate', () => {
    const currentYear = dayjs().year();

    test('should accept dates from January to October of current year', () => {
      for (let month = 0; month <= 9; month++) {
        const date = dayjs(`${currentYear}-${month + 1}-15`);
        expect(validatePotatoDate(date)).toBe(true);
      }
    });

    test('should reject dates from November and December', () => {
      expect(validatePotatoDate(dayjs(`${currentYear}-11-15`))).toBe(false);
      expect(validatePotatoDate(dayjs(`${currentYear}-12-15`))).toBe(false);
    });

    test('should reject dates from other years', () => {
      expect(validatePotatoDate(dayjs(`${currentYear - 1}-05-15`))).toBe(false);
      expect(validatePotatoDate(dayjs(`${currentYear + 1}-05-15`))).toBe(false);
    });
  });

  describe('calculatePotatoBill', () => {
    test('should calculate correct bill for start in January', () => {
      const result = calculatePotatoBill(
        10, // 10 sacks
        POTATO_RATE,
        new Date(2025, 0, 1) // January 1, 2025
      );
      expect(result.totalAmount).toBe(12000); // 10 sacks * 1200 PKR
    });

    test('should calculate same bill amount regardless of start date', () => {
      const januaryBill = calculatePotatoBill(
        5,
        POTATO_RATE,
        new Date(2025, 0, 15)
      );

      const octoberBill = calculatePotatoBill(
        5,
        POTATO_RATE,
        new Date(2025, 9, 15)
      );

      expect(januaryBill.totalAmount).toBe(octoberBill.totalAmount);
      expect(januaryBill.totalAmount).toBe(6000); // 5 sacks * 1200 PKR
    });

    test('should throw error for invalid storage period (November)', () => {
      expect(() => 
        calculatePotatoBill(
          5,
          POTATO_RATE,
          new Date(2025, 10, 1)
        )
      ).toThrow('Potato storage must start between January and October');
    });
  });
});


//========================== Apple Test Cases ==========================


describe('Apple Storage Billing Tests', () => {
  const APPLE_RATE = 100; // Example rate per crate per month

  describe('calculateAppleBill', () => {
    // Test Case 1: First month full payment regardless of start date
    test('should charge full amount for first month regardless of start date', () => {
      // Starting late in the month (28th)
      const lateBill = calculateAppleBill(
        10, // 10 crates
        APPLE_RATE,
        new Date(2025, 0, 28), // January 28
        new Date(2025, 0, 31)  // January 31
      );
      expect(lateBill.totalAmount).toBe(1000); // 10 crates * 100 PKR for first month

      // Starting early in the month (1st)
      const earlyBill = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2025, 0, 1), // January 1
        new Date(2025, 1, 1)  // February 1
      );
      expect(earlyBill.totalAmount).toBe(1000); // Should be same as late start
    });

    // Test Case 2: Second month billing rules (1-3 days exempt)
    test('should not charge for first 3 days of second month', () => {
      const result = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2025, 0, 1),  // January 1
        new Date(2025, 1, 3)   // February 3
      );
      expect(result.totalAmount).toBe(1000); // Only first month charge
    });

    // Test Case 3: Second month billing rules (4-18 days half rate)
    test('should charge half rate for days 4-18 of second month', () => {
      const result = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2025, 0, 1),  // January 1
        new Date(2025, 1, 15)  // February 15
      );
      expect(result.totalAmount).toBe(1500); // 1000 (first month) + 500 (half of second month)
    });

    // Test Case 4: Second month billing rules (19+ days full rate)
    test('should charge full rate after day 18 of second month', () => {
      const result = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2025, 0, 1),  // January 1
        new Date(2025, 1, 25)  // February 25
      );
      expect(result.totalAmount).toBe(2000); // 1000 (first month) + 1000 (full second month)
    });

    // Test Case 5: Multi-month storage
    test('should correctly calculate bills for multiple months', () => {
      const result = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2025, 0, 15),  // January 15
        new Date(2025, 3, 25)   // April 25
      );
      // Expected:
      // Jan (first month): 1000 (full)
      // Feb (complete): 1000 (full)
      // Mar (complete): 1000 (full)
      // Apr (past day 18): 1000 (full)
      expect(result.totalAmount).toBe(4000);
    });

    // Test Case 6: Edge case - same month withdrawal
    test('should charge full month even if withdrawn in same month', () => {
      const result = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2025, 0, 1),  // January 1
        new Date(2025, 0, 15)  // January 15
      );
      expect(result.totalAmount).toBe(1000); // Full first month
    });

    // Test Case 7: Edge case - month transitions
    test('should handle month transitions correctly', () => {
      const result = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2025, 0, 31),  // January 31
        new Date(2025, 1, 5)    // February 5
      );
      expect(result.totalAmount).toBe(1500); // 1000 (first month) + 500 (half rate for 4-5 Feb)
    });

    // Test Case 8: Edge case - leap year February
    test('should handle leap year February correctly', () => {
      const result = calculateAppleBill(
        10,
        APPLE_RATE,
        new Date(2024, 1, 1),   // February 1, 2024 (leap year)
        new Date(2024, 1, 29)   // February 29, 2024
      );
      expect(result.totalAmount).toBe(1000); // Full month charge
    });
  });
});