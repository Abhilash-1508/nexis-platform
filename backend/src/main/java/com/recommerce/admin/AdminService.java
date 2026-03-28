package com.recommerce.admin;

import com.recommerce.user.User;
import com.recommerce.user.UserRepository;
import com.recommerce.product.ProductRepository;
import com.recommerce.product.OrderRepository;
import com.recommerce.product.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SystemSettingsRepository settingsRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public java.util.List<com.recommerce.product.Product> getAllProducts() {
        return productRepository.findAll();
    }

    public AdminDashboardStatsDTO compilePlatformStatistics() {
        long totalUsers = userRepository.count();
        long suspendedUsers = userRepository.countByIsSuspendedTrue();
        long totalProducts = productRepository.count();
        long activeListings = productRepository.countByStockQuantityGreaterThan(0);
        
        Double revenue = orderRepository.sumCompletedOrderTotals();
        double totalRevenue = (revenue != null) ? revenue : 0.0;

        return new AdminDashboardStatsDTO(totalUsers, totalProducts, totalRevenue, activeListings, suspendedUsers);
    }

    @Transactional
    public void suspendUser(Long targetUserId, String currentAdminPhoneNumber) {
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        if (target.getPhoneNumber() != null && target.getPhoneNumber().equalsIgnoreCase(currentAdminPhoneNumber)) {
            throw new RuntimeException("Critical: Admins cannot suspend themselves.");
        }
        
        target.setSuspended(true);
        userRepository.save(target);
        productRepository.pauseListingsBySellerId(targetUserId); 
    }

    @Transactional
    public void deleteUser(Long targetUserId, String currentAdminPhoneNumber) {
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        if (target.getPhoneNumber() != null && target.getPhoneNumber().equalsIgnoreCase(currentAdminPhoneNumber)) {
            throw new RuntimeException("Critical: Admins cannot delete themselves.");
        }
        
        productRepository.pauseListingsBySellerId(targetUserId);
        userRepository.delete(target); // Hard Delete
    }

    @Transactional
    public void editUser(Long targetUserId, User updatedData, String currentAdminPhoneNumber) {
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        if (target.getPhoneNumber() != null && target.getPhoneNumber().equalsIgnoreCase(currentAdminPhoneNumber)) {
            if (updatedData.getRole() != null && updatedData.getRole() != target.getRole()) {
                throw new RuntimeException("Critical: Admins cannot demote or change their own role.");
            }
        }
        
        if (updatedData.getName() != null && !updatedData.getName().isEmpty()) {
            target.setName(updatedData.getName());
        }
        if (updatedData.getEmail() != null && !updatedData.getEmail().isEmpty()) {
            target.setEmail(updatedData.getEmail());
        }
        if (updatedData.getPhoneNumber() != null && !updatedData.getPhoneNumber().isEmpty()) {
            target.setPhoneNumber(updatedData.getPhoneNumber());
        }
        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            // Because BCrypt hashes are length 60 starting with $2a$, don't inadvertently double-hash if UI sends back same hash!
            if (!updatedData.getPassword().startsWith("$2a$")) {
                target.setPassword(passwordEncoder.encode(updatedData.getPassword()));
            }
        }
        userRepository.save(target);
    }

    public void removeProductFlagged(Long id) {
        productRepository.deleteById(id);
    }

    @Transactional
    public void editProduct(Long productId, com.recommerce.product.Product updatedProduct) {
        com.recommerce.product.Product target = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found."));
        if(updatedProduct.getName() != null) target.setName(updatedProduct.getName());
        if(updatedProduct.getDescription() != null) target.setDescription(updatedProduct.getDescription());
        if(updatedProduct.getPrice() != null) target.setPrice(updatedProduct.getPrice());
        if(updatedProduct.getConditionGrade() != null) target.setConditionGrade(updatedProduct.getConditionGrade());
        if(updatedProduct.getCategory() != null) target.setCategory(updatedProduct.getCategory());
        if(updatedProduct.getWarrantyMonths() != null) target.setWarrantyMonths(updatedProduct.getWarrantyMonths());
        if(updatedProduct.getAccessoriesIncluded() != null) target.setAccessoriesIncluded(updatedProduct.getAccessoriesIncluded());
        if(updatedProduct.getStockQuantity() != null) target.setStockQuantity(updatedProduct.getStockQuantity());
        if(updatedProduct.getImageUrl() != null) target.setImageUrl(updatedProduct.getImageUrl());
        productRepository.save(target);
    }

    public void overrideOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    @Transactional
    public void cleanupAllNonAdminUsers() {
        userRepository.findAll().stream()
            .filter(u -> !"admin".equals(u.getPhoneNumber()))
            .forEach(userRepository::delete);
    }

    // SYSTEM SETTINGS LAYER
    public java.util.List<SystemSettings> getSystemSettings() {
        java.util.List<SystemSettings> current = settingsRepository.findAll();
        if (current.isEmpty()) {
            // Seed defaults
            settingsRepository.save(new SystemSettings("PAYMENT_ENABLED", "true", "Enable or disable global payment gateway"));
            settingsRepository.save(new SystemSettings("SMS_ALERTS_ENABLED", "true", "Enable outgoing SMS notifications via Twilio"));
            settingsRepository.save(new SystemSettings("MAINTENANCE_MODE", "false", "Shutdown public storefront accessibility"));
            return settingsRepository.findAll();
        }
        return current;
    }

    @Transactional
    public void updateSetting(String key, String value) {
        SystemSettings setting = settingsRepository.findById(key)
            .orElseThrow(() -> new RuntimeException("Protocol Setting not found: " + key));
        setting.setSettingValue(value);
        settingsRepository.save(setting);
    }

    // ADMINISTRATIVE REPORTING
    public String generateFullSystemReportCSV() {
        StringBuilder csv = new StringBuilder();
        csv.append("Type,ID,Title/Name,Value/Price,Status\n");
        
        userRepository.findAll().forEach(u -> 
            csv.append(String.format("\"USER\",\"%d\",\"%s\",\"%s\",\"%s\"\n", 
                u.getId(), quote(u.getName()), quote(u.getEmail()), u.isSuspended() ? "SUSPENDED" : "ACTIVE"))
        );
        
        productRepository.findAll().forEach(p -> 
            csv.append(String.format("\"PRODUCT\",\"%d\",\"%s\",\"%.2f\",\"%d remaining\"\n", 
                p.getId(), quote(p.getName()), p.getPrice(), p.getStockQuantity()))
        );
        
        orderRepository.findAll().forEach(o -> 
            csv.append(String.format("\"ORDER\",\"%d\",\"Order_Ref\",\"%.2f\",\"%s\"\n", 
                o.getId(), o.getTotalPrice(), o.getStatus()))
        );
        
        return csv.toString();
    }

    private String quote(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }
}
