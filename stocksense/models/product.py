from odoo import api, models, _
from odoo.exceptions import ValidationError


class ProductProduct(models.Model):
    _inherit = "product.product"

    @api.constrains("default_code")
    def _check_stocksense_default_code_unique(self):
        """Keep populated SKUs unique so operational references are unambiguous."""
        for product in self:
            if not product.default_code:
                continue
            duplicate = self.with_context(active_test=False).search(
                [
                    ("default_code", "=", product.default_code),
                    ("id", "!=", product.id),
                ],
                limit=1,
            )
            if duplicate:
                raise ValidationError(
                    _("Internal Reference (SKU) must be unique. '%s' is already used.")
                    % product.default_code
                )
