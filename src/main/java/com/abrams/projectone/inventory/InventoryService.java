package com.abrams.projectone.inventory;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

import com.abrams.projectone.product.Product;
import com.abrams.projectone.product.ProductRepository;
import com.abrams.projectone.warehouse.Warehouse;
import com.abrams.projectone.warehouse.WarehouseRepository; 

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository, WarehouseRepository warehouseRepository, ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    public List<Inventory> getAll() {
        return inventoryRepository.findAll();
    }

    public Inventory create(Inventory inventory) {
        // 1. FETCH FULL WAREHOUSE DATA (Existing logic)
        Long warehouseId = inventory.getWarehouse().getId();
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        inventory.setWarehouse(warehouse);

        // 2. FETCH FULL PRODUCT DATA (New Logic!)
        // This ensures the return object has Name/SKU, not just an ID.
        Long productId = inventory.getProduct().getId();
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        inventory.setProduct(product);

        // 3. CAPACITY CHECK (Existing logic)
        Integer maxCapacity = warehouse.getMaxCapacity();
        Integer currentLoad = inventoryRepository.getTotalQuantityInWarehouse(warehouseId);
        
        if (currentLoad + inventory.getQuantity() > maxCapacity) {
             throw new RuntimeException("Warehouse capacity exceeded!");
        }

        // 4. DUPLICATE CHECK (Existing logic)
        Optional<Inventory> existingInventory = 
            inventoryRepository.findByWarehouseIdAndProductId(warehouseId, productId);

        if (existingInventory.isPresent()) {
            Inventory existing = existingInventory.get();
            existing.setQuantity(existing.getQuantity() + inventory.getQuantity());
            return inventoryRepository.save(existing);
        } else {
            return inventoryRepository.save(inventory);
        }
    }

    public Inventory getById(Long id) {
        return inventoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory record not found!"));
    }

    public Inventory update(Long id, Inventory updatedInventory) {
        Inventory existing = inventoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory record not found!"));

        if (updatedInventory.getWarehouse() != null && updatedInventory.getWarehouse().getId() != null) {
            Warehouse warehouse = warehouseRepository.findById(updatedInventory.getWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
            existing.setWarehouse(warehouse);
        }

        if (updatedInventory.getProduct() != null && updatedInventory.getProduct().getId() != null) {
            Product product = productRepository.findById(updatedInventory.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
            existing.setProduct(product);
        }

        if (updatedInventory.getQuantity() != null) {
            existing.setQuantity(updatedInventory.getQuantity());
        }
        
        if (updatedInventory.getStorageLocation() != null) {
             existing.setStorageLocation(updatedInventory.getStorageLocation());
        }

        return inventoryRepository.save(existing);
    }

   @Transactional
    public void transferInventory(Long sourceWarehouseId, Long destWarehouseId, Long productId, int amount) {
        
        if (amount <= 0) {
            throw new RuntimeException("Transfer amount must be positive.");
        }
        if (sourceWarehouseId.equals(destWarehouseId)) {
            throw new RuntimeException("Source and destination warehouses cannot be the same.");
        }

        // 2. RETRIEVE SOURCE INVENTORY
        Inventory sourceInventory = inventoryRepository.findByWarehouseIdAndProductId(sourceWarehouseId, productId)
                .orElseThrow(() -> new RuntimeException("Product not found in source warehouse."));

        // 3. CHECK SOURCE AVAILABILITY
        if (sourceInventory.getQuantity() < amount) {
            throw new RuntimeException("Insufficient stock in source warehouse. Available: " 
                                       + sourceInventory.getQuantity());
        }

        // 4. RETRIEVE DESTINATION WAREHOUSE (Needed for Capacity Check)
        Warehouse destWarehouse = warehouseRepository.findById(destWarehouseId)
             .orElseThrow(() -> new RuntimeException("Destination warehouse not found."));

        // 5. CHECK DESTINATION CAPACITY
        // Calculate current load (handles nulls by returning 0)
        Integer currentDestLoad = inventoryRepository.getTotalQuantityInWarehouse(destWarehouseId);
        
        if (currentDestLoad + amount > destWarehouse.getMaxCapacity()) {
             throw new RuntimeException("Transfer failed: Destination warehouse capacity exceeded!");
        }

        // 6. PERFORM THE TRANSFER
        
        // Deduct from Source
        sourceInventory.setQuantity(sourceInventory.getQuantity() - amount);
        inventoryRepository.save(sourceInventory);

        // Add to Destination
        Optional<Inventory> destInventoryOpt = 
            inventoryRepository.findByWarehouseIdAndProductId(destWarehouseId, productId);

        if (destInventoryOpt.isPresent()) {
            // Update existing record
            Inventory destInventory = destInventoryOpt.get();
            destInventory.setQuantity(destInventory.getQuantity() + amount);
            inventoryRepository.save(destInventory);
        } else {
            // Create new record if it doesn't exist
            Inventory newInventory = new Inventory(destWarehouse, sourceInventory.getProduct(), amount, "Transferred");
            inventoryRepository.save(newInventory);
        }
    }
}