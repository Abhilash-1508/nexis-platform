package com.recommerce.product;

import com.recommerce.notification.EmailNotificationService;
import com.recommerce.user.User;
import com.recommerce.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Allow frontend access
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productRepository.save(product);

        if (product.getSellerId() != null) {
            userRepository.findById(product.getSellerId()).ifPresent(seller -> {
                // Email notification
                emailNotificationService.sendProductListedEmail(seller.getEmail(), savedProduct.getName());

                // SMS notification — use mobilePhone (phoneNumber is login username)
                if (seller.getMobilePhone() != null && !seller.getMobilePhone().isBlank()) {
                    String smsContent = "Nexis: Your item '" + savedProduct.getName() + "' is now LIVE on the marketplace!";
                    emailNotificationService.sendSms(seller.getMobilePhone(), smsContent);
                }
            });
        }

        return ResponseEntity.ok(savedProduct);
    }

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<Product>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Product> products = productRepository.searchProducts(
            (keyword != null && !keyword.isEmpty()) ? keyword : null,
            (category != null && !category.isEmpty()) ? category : null,
            (condition != null && !condition.isEmpty()) ? condition : null,
            pageable
        );
        
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User currentUser = userRepository.findByPhoneNumber(principal.getName());
        if (currentUser == null) return ResponseEntity.status(401).build();

        Product product = productRepository.findById(id).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();

        if (currentUser.getRole() == com.recommerce.user.Role.SUPER_ADMIN || currentUser.getId().equals(product.getSellerId())) {
            productRepository.delete(product);
            return ResponseEntity.ok("Product deleted.");
        }
        return ResponseEntity.status(403).body("Not authorized to delete this product.");
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<String> lockProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();

        if (product.getStockQuantity() != null && product.getStockQuantity() == 1) {
            if (product.getReservedUntil() != null && product.getReservedUntil().isAfter(java.time.LocalDateTime.now())) {
                return ResponseEntity.status(409).body("Product is already locked by another user.");
            }
            product.setReservedUntil(java.time.LocalDateTime.now().plusMinutes(10));
            productRepository.save(product);
            return ResponseEntity.ok("Product locked for 10 minutes.");
        }
        return ResponseEntity.ok("Stock > 1, no lock needed.");
    }
}
