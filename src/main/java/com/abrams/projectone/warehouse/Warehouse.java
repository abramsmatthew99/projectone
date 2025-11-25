package com.abrams.projectone.warehouse;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


@Entity
@Table(name="warehouses")
public class Warehouse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="warehouse_id")
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Warehouse name is required")
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "Location is required")
    private String location;

    @Column(name = "max_capacity", nullable = false)
    @NotNull(message = "Max capacity is required")
    @Min(value = 1, message = "Max capacity must be at least 1")
    private Integer maxCapacity;

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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    

    public Warehouse() {}

    public Warehouse(String name, String location, Integer maxCapacity) {
        this.name = name;
        this.location = location; 
        this.maxCapacity = maxCapacity;
    }
}
