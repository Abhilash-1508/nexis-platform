package com.recommerce.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:mock-cloud}") String cloudName,
            @Value("${cloudinary.api-key:mock-key}") String apiKey,
            @Value("${cloudinary.api-secret:mock-secret}") String apiSecret) {
        
        // If keys are not provided, we initialize it but it won't work perfectly until keys are set.
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String uploadImage(MultipartFile file) throws IOException {
        try {
            // Check if mock keys are still in use
            if (cloudinary.config.apiKey.equals("mock-key")) {
                throw new IllegalStateException("Cloudinary keys not configured.");
            }
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("url").toString();
        } catch (Exception e) {
            throw new IOException("Failed to upload to Cloudinary: " + e.getMessage());
        }
    }
}
