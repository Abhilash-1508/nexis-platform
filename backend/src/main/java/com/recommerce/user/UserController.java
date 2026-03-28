package com.recommerce.user;

import com.recommerce.security.jwt.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allow frontend access
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private com.recommerce.notification.EmailNotificationService notificationService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${admin.mobile-phone:+910000000000}")
    private String adminMobilePhone;

    @jakarta.annotation.PostConstruct
    public void seedAdmin() {
        User adminUser = userRepository.findByPhoneNumber("admin");
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setPhoneNumber("admin");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setName("System Admin");
            adminUser.setRole(Role.SUPER_ADMIN);
        } else {
            adminUser.setPassword(passwordEncoder.encode("admin123"));
        }
        adminUser.setEmail("gogle6pro@gmail.com");
        // Set admin's real mobile phone for SMS notifications (E.164 format)
        if (adminUser.getMobilePhone() == null || adminUser.getMobilePhone().isBlank()) {
            adminUser.setMobilePhone(adminMobilePhone);
        }
        userRepository.save(adminUser);
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody User user) {
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()) != null) {
            return ResponseEntity.badRequest().build();
        }
        // Basic check for email as well
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            user.setEmail(user.getPhoneNumber() + "@nexis.local"); // Fallback for prototype
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        // Generate token for immediate use after registration
        String jwt = tokenProvider.generateToken(savedUser.getPhoneNumber(), "ROLE_" + savedUser.getRole().name());
        savedUser.setToken(jwt);
        
        // Trigger Welcome Notifications
        try {
            String welcomeMsg = "Welcome to Nexis, " + savedUser.getName() + "! Your account has been successfully created. Explore the next-gen tech marketplace now.";
            if (savedUser.getEmail() != null && savedUser.getEmail().contains("@")) {
                notificationService.sendHtmlEmail(savedUser.getEmail(), "Welcome to Nexis!",
                    "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>" +
                    "<h2 style='color: #4f46e5;'>Welcome to Nexis, " + savedUser.getName() + "!</h2>" +
                    "<p>Your account has been created successfully. You can now start buying and selling premium tech goods.</p>" +
                    "<a href='http://localhost:3000' style='display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;'>Explore Marketplace</a>" +
                    "</div>");
            }
            // Use mobilePhone field for SMS — phoneNumber is the login username, not a real phone
            String smsPhone = savedUser.getMobilePhone();
            if (smsPhone != null && !smsPhone.isBlank()) {
                notificationService.sendSms(smsPhone, welcomeMsg);
            }
        } catch (Exception e) {
            System.err.println("Registration notification failed: " + e.getMessage());
        }

        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User loginRequest) {
        User user = userRepository.findByPhoneNumber(loginRequest.getPhoneNumber());
        if (user != null && loginRequest.getPassword() != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            if (user.isSuspended() || user.isDeleted()) {
                return ResponseEntity.status(403).build(); // Forbidden due to moderation
            }
            String jwt = tokenProvider.generateToken(user.getPhoneNumber(), "ROLE_" + user.getRole().name());
            user.setToken(jwt);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedData) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setName(updatedData.getName());
                    user.setEmail(updatedData.getEmail());
                    user.setPhoneNumber(updatedData.getPhoneNumber());
                    user.setAddress(updatedData.getAddress());
                    if (updatedData.getMobilePhone() != null && !updatedData.getMobilePhone().isBlank()) {
                        user.setMobilePhone(updatedData.getMobilePhone());
                    }
                    if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(updatedData.getPassword()));
                    }
                    User saved = userRepository.save(user);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
