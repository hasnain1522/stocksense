from odoo import api, models, _
from odoo.exceptions import ValidationError


class StockMove(models.Model):
    _inherit = "stock.move"

    @api.constrains(
        "product_uom_qty",
        "location_id",
        "location_dest_id",
        "picking_type_id",
        "state",
    )
    def _check_stocksense_move_integrity(self):
        for move in self:
            if move.product_uom_qty < 0:
                raise ValidationError(_("A stock movement quantity cannot be negative."))
            if move.state == "done" and (not move.location_id or not move.location_dest_id):
                raise ValidationError(
                    _("A completed stock movement must have source and destination locations.")
                )
            if (
                move.picking_type_id.code == "internal"
                and move.location_id
                and move.location_dest_id
                and move.location_id == move.location_dest_id
            ):
                raise ValidationError(
                    _("An internal transfer must use different source and destination locations.")
                )
