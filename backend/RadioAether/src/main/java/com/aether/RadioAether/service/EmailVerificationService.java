package com.aether.RadioAether.service;

import com.aether.RadioAether.model.entity.EmailVerificationCode;
import com.aether.RadioAether.repository.EmailVerificationCodeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationCodeRepository codeRepository;
    private final JavaMailSender mailSender;

    @Value("${app.verification.expiry-minutes:10}")
    private int expiryMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generates a 6-digit code, persists it (replacing any previous one for the
     * same email) and sends it to the user's inbox.
     */
    @Transactional
    public void sendVerificationCode(String email) {
        // Remove any previous pending code for this address
        codeRepository.deleteByEmail(email);

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        EmailVerificationCode entity = EmailVerificationCode.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .verified(false)
                .build();

        codeRepository.save(entity);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("radioaetherorg@gmail.com");
        message.setTo(email);
        message.setSubject("Tu código de verificación de Aether");
        message.setText(
                "¡Bienvenido a Aether!\n\n" +
                "Tu código de verificación es:\n\n" +
                "  " + code + "\n\n" +
                "Este código es válido durante " + expiryMinutes + " minutos.\n" +
                "Si no has solicitado este código, ignora este mensaje.\n\n" +
                "— El equipo de Aether"
        );

        mailSender.send(message);
    }

    /**
     * Returns true if the supplied code is valid and not expired for the given
     * email. On success, marks the slot as verified so it cannot be reused.
     */
    @Transactional
    public boolean verifyCode(String email, String code) {
        return codeRepository.findByEmail(email)
                .filter(e -> !e.isVerified())
                .filter(e -> e.getExpiresAt().isAfter(LocalDateTime.now()))
                .filter(e -> e.getCode().equals(code))
                .map(e -> {
                    e.setVerified(true);
                    codeRepository.save(e);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Cleans up the verification slot after registration is complete.
     */
    @Transactional
    public void deleteCode(String email) {
        codeRepository.deleteByEmail(email);
    }
}
