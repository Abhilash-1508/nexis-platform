package com.recommerce.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") 
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<java.util.List<com.recommerce.user.User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/products")
    public ResponseEntity<java.util.List<com.recommerce.product.Product>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDTO> getPlatformStats() {
        return ResponseEntity.ok(adminService.compilePlatformStatistics());
    }

    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<String> suspendUser(@PathVariable Long id) {
        String currentAdminPhoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        adminService.suspendUser(id, currentAdminPhoneNumber);
        return ResponseEntity.ok("User suspended successfully.");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String currentAdminPhoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        adminService.deleteUser(id, currentAdminPhoneNumber);
        return ResponseEntity.ok("User soft-deleted successfully.");
    }

    @DeleteMapping("/users/cleanup")
    public ResponseEntity<String> cleanupUsers() {
        adminService.cleanupAllNonAdminUsers();
        return ResponseEntity.ok("All non-admin users have been removed.");
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> forceDeleteProduct(@PathVariable Long id) {
        adminService.removeProductFlagged(id);
        return ResponseEntity.ok("Product permanently removed.");
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<String> editProduct(@PathVariable Long id, @RequestBody com.recommerce.product.Product product) {
        adminService.editProduct(id, product);
        return ResponseEntity.ok("Product updated by Admin.");
    }
    @PutMapping("/users/{id}")
    public ResponseEntity<String> editUser(@PathVariable Long id, @RequestBody com.recommerce.user.User updatedUserData) {
        String currentAdminPhoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        adminService.editUser(id, updatedUserData, currentAdminPhoneNumber);
        return ResponseEntity.ok("User edited successfully.");
    }

    @PatchMapping("/orders/{id}/override")
    public ResponseEntity<String> overrideOrderStatus(@PathVariable Long id, @RequestParam String newStatus) {
        adminService.overrideOrderStatus(id, newStatus);
        return ResponseEntity.ok("Order status overridden by Admin.");
    }

    // SYSTEM SETTINGS
    @GetMapping("/settings")
    public ResponseEntity<java.util.List<SystemSettings>> getSettings() {
        return ResponseEntity.ok(adminService.getSystemSettings());
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<String> updateSetting(@PathVariable String key, @RequestBody java.util.Map<String, String> body) {
        adminService.updateSetting(key, body.get("value"));
        return ResponseEntity.ok("Protocol setting updated.");
    }

    // REPORTING
    @GetMapping("/report")
    public ResponseEntity<String> downloadPlatformReport() {
        String csv = adminService.generateFullSystemReportCSV();
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=nexis-platform-report.csv")
            .header("Content-Type", "text/csv")
            .body(csv);
    }
}
