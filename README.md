# Storage Management System Updates

## Changes Implemented

1. **Separate Views for Apple and Potato Storage**
   - Created separate views for apple and potato storage records
   - Apple storage records include truck/container number
   - Potato storage records exclude truck/container number field
   - Each view shows only relevant records by type

2. **Export Functionality**
   - Export button now exports only the records for the current view (apple or potato)
   - Export format remains consistent with the existing CSV format

3. **Withdrawal History Access**
   - Added Withdrawal History section in the main menu
   - Accessible via the "Withdrawal History" menu item
   - Shows complete withdrawal history for both storage types

4. **Menu Structure**
   - Updated main menu to include separate sections for:
     - Apple Storage
     - Potato Storage
     - Withdrawal History
     - Completed Storage

## Important Notes

1. **Calculations**
   - All billing calculations remain unchanged
   - Apple storage: Monthly rate calculations based on entry date
   - Potato storage: Fixed rate per sack

2. **Data Separation**
   - Storage records are now filtered by type in their respective views
   - Export functionality is type-specific
   - Withdrawal history shows all records but includes storage type information

3. **User Interface**
   - Consistent interface design across all views
   - Type-specific fields shown/hidden as appropriate (e.g., truck number for apples only)
   - Clear labeling of storage types in all views