package com.recommerce.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final com.recommerce.product.OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository, com.recommerce.product.OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional("productTransactionManager")
    public Payment recordPayment(Long orderId, Double amount, PaymentMethod method, String transactionId) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(transactionId);
        return paymentRepository.save(payment);
    }

    @Transactional("productTransactionManager")
    public void markSuccess(Long paymentId) {
        Payment p = paymentRepository.findById(paymentId).orElseThrow(() -> new RuntimeException("Payment not found"));
        p.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(p);
        
        // Update order status
        com.recommerce.product.Order order = orderRepository.findById(p.getOrderId()).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus("COMPLETED");
        orderRepository.save(order);
    }

    @Transactional("productTransactionManager")
    public void markFailed(Long paymentId) {
        Payment p = paymentRepository.findById(paymentId).orElseThrow(() -> new RuntimeException("Payment not found"));
        p.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(p);
    }
}
