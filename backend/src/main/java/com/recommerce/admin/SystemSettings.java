package com.recommerce.admin;

import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSettings {
    
    @Id
    private String settingKey;
    
    @Column(nullable = false)
    private String settingValue;

    @Column(nullable = false)
    private String description;

    public SystemSettings() {}

    public SystemSettings(String settingKey, String settingValue, String description) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.description = description;
    }

    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }

    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String settingValue) { this.settingValue = settingValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
