package com.abrams.projectone.warehouse;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public List<Warehouse> getAll() {
        return warehouseRepository.findAll();
    }

    public Warehouse create(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public Warehouse getById(Long id) {
        return warehouseRepository.findById(id).orElseThrow(() ->
            new RuntimeException("Warehouse not found!")
        );
    }

    
    public Warehouse update(Long id, Warehouse updatedWarehouse) {
        Warehouse existing = warehouseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Warehouse not found!"));

        existing.setName(updatedWarehouse.getName());
        existing.setLocation(updatedWarehouse.getLocation());
        existing.setMaxCapacity(updatedWarehouse.getMaxCapacity());

        return warehouseRepository.save(existing);
    }

    // Delete a warehouse
    public void delete(Long id) {
        Warehouse existing = warehouseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Warehouse not found!"));

        warehouseRepository.delete(existing);
    }

}