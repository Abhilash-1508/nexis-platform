package com.recommerce.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerId(Long buyerId);
    List<Order> findByItemId(Long itemId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o WHERE o.status = 'COMPLETED'")
    Double sumCompletedOrderTotals();
}
