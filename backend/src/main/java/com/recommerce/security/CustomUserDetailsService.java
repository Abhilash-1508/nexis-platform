package com.recommerce.security;

import com.recommerce.user.User;
import com.recommerce.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        // MVP uses phoneNumber conceptually as a unique identifier instead of email for user retrieval
        User user = userRepository.findByPhoneNumber(phoneNumber);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with phone number : " + phoneNumber);
        }

        if (user.isSuspended()) {
            throw new RuntimeException("Account is suspended.");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getPhoneNumber(),
                user.getPassword() != null ? user.getPassword() : "", // fallback for previous plain users
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
