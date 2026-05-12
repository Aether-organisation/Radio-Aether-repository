package com.aether.RadioAether.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.aether.RadioAether.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Custom implementation of UserDetailsService to load users from database.
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads the {@link org.springframework.security.core.userdetails.UserDetails} for the
     * user identified by the given e-mail address.
     *
     * @param email the e-mail used as the authentication username
     * @return the matching {@link com.aether.RadioAether.model.entity.User} entity (which implements {@code UserDetails})
     * @throws UsernameNotFoundException if no user exists with the given e-mail
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
