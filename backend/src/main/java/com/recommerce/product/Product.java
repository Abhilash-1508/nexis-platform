package com.recommerce.product;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sellerId; // References User ID in the other DB

    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double price;
    
    @Column(name = "item_condition") // 'condition' is a reserved keyword in some DBs
    private String condition;
    
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String category;
    private String conditionGrade;
    private Integer warrantyMonths;
    private String inspectionStatus;
    private String accessoriesIncluded;
    private Integer stockQuantity;
    private LocalDateTime reservedUntil;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getConditionGrade() { return conditionGrade; }
    public void setConditionGrade(String conditionGrade) { this.conditionGrade = conditionGrade; }

    public Integer getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(Integer warrantyMonths) { this.warrantyMonths = warrantyMonths; }

    public String getInspectionStatus() { return inspectionStatus; }
    public void setInspectionStatus(String inspectionStatus) { this.inspectionStatus = inspectionStatus; }

    public String getAccessoriesIncluded() { return accessoriesIncluded; }
    public void setAccessoriesIncluded(String accessoriesIncluded) { this.accessoriesIncluded = accessoriesIncluded; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public LocalDateTime getReservedUntil() { return reservedUntil; }
    public void setReservedUntil(LocalDateTime reservedUntil) { this.reservedUntil = reservedUntil; }
}
