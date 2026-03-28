package com.recommerce.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    private String name;
    
    @NotBlank(message = "Phone number cannot be empty")
    @Column(unique = true)
    private String phoneNumber;

    // Separate real mobile number used for SMS notifications (E.164 format, e.g. +919876543210)
    private String mobilePhone;

    @Email(message = "Must be a valid email address")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password cannot be empty")
    private String password; // Simplistic for prototype
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.BUYER;

    private boolean isSuspended = false;
    private boolean isDeleted = false;

    private String address;

    @Transient
    private String token;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getMobilePhone() { return mobilePhone; }
    public void setMobilePhone(String mobilePhone) { this.mobilePhone = mobilePhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isSuspended() { return isSuspended; }
    public void setSuspended(boolean suspended) { isSuspended = suspended; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { this.isDeleted = deleted; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
