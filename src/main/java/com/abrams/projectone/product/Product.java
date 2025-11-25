package com.abrams.projectone.product;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name="products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="product_id")
    private Long id;

    @Column(nullable=false)
    @NotBlank(message = "Product name is required")
    private String name;

    @Column(nullable=false)
    @NotBlank(message = "SKU is required")
    private String sku;

    @Column
    @Size(max=256, message = "Description cannot exceed 500 characters")
    private String description;

    public Product() {}

    public Product(String name, String sku) {
        this.name = name;
        this.sku = sku;
    }

    public Product(String name, String sku, String description) {
        this.name = name;
        this.sku = sku;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    

}