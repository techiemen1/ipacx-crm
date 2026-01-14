# Module Guide: Inventory & Manufacturing

## Overview
Tracks goods from procurement to production to sale. Supports multiple warehouses and batch tracking.

## 1. Inventory Management

### Items
- **Stockable**: Items that are counted (Raw Materials, Finished Goods).
- **Service**: Items that are not counted (Consulting Hours).
- **Batch Tracking**: Enable this to track Expiry Dates and Manufacturing Dates per lot.

### Warehouses
- Create a hierarchy: `Main Factory` -> `Store Room A` -> `Rack 1`.
- **Stock Transfer**: Move items between warehouses using a Stock Journal.

## 2. Manufacturing (Production)

### Bill of Materials (BOM)
A "Recipe".
- **Input**: 100g Flour (RM) + 50g Sugar (RM).
- **Output**: 1 Cake (FG).
- **Overheads**: Labor Cost, Electricity.

### Production Process
1.  **Raise Production Order**: "Make 50 Cakes".
2.  **Issue Material**: Stock moves from `Store` to `Shop Floor`.
3.  **Finish Production**: Stock of RM decreases, Stock of FG increases.
4.  **Costing**: Weighted Average Cost of RM is added to the Cost of FG.

## 3. Stock Reports
- **Stock Balance**: Qty currently in hand.
- **Stock Ledger**: History of every movement.
- **Aging Analysis**: How long items have been sitting in stock.
