package com.aether.RadioAether.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
     * Entity representing an email verification code.
     *
     * @author prorix
     * @author mahoramas
     * @version 1.0.0
     */
@Entity
@Table(name = "EMAIL_VERIFICATION_CODES")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /** Whether this slot has already been used to complete a registration */
    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;
}
