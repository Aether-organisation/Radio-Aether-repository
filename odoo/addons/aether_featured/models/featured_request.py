import logging
import requests
from odoo import models, fields, api

_logger = logging.getLogger(__name__)

class FeaturedRequest(models.Model):
    _name = 'aether.featured.request'
    _description = 'Featured Station Request'

    station_name = fields.Char(string='Station Name', required=True)
    stream_url = fields.Char(string='Stream URL', required=True)
    logo_url = fields.Char(string='Logo URL')
    genre = fields.Char(string='Genre')
    duration_days = fields.Integer(string='Duration (Days)', default=7)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], string='State', default='draft', required=True, tracking=True)
    odoo_request_id = fields.Char(string='Request ID (UUID)', required=True)

    def action_approve(self):
        for record in self:
            record.state = 'approved'
            webhook_url = 'http://backend:8080/api/featured/webhook'
            payload = {
                'odooRequestId': record.odoo_request_id,
                'approved': True
            }
            try:
                response = requests.post(webhook_url, json=payload, timeout=5)
                response.raise_for_status()
            except Exception as e:
                _logger.error(f"Failed to trigger webhook for {record.station_name}: {str(e)}")

    def action_reject(self):
        for record in self:
            record.state = 'rejected'
            webhook_url = 'http://backend:8080/api/featured/webhook'
            payload = {
                'odooRequestId': record.odoo_request_id,
                'approved': False
            }
            try:
                requests.post(webhook_url, json=payload, timeout=5)
            except Exception as e:
                _logger.error(f"Failed to trigger webhook for {record.station_name}: {str(e)}")

    def action_reset_draft(self):
        for record in self:
            record.state = 'draft'
