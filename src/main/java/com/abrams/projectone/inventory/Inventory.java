package com.abrams.projectone.inventory;

import com.abrams.projectone.product.Product;
import com.abrams.projectone.warehouse.Warehouse;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


@Entity
@Table(name="inventory")
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="inventory_id")
    private Long id;

    //Foreign key time! Yippee
    @ManyToOne
    @JoinColumn(name="warehouse_id", nullable=false)
    @NotNull(message = "Warehouse is required")
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name="product_id", nullable=false)
    @NotNull(message = "Product is required")
    private Product product;

    @Column(nullable=false)
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Column(name="storage_location")
    @NotBlank(message = "Storage location is required")
    private String storageLocation;

    public Inventory() {}

    public Inventory(Warehouse warehouse, Product product, int quantity, String storageLocation) {
        this.warehouse = warehouse;
        this.product = product;
        this.quantity = quantity;
        this.storageLocation = storageLocation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    
}
