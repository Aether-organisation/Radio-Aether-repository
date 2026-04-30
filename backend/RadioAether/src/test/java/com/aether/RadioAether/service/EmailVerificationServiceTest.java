package com.aether.RadioAether.service;

import com.aether.RadioAether.model.entity.EmailVerificationCode;
import com.aether.RadioAether.repository.EmailVerificationCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link EmailVerificationService}.
 * Covers code generation, expiry, single-use enforcement,
 * and email dispatch.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    @Mock
    private EmailVerificationCodeRepository codeRepository;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailVerificationService emailVerificationService;

    @BeforeEach
    void setUp() {
        // Default expiry is 10 minutes (from @Value default); set it via reflection
        ReflectionTestUtils.setField(emailVerificationService, "expiryMinutes", 10);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // sendVerificationCode
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("sendVerificationCode: deletes any previous code before creating a new one")
    void sendVerificationCode_deletesOldCodeFirst() {
        emailVerificationService.sendVerificationCode("user@example.com");

        verify(codeRepository).deleteByEmail("user@example.com");
        verify(codeRepository).save(any(EmailVerificationCode.class));
        // Deletion must happen before save
        var inOrder = inOrder(codeRepository);
        inOrder.verify(codeRepository).deleteByEmail("user@example.com");
        inOrder.verify(codeRepository).save(any(EmailVerificationCode.class));
    }

    @Test
    @DisplayName("sendVerificationCode: persists a 6-digit numeric string code")
    void sendVerificationCode_generatesExactly6DigitCode() {
        emailVerificationService.sendVerificationCode("user@example.com");

        ArgumentCaptor<EmailVerificationCode> captor = ArgumentCaptor.forClass(EmailVerificationCode.class);
        verify(codeRepository).save(captor.capture());

        String code = captor.getValue().getCode();
        assertThat(code).hasSize(6);
        assertThat(code).matches("\\d{6}");
    }

    @Test
    @DisplayName("sendVerificationCode: code is saved as not-verified by default")
    void sendVerificationCode_savedAsNotVerified() {
        emailVerificationService.sendVerificationCode("user@example.com");

        ArgumentCaptor<EmailVerificationCode> captor = ArgumentCaptor.forClass(EmailVerificationCode.class);
        verify(codeRepository).save(captor.capture());

        assertThat(captor.getValue().isVerified()).isFalse();
    }

    @Test
    @DisplayName("sendVerificationCode: expiry is set to now + expiryMinutes")
    void sendVerificationCode_setsExpiryInFuture() {
        LocalDateTime before = LocalDateTime.now();
        emailVerificationService.sendVerificationCode("user@example.com");
        LocalDateTime after = LocalDateTime.now();

        ArgumentCaptor<EmailVerificationCode> captor = ArgumentCaptor.forClass(EmailVerificationCode.class);
        verify(codeRepository).save(captor.capture());

        LocalDateTime expiresAt = captor.getValue().getExpiresAt();
        assertThat(expiresAt).isAfter(before.plusMinutes(9));
        assertThat(expiresAt).isBefore(after.plusMinutes(11));
    }

    @Test
    @DisplayName("sendVerificationCode: sends an email to the provided address")
    void sendVerificationCode_sendsEmailToUser() {
        emailVerificationService.sendVerificationCode("user@example.com");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertThat(message.getTo()).containsExactly("user@example.com");
    }

    @Test
    @DisplayName("sendVerificationCode: email body contains the generated code")
    void sendVerificationCode_emailBodyContainsCode() {
        emailVerificationService.sendVerificationCode("user@example.com");

        ArgumentCaptor<EmailVerificationCode> codeCaptor = ArgumentCaptor.forClass(EmailVerificationCode.class);
        verify(codeRepository).save(codeCaptor.capture());
        String savedCode = codeCaptor.getValue().getCode();

        ArgumentCaptor<SimpleMailMessage> mailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(mailCaptor.capture());

        assertThat(mailCaptor.getValue().getText()).contains(savedCode);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // verifyCode
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("verifyCode: returns true for valid, unexpired, unused code")
    void verifyCode_returnsTrueForValidCode() {
        EmailVerificationCode entity = EmailVerificationCode.builder()
                .email("user@example.com")
                .code("123456")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .build();

        when(codeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(entity));
        when(codeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = emailVerificationService.verifyCode("user@example.com", "123456");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("verifyCode: marks the code as verified on success")
    void verifyCode_marksCodeAsVerifiedOnSuccess() {
        EmailVerificationCode entity = EmailVerificationCode.builder()
                .email("user@example.com")
                .code("123456")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .build();

        when(codeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(entity));
        when(codeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        emailVerificationService.verifyCode("user@example.com", "123456");

        ArgumentCaptor<EmailVerificationCode> captor = ArgumentCaptor.forClass(EmailVerificationCode.class);
        verify(codeRepository).save(captor.capture());
        assertThat(captor.getValue().isVerified()).isTrue();
    }

    @Test
    @DisplayName("verifyCode: returns false when no code exists for the email")
    void verifyCode_returnsFalseWhenNoCodeFound() {
        when(codeRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        boolean result = emailVerificationService.verifyCode("nobody@example.com", "123456");

        assertThat(result).isFalse();
        verify(codeRepository, never()).save(any());
    }

    @Test
    @DisplayName("verifyCode: returns false when code is already verified (used)")
    void verifyCode_returnsFalseWhenAlreadyVerified() {
        EmailVerificationCode entity = EmailVerificationCode.builder()
                .email("user@example.com")
                .code("123456")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verified(true)   // already used
                .build();

        when(codeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(entity));

        boolean result = emailVerificationService.verifyCode("user@example.com", "123456");

        assertThat(result).isFalse();
        verify(codeRepository, never()).save(any());
    }

    @Test
    @DisplayName("verifyCode: returns false when code has expired")
    void verifyCode_returnsFalseWhenExpired() {
        EmailVerificationCode entity = EmailVerificationCode.builder()
                .email("user@example.com")
                .code("123456")
                .expiresAt(LocalDateTime.now().minusMinutes(1))  // expired
                .verified(false)
                .build();

        when(codeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(entity));

        boolean result = emailVerificationService.verifyCode("user@example.com", "123456");

        assertThat(result).isFalse();
        verify(codeRepository, never()).save(any());
    }

    @Test
    @DisplayName("verifyCode: returns false when code does not match")
    void verifyCode_returnsFalseWhenCodeDoesNotMatch() {
        EmailVerificationCode entity = EmailVerificationCode.builder()
                .email("user@example.com")
                .code("123456")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .build();

        when(codeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(entity));

        boolean result = emailVerificationService.verifyCode("user@example.com", "999999");

        assertThat(result).isFalse();
        verify(codeRepository, never()).save(any());
    }

    @Test
    @DisplayName("verifyCode: expired and wrong code both fail — expiry is checked before code match")
    void verifyCode_expiredAndWrongCode_returnsFalse() {
        EmailVerificationCode entity = EmailVerificationCode.builder()
                .email("user@example.com")
                .code("123456")
                .expiresAt(LocalDateTime.now().minusMinutes(5)) // expired
                .verified(false)
                .build();

        when(codeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(entity));

        boolean result = emailVerificationService.verifyCode("user@example.com", "000000");

        assertThat(result).isFalse();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // deleteCode
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteCode: delegates to repository deleteByEmail")
    void deleteCode_callsRepositoryDelete() {
        emailVerificationService.deleteCode("user@example.com");

        verify(codeRepository).deleteByEmail("user@example.com");
    }
}
