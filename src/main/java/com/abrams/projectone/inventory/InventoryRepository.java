package com.abrams.projectone.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // FIX 1: Use explicit query to ensure we find the record by the nested IDs
    @Query("SELECT i FROM Inventory i WHERE i.warehouse.id = :warehouseId AND i.product.id = :productId")
    Optional<Inventory> findByWarehouseIdAndProductId(Long warehouseId, Long productId);

    // FIX 2: Return Long (because SQL SUM returns Long/BigInt)
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i WHERE i.warehouse.id = :warehouseId")
    Long getTotalQuantityInWarehouse(Long warehouseId);
}