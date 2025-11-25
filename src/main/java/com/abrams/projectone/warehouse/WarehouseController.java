package com.abrams.projectone.warehouse;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    public List<Warehouse> getAll() {
        return warehouseService.getAll();
    }

    @PostMapping
    public Warehouse create(@RequestBody Warehouse warehouse) {
        return warehouseService.create(warehouse);
    }

    @GetMapping("/{id}")
    public Warehouse getById(@PathVariable Long id) {
        return warehouseService.getById(id);
    }
    
    // Update
    @PutMapping("/{id}")
    public Warehouse update(@PathVariable Long id, @Valid @RequestBody Warehouse warehouse) {
        return warehouseService.update(id, warehouse);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        warehouseService.delete(id);
    }

}
