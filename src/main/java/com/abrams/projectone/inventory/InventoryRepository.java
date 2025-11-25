package com.abrams.projectone.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository; // Optional but good practice
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    
    Optional<Inventory> findByWarehouseIdAndProductId(Long warehouseId, Long productId);

    // Calculates the total number of items in a specific warehouse
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i WHERE i.warehouse.id = :warehouseId")
    Integer getTotalQuantityInWarehouse(Long warehouseId);
}