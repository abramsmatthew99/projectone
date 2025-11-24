package com.abrams.projectone.entity;

import jakarta.persistence.*;


@Entity
@Table(name="warehouses")
public class Warehouse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(name = "maxCapacity", nullable = false)
    private Integer maxCapacity;

    public Warehouse() {}

    public Warehouse(String name, String location, Integer maxCapacity) {
        this.name = name;
        this.location = location; 
        this.maxCapacity = maxCapacity;
    }
}
