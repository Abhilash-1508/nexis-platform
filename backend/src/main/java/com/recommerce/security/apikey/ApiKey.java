package com.recommerce.security.apikey;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_keys")
public class ApiKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String hashedKeyValue; 
    
    private String serviceName;
    private boolean isActive = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    public ApiKey() {}

    public ApiKey(String hashedKeyValue, String serviceName) {
        this.hashedKeyValue = hashedKeyValue;
        this.serviceName = serviceName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHashedKeyValue() { return hashedKeyValue; }
    public void setHashedKeyValue(String hashedKeyValue) { this.hashedKeyValue = hashedKeyValue; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
