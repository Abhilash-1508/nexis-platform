package com.recommerce.product;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam String code) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(code);
        
        if (couponOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Invalid or expired coupon code");
            return ResponseEntity.badRequest().body(err);
        }
        
        Coupon coupon = couponOpt.get();
        if (!coupon.getIsActive() || (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now()))) {
             Map<String, String> err = new HashMap<>();
             err.put("error", "This coupon has expired or is deactivated");
             return ResponseEntity.badRequest().body(err);
        }
        
        return ResponseEntity.ok(coupon);
    }
    
    // Developer helper to seed DB
    @PostMapping("/seed")
    public ResponseEntity<?> seedCoupons() {
        if (couponRepository.findByCodeIgnoreCase("WELCOME50").isEmpty()) {
            Coupon c = new Coupon();
            c.setCode("WELCOME50");
            c.setDiscountPercentage(50.0);
            c.setIsActive(true);
            couponRepository.save(c);
            
            Coupon c2 = new Coupon();
            c2.setCode("ECO20");
            c2.setDiscountPercentage(20.0);
            c2.setIsActive(true);
            couponRepository.save(c2);
        }
        return ResponseEntity.ok("Coupons seeded successfully");
    }
}
