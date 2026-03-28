package com.recommerce.product;

import com.recommerce.notification.EmailNotificationService;
import com.recommerce.payment.PaymentMethod;
import com.recommerce.payment.PaymentService;
import com.recommerce.user.User;
import com.recommerce.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import com.fasterxml.jackson.annotation.JsonProperty;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    public static class CartCheckoutRequest {
        @NotEmpty(message = "Cart cannot be empty")
        private List<Long> productIds;
        
        @NotBlank(message = "Address is mandatory")
        @JsonProperty("address")
        private String address;
        
        @NotBlank(message = "Phone is mandatory")
        @JsonProperty("phone")
        private String phone;

        @NotBlank(message = "Payment method is mandatory")
        @JsonProperty("paymentMethod")
        private String paymentMethod;

        private String paymentTransactionId;

        public CartCheckoutRequest() {}

        public List<Long> getProductIds() { return productIds; }
        public void setProductIds(List<Long> productIds) { this.productIds = productIds; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getPaymentTransactionId() { return paymentTransactionId; }
        public void setPaymentTransactionId(String paymentTransactionId) { this.paymentTransactionId = paymentTransactionId; }
    }

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailNotificationService notificationService;

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    @org.springframework.transaction.annotation.Transactional("productTransactionManager")
    public ResponseEntity<?> createOrder(@RequestBody Order order, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        
        User currentUser = userRepository.findByPhoneNumber(principal.getName());
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        order.setBuyerId(currentUser.getId());

        Product product = productRepository.findById(order.getItemId()).orElse(null);
        if (product == null) return ResponseEntity.badRequest().body(Map.of("message", "Product not found."));
        
        if (product.getStockQuantity() != null && product.getStockQuantity() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product is out of stock."));
        }

        order.setTotalPrice(product.getPrice() != null ? product.getPrice() : 0.0);
        if (order.getQuantity() == null) order.setQuantity(1);
        if (order.getServiceType() == null) order.setServiceType("PRODUCT_PURCHASE");
        if (order.getStatus() == null) order.setStatus("CONFIRMED");
        
        Order savedOrder = orderRepository.save(order);
        
        // Record payment for audit
        try {
            PaymentMethod methodEnum = PaymentMethod.CARD;
            try {
                methodEnum = PaymentMethod.valueOf(order.getPaymentMethod());
            } catch (Exception e) {}
            
            com.recommerce.payment.Payment p = paymentService.recordPayment(
                savedOrder.getId(), 
                order.getTotalPrice(), 
                methodEnum, 
                order.getPaymentTransactionId() != null ? order.getPaymentTransactionId() : "Internal"
            );
            paymentService.markSuccess(p.getId());
        } catch (Exception e) {}

        // Decrement stock
        if (product.getStockQuantity() != null) {
            product.setStockQuantity(product.getStockQuantity() - order.getQuantity());
            productRepository.save(product);
        }

        // SMS Notification
        try {
            String msg = "Order Confirmed: You purchased " + product.getName() + " for ₹" + savedOrder.getTotalPrice() + ". Order ID: #" + savedOrder.getId() + ". Track at: nexis.tech/track";
            notificationService.sendSms(order.getPhone(), msg);
        } catch (Exception e) {}

        return ResponseEntity.ok(savedOrder);
    }

    @PostMapping("/checkout-cart")
    @org.springframework.transaction.annotation.Transactional("productTransactionManager")
    public ResponseEntity<?> checkoutCart(@Valid @RequestBody CartCheckoutRequest request, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        User currentUser = userRepository.findByPhoneNumber(principal.getName());
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "User not found"));

        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cart is empty."));
        }

        double totalCost = 0.0;
        List<Order> savedOrders = new ArrayList<>();
        StringBuilder itemsPurchased = new StringBuilder();

        for (Long productId : request.getProductIds()) {
            Product product = productRepository.findById(productId).orElse(null);
            if (product == null || (product.getStockQuantity() != null && product.getStockQuantity() <= 0)) continue;

            Order order = new Order();
            order.setBuyerId(currentUser.getId());
            order.setItemId(productId);
            order.setTotalPrice(product.getPrice());
            order.setAddress(request.getAddress());
            order.setPhone(request.getPhone());
            order.setPaymentMethod(request.getPaymentMethod());
            order.setPaymentTransactionId(request.getPaymentTransactionId());
            order.setQuantity(1);
            order.setServiceType("CART_PURCHASE");
            order.setStatus("CONFIRMED");
            
            Order savedOrder = orderRepository.save(order);
            savedOrders.add(savedOrder);
            totalCost += product.getPrice();
            itemsPurchased.append(product.getName()).append(", ");

            // Decrement stock
            if (product.getStockQuantity() != null) {
                product.setStockQuantity(product.getStockQuantity() - 1);
                productRepository.save(product);
            }
        }

        if (savedOrders.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Items out of stock."));
        }

        // SMS Notification
        try {
            String msg = "Nexis: Bulk Order Confirmed! Total: ₹" + totalCost + ". items: " + itemsPurchased.toString() + ". Order ID: #" + savedOrders.get(0).getId();
            notificationService.sendSms(request.getPhone(), msg);
        } catch (Exception e) {}

        return ResponseEntity.ok(savedOrders);
    }

    @GetMapping("/user/{buyerId}")
    public ResponseEntity<List<Order>> getOrdersByBuyer(@PathVariable Long buyerId) {
        return ResponseEntity.ok(orderRepository.findByBuyerId(buyerId));
    }
}
