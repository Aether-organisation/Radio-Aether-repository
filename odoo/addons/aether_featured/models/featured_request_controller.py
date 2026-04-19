import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)

class AetherFeaturedController(http.Controller):
    """
    HTTP endpoint que recibe solicitudes de emisoras destacadas
    enviadas desde el backend de Spring Boot.
    Ruta: POST /aether/create_request
    """

    @http.route('/aether/create_request', type='json', auth='none', methods=['POST'], csrf=False)
    def create_request(self, **kwargs):
        try:
            station_name  = kwargs.get('stationName')
            stream_url    = kwargs.get('streamUrl')
            logo_url      = kwargs.get('logoUrl', '')
            genre         = kwargs.get('genre', '')
            request_id    = kwargs.get('requestId')

            if not station_name or not stream_url or not request_id:
                _logger.warning(f"[Aether] Petición incompleta. Recibido: {kwargs}")
                return {'success': False, 'error': 'Missing required fields: stationName, streamUrl, requestId'}

            env = request.env['aether.featured.request'].sudo()
            record = env.create({
                'station_name':    station_name,
                'stream_url':      stream_url,
                'logo_url':        logo_url,
                'genre':           genre,
                'odoo_request_id': request_id,
                'state':           'draft',
            })

            _logger.info(f"[Aether] Creada solicitud de destacado #{record.id} para: {station_name}")
            return {'success': True, 'odoo_record_id': record.id}

        except Exception as e:
            _logger.error(f"[Aether] Error al crear solicitud: {str(e)}")
            return {'success': False, 'error': str(e)}
