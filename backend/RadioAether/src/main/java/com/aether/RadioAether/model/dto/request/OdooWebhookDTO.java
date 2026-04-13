package com.aether.RadioAether.model.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OdooWebhookDTO {
    private String odooRequestId;
    private boolean approved;
}
