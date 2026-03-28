package com.recommerce.security.apikey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApiKeyService {

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean isValidApiKey(String rawApiKey) {
        // In a real high-throughput system, checking BCrypt on every request is heavy.
        // It's better to cache successful authentications via Redis or an internal ConcurrentHashMap map
        // For MVP, we fetch all active keys and check. Or if using SHA-256 (preferred for API keys), 
        // we could just hash the raw and do a quick DB lookup.
        // For architectural safety, if using standard PasswordEncoder (BCrypt):
        List<ApiKey> activeKeys = apiKeyRepository.findAll().stream().filter(ApiKey::isActive).toList();
        for (ApiKey key : activeKeys) {
            if (passwordEncoder.matches(rawApiKey, key.getHashedKeyValue())) {
                return true;
            }
        }
        return false;
    }

    public String createApiKey(String rawKey, String serviceName) {
        String hashed = passwordEncoder.encode(rawKey);
        ApiKey key = new ApiKey(hashed, serviceName);
        apiKeyRepository.save(key);
        return hashed;
    }
}
