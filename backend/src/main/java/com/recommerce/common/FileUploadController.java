package com.recommerce.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final Path uploadRoot = Paths.get("uploads");
    private final CloudinaryService cloudinaryService;

    public FileUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping
    public ResponseEntity<java.util.Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "File is empty"));
        }

        try {
            // Attempt Cloudinary Upload First
            try {
                String cloudinaryUrl = cloudinaryService.uploadImage(file);
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("url", cloudinaryUrl);
                return ResponseEntity.ok(response);
            } catch (IllegalStateException e) {
                // Fallback to local storage if Cloudinary is not configured
                System.out.println("Cloudinary not configured. Falling back to local storage.");
            }

            // Local Upload Fallback
            if (!Files.exists(uploadRoot)) {
                Files.createDirectories(uploadRoot);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;
            Path targetPath = uploadRoot.resolve(newFilename);

            Files.copy(file.getInputStream(), targetPath);

            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("url", "http://localhost:8080/uploads/" + newFilename);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}
