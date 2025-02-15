// import { render, fireEvent, screen } from '@testing-library/react';
// import { calculateBilling } from '../utils/billingCalculator'; // Assuming this is where your billing logic lives
// import test, { describe } from 'node:test';

// describe('Storage Billing Calculations', () => {
//   describe('Apple Storage Billing', () => {
//     // Test case for peak season (September-November)
//     test('should calculate correct billing for apples during peak season', () => {
//       const appleStorage = {
//         type: 'apple',
//         quantity: 100, // 100 crates
//         startDate: new Date('2023-09-15'),
//         withdrawals: []
//       };

//       const result = calculateBilling(appleStorage);
//       expect(result.totalAmount).toBe(8000); // Assuming 80 Rs per crate in peak season
//     });

//     // Test case for off-peak season (December-August)
//     test('should calculate correct billing for apples during off-peak season', () => {
//       const appleStorage = {
//         type: 'apple',
//         quantity: 100,
//         startDate: new Date('2023-08-15'),
//         withdrawals: []
//       };

//       const result = calculateBilling(appleStorage);
//       expect(result.totalAmount).toBe(6000); // Assuming 60 Rs per crate in off-peak
//     });

//     // Test case for partial withdrawal
//     test('should calculate correct billing for apples with partial withdrawal', () => {
//       const appleStorage = {
//         type: 'apple',
//         quantity: 100,
//         startDate: new Date('2023-09-15'),
//         withdrawals: [
//           {
//             date: new Date('2023-10-15'),
//             quantity: 40
//           }
//         ]
//       };

//       const result = calculateBilling(appleStorage);
//       // First month full quantity (100 crates) + Second month partial quantity (60 crates)
//       expect(result.totalAmount).toBe(12800); // (100 * 80) + (60 * 80)
//     });

//     // Test case for multiple withdrawals
//     test('should calculate correct billing for apples with multiple withdrawals', () => {
//       const appleStorage = {
//         type: 'apple',
//         quantity: 100,
//         startDate: new Date('2023-09-15'),
//         withdrawals: [
//           {
//             date: new Date('2023-10-15'),
//             quantity: 30
//           },
//           {
//             date: new Date('2023-11-15'),
//             quantity: 40
//           }
//         ]
//       };

//       const result = calculateBilling(appleStorage);
//       expect(result.totalAmount).toBe(17600); // Complex calculation based on remaining quantity
//     });

//     // Test case for season transition
//     test('should handle billing correctly when storage period crosses seasons', () => {
//       const appleStorage = {
//         type: 'apple',
//         quantity: 100,
//         startDate: new Date('2023-11-15'),
//         withdrawals: [
//           {
//             date: new Date('2023-12-15'),
//             quantity: 50
//           }
//         ]
//       };

//       const result = calculateBilling(appleStorage);
//       // November (peak) + December (off-peak) with different rates
//       expect(result.totalAmount).toBe(11000); // (100 * 80) + (50 * 60)
//     });
//   });

//   describe('Potato Storage Billing', () => {
//     // Test case for standard potato storage
//     test('should calculate correct billing for potatoes', () => {
//       const potatoStorage = {
//         type: 'potato',
//         quantity: 100, // 100 sacks
//         startDate: new Date('2023-09-15'),
//         withdrawals: []
//       };

//       const result = calculateBilling(potatoStorage);
//       expect(result.totalAmount).toBe(5000); // Assuming 50 Rs per sack
//     });

//     // Test case for potato storage with partial withdrawal
//     test('should calculate correct billing for potatoes with partial withdrawal', () => {
//       const potatoStorage = {
//         type: 'potato',
//         quantity: 100,
//         startDate: new Date('2023-09-15'),
//         withdrawals: [
//           {
//             date: new Date('2023-10-15'),
//             quantity: 40
//           }
//         ]
//       };

//       const result = calculateBilling(potatoStorage);
//       expect(result.totalAmount).toBe(8000); // (100 * 50) + (60 * 50)
//     });

//     // Test case for minimum quantity
//     test('should handle minimum quantity requirement for potatoes', () => {
//       const potatoStorage = {
//         type: 'potato',
//         quantity: 5, // Below minimum requirement
//         startDate: new Date('2023-09-15'),
//         withdrawals: []
//       };

//       expect(() => calculateBilling(potatoStorage)).toThrow('Minimum quantity requirement not met');
//     });
//   });

//   // Edge Cases and Validation Tests
//   describe('Edge Cases and Validation', () => {
//     test('should throw error for invalid storage type', () => {
//       const invalidStorage = {
//         type: 'orange',
//         quantity: 100,
//         startDate: new Date('2023-09-15'),
//         withdrawals: []
//       };

//       expect(() => calculateBilling(invalidStorage)).toThrow('Invalid storage type');
//     });

//     test('should throw error for negative quantity', () => {
//       const invalidStorage = {
//         type: 'apple',
//         quantity: -10,
//         startDate: new Date('2023-09-15'),
//         withdrawals: []
//       };

//       expect(() => calculateBilling(invalidStorage)).toThrow('Invalid quantity');
//     });

//     test('should throw error for withdrawal quantity exceeding available quantity', () => {
//       const invalidStorage = {
//         type: 'apple',
//         quantity: 100,
//         startDate: new Date('2023-09-15'),
//         withdrawals: [
//           {
//             date: new Date('2023-10-15'),
//             quantity: 150
//           }
//         ]
//       };

//       expect(() => calculateBilling(invalidStorage)).toThrow('Withdrawal quantity exceeds available storage');
//     });
//   });
// });
