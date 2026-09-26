# StockSense

StockSense is an Odoo inventory foundation for the hackathon. It uses Odoo's stock engine so on-hand quantities, reservations, and completed operations remain governed by native inventory workflows.

## Architecture

Install the `stocksense` add-on from an Odoo addons path. It depends on Odoo's `stock` module and extends `product.product` and `stock.move`. Products, categories, warehouses, locations, receipts, deliveries, transfers, adjustments, and reordering rules remain native Odoo records (`stock.warehouse.orderpoint` for reorder rules). The stock move ledger supplies product, quantity, unit, source, destination, operation/picking reference, date, status, and responsible user through native fields and relations.

The module adds StockSense Warehouse Staff and Inventory Manager groups, based on Odoo's stock user and stock manager permissions. Assign users to the appropriate group in Odoo's user access settings.

## Development and installation

- Keep stock-changing operations in Odoo's inventory workflow; do not directly modify quant quantities.
- Use native Odoo inventory models before adding custom records.
- Add-on path must include the repository root (the directory containing `stocksense/`).
- Install with `odoo -d <database> -i stocksense --stop-after-init`; update with `-u stocksense`.

The repository does not pin an Odoo release or include an Odoo runtime/configuration. Check the target server's supported API before deployment.
