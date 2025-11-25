package com.abrams.projectone;

import com.abrams.projectone.inventory.Inventory;
import com.abrams.projectone.inventory.InventoryRepository;
import com.abrams.projectone.inventory.InventoryService;
import com.abrams.projectone.product.Product;
import com.abrams.projectone.product.ProductRepository;
import com.abrams.projectone.warehouse.Warehouse;
import com.abrams.projectone.warehouse.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ProjectoneApplicationTests {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryService inventoryService;

    // --- SETUP: CLEAN SLATE BEFORE EVERY TEST ---
    @BeforeEach
    void setup() {
        // DELETE ORDER MATTERS!
        // We must delete the child (Inventory) before the parents (Warehouse/Product)
        // or the database will yell about Foreign Key constraints.
        inventoryRepository.deleteAllInBatch();
        productRepository.deleteAllInBatch();
        warehouseRepository.deleteAllInBatch();
    }

    // --- TEST 1: BASIC INVENTORY CREATION ---
    @Test
    void testCreateInventory_Success() {
        // 1. Setup Data
        Warehouse w = warehouseRepository.save(new Warehouse("Main", "NY", 100));
        Product p = productRepository.save(new Product("Widget", "SKU1"));

        // 2. Action
        Inventory i = new Inventory(w, p, 10, "Shelf A");
        Inventory saved = inventoryService.create(i);

        // 3. Verify
        assertNotNull(saved.getId());
        assertEquals(10, saved.getQuantity());
        assertEquals("Widget", saved.getProduct().getName()); // Checks your Product Fetch fix!
    }

    // --- TEST 2: DUPLICATE MERGE LOGIC ---
    @Test
    void testCreateInventory_MergeDuplicate() {
        Warehouse w = warehouseRepository.save(new Warehouse("Main", "NY", 100));
        Product p = productRepository.save(new Product("Widget", "SKU1"));

        // Add 10 items
        inventoryService.create(new Inventory(w, p, 10, "Shelf A"));

        // Add 5 MORE of the exact same item
        inventoryService.create(new Inventory(w, p, 5, "Shelf A"));

        // Verify we still only have 1 row, but with 15 items
        assertEquals(1, inventoryRepository.count());
        
        Inventory record = inventoryRepository.findByWarehouseIdAndProductId(w.getId(), p.getId()).get();
        assertEquals(15, record.getQuantity());
    }

    // --- TEST 3: CAPACITY CHECK (CREATE) ---
    @Test
    void testCapacityCheck_Create() {
        // Small Warehouse (Max 10)
        Warehouse w = warehouseRepository.save(new Warehouse("Small Box", "NY", 10));
        Product p = productRepository.save(new Product("Widget", "SKU1"));

        // Add 5 (Should work)
        inventoryService.create(new Inventory(w, p, 5, "A"));

        // Add 6 (5+6=11 > 10). Should Fail.
        Inventory overflowItem = new Inventory(w, p, 6, "A");
        
        Exception ex = assertThrows(RuntimeException.class, () -> {
            inventoryService.create(overflowItem);
        });

        assertTrue(ex.getMessage().contains("capacity exceeded"));
    }

    // --- TEST 4: CAPACITY CHECK (UPDATE) ---
    @Test
    void testCapacityCheck_Update() {
        Warehouse w = warehouseRepository.save(new Warehouse("Small Box", "NY", 10));
        Product p = productRepository.save(new Product("Widget", "SKU1"));

        // Start with 5
        Inventory inv = inventoryService.create(new Inventory(w, p, 5, "A"));

        // Try to update quantity to 11 (Exceeds 10)
        inv.setQuantity(11);

        Exception ex = assertThrows(RuntimeException.class, () -> {
            inventoryService.update(inv.getId(), inv);
        });

        assertTrue(ex.getMessage().contains("capacity exceeded"));
    }

    // --- TEST 5: MOVING ITEMS BETWEEN WAREHOUSES (UPDATE) ---
    @Test
    void testUpdate_MoveWarehouse() {
        Warehouse w1 = warehouseRepository.save(new Warehouse("Source", "NY", 100));
        Warehouse w2 = warehouseRepository.save(new Warehouse("Dest", "NJ", 100));
        Product p = productRepository.save(new Product("Widget", "SKU1"));

        // Start in W1
        Inventory inv = inventoryService.create(new Inventory(w1, p, 10, "A"));
        
        // Move to W2 using Update
        inv.setWarehouse(w2);
        Inventory updated = inventoryService.update(inv.getId(), inv);

        // Verify
        assertEquals(w2.getId(), updated.getWarehouse().getId());
        
        // Ensure database reflects the move
        assertEquals(0, inventoryRepository.getTotalQuantityInWarehouse(w1.getId()));
        assertEquals(10, inventoryRepository.getTotalQuantityInWarehouse(w2.getId()));
    }

    // --- TEST 6: TRANSFER INVENTORY SERVICE ---
    @Test
    void testTransferInventory_Success() {
        Warehouse source = warehouseRepository.save(new Warehouse("Source", "NY", 100));
        Warehouse dest = warehouseRepository.save(new Warehouse("Dest", "NJ", 100));
        Product p = productRepository.save(new Product("Widget", "SKU1"));

        // Stock Source with 50
        inventoryService.create(new Inventory(source, p, 50, "A"));

        // Transfer 20 to Dest
        inventoryService.transferInventory(source.getId(), dest.getId(), p.getId(), 20);

        // Verify Source (50 - 20 = 30)
        Inventory sourceInv = inventoryRepository.findByWarehouseIdAndProductId(source.getId(), p.getId()).get();
        assertEquals(30, sourceInv.getQuantity());

        // Verify Dest (0 + 20 = 20)
        Inventory destInv = inventoryRepository.findByWarehouseIdAndProductId(dest.getId(), p.getId()).get();
        assertEquals(20, destInv.getQuantity());
    }

    // --- TEST 7: TRANSFER FAIL (DEST FULL) ---
    @Test
    void testTransferInventory_DestCapacityExceeded() {
        Warehouse source = warehouseRepository.save(new Warehouse("Source", "NY", 100));
        Warehouse dest = warehouseRepository.save(new Warehouse("Tiny Dest", "NJ", 10)); // Max 10
        Product p = productRepository.save(new Product("Widget", "SKU1"));

        inventoryService.create(new Inventory(source, p, 50, "A"));

        // Try to transfer 20 (Dest only holds 10)
        Exception ex = assertThrows(RuntimeException.class, () -> {
            inventoryService.transferInventory(source.getId(), dest.getId(), p.getId(), 20);
        });

        assertTrue(ex.getMessage().contains("capacity exceeded"));
    }
}