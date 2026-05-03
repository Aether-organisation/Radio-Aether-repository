package com.aether.RadioAether.model.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Payload received from the Odoo webhook for featured station approval/rejection.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OdooWebhookDTO {
    private String odooRequestId;
    private boolean approved;
}
