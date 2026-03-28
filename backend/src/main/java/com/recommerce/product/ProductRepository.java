package com.recommerce.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);
    List<Product> findByCategoryIgnoreCase(String category);
    List<Product> findByConditionGrade(String conditionGrade);
    List<Product> findByNameContainingIgnoreCase(String keyword);

    long countByStockQuantityGreaterThan(Integer stock);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(cast(:keyword as string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:keyword as string), '%'))) AND " +
           "(cast(:category as string) IS NULL OR LOWER(p.category) = LOWER(cast(:category as string))) AND " +
           "(cast(:conditionGrade as string) IS NULL OR LOWER(p.conditionGrade) = LOWER(cast(:conditionGrade as string)))")
    Page<Product> searchProducts(@Param("keyword") String keyword, 
                                 @Param("category") String category, 
                                 @Param("conditionGrade") String conditionGrade, 
                                 Pageable pageable);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Product p SET p.stockQuantity = 0 WHERE p.sellerId = :sellerId")
    void pauseListingsBySellerId(@Param("sellerId") Long sellerId);
}
