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

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional // Ensures the database rolls back after every test
class ProjectoneApplicationTests {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryService inventoryService;

    @BeforeEach
    void setup() {
        // Cleaning up in this specific order avoids Foreign Key constraints
        inventoryRepository.deleteAllInBatch();
        productRepository.deleteAllInBatch();
        warehouseRepository.deleteAllInBatch();
    }

    @Test
    void testCreateInventory_Success() {
        // Use saveAndFlush so the ID exists in the DB before the Service looks for it
        Warehouse w = warehouseRepository.saveAndFlush(new Warehouse("Main", "NY", 100));
        Product p = productRepository.saveAndFlush(new Product("Widget", "SKU1"));

        Inventory i = new Inventory(w, p, 10, "Shelf A");
        Inventory saved = inventoryService.create(i);

        assertNotNull(saved.getId());
        assertEquals(10, saved.getQuantity());
        assertEquals("Widget", saved.getProduct().getName());
    }

    @Test
    void testCreateInventory_MergeDuplicate() {
        Warehouse w = warehouseRepository.saveAndFlush(new Warehouse("Main", "NY", 100));
        Product p = productRepository.saveAndFlush(new Product("Widget", "SKU1"));

        // Add 10 items
        inventoryService.create(new Inventory(w, p, 10, "Shelf A"));
        
        // FLUSH to ensure the first insert is visible to the duplicate check query
        inventoryRepository.flush(); 

        // Add 5 MORE of the exact same item
        inventoryService.create(new Inventory(w, p, 5, "Shelf A"));

        // Verify we still only have 1 row, but with 15 items
        assertEquals(1, inventoryRepository.count());
        
        // Find by ID to verify quantity
        Inventory record = inventoryRepository.findAll().get(0);
        assertEquals(15, record.getQuantity());
    }

    @Test
    void testCapacityCheck_Create() {
        Warehouse w = warehouseRepository.saveAndFlush(new Warehouse("Small Box", "NY", 10));
        Product p = productRepository.saveAndFlush(new Product("Widget", "SKU1"));

        // Add 5 (Should work)
        inventoryService.create(new Inventory(w, p, 5, "A"));
        inventoryRepository.flush(); 

        // Add 6 (5+6=11 > 10). Should Fail.
        Inventory overflowItem = new Inventory(w, p, 6, "A");
        
        Exception ex = assertThrows(RuntimeException.class, () -> {
            inventoryService.create(overflowItem);
        });

        assertTrue(ex.getMessage().contains("capacity exceeded"));
    }

    @Test
    void testCapacityCheck_Update() {
        Warehouse w = warehouseRepository.saveAndFlush(new Warehouse("Small Box", "NY", 10));
        Product p = productRepository.saveAndFlush(new Product("Widget", "SKU1"));

        // Start with 5
        Inventory inv = inventoryService.create(new Inventory(w, p, 5, "A"));
        inventoryRepository.flush();

        // FIX: Create a NEW object to represent the "incoming request"
        // This simulates the JSON data coming from React
        Inventory updateRequest = new Inventory();
        updateRequest.setQuantity(11); // We want to change quantity to 11
        updateRequest.setWarehouse(w); 
        updateRequest.setProduct(p);
        updateRequest.setStorageLocation("A");

        Exception ex = assertThrows(RuntimeException.class, () -> {
            // Pass the ID of the existing item, but the NEW object as the update data
            inventoryService.update(inv.getId(), updateRequest);
        });

        assertTrue(ex.getMessage().contains("capacity exceeded"));
    }

    @Test
    void testUpdate_MoveWarehouse() {
        Warehouse w1 = warehouseRepository.saveAndFlush(new Warehouse("Source", "NY", 100));
        Warehouse w2 = warehouseRepository.saveAndFlush(new Warehouse("Dest", "NJ", 100));
        Product p = productRepository.saveAndFlush(new Product("Widget", "SKU1"));

        // Start in W1
        Inventory inv = inventoryService.create(new Inventory(w1, p, 10, "A"));
        inventoryRepository.flush();
        
        // Move to W2 using Update
        inv.setWarehouse(w2);
        Inventory updated = inventoryService.update(inv.getId(), inv);

        // Verify ID updated
        assertEquals(w2.getId(), updated.getWarehouse().getId());
        
        // Verify Quantities
        assertEquals(0, inventoryRepository.getTotalQuantityInWarehouse(w1.getId()));
        assertEquals(10, inventoryRepository.getTotalQuantityInWarehouse(w2.getId()));
    }

    @Test
    void testTransferInventory_Success() {
        Warehouse source = warehouseRepository.saveAndFlush(new Warehouse("Source", "NY", 100));
        Warehouse dest = warehouseRepository.saveAndFlush(new Warehouse("Dest", "NJ", 100));
        Product p = productRepository.saveAndFlush(new Product("Widget", "SKU1"));

        // Stock Source with 50
        inventoryService.create(new Inventory(source, p, 50, "A"));
        inventoryRepository.flush();

        // Transfer 20 to Dest
        inventoryService.transferInventory(source.getId(), dest.getId(), p.getId(), 20);
        inventoryRepository.flush();

        // Verify Source (50 - 20 = 30)
        // Note: We use findAll() or specific queries to fetch fresh data
        Long sourceQty = inventoryRepository.getTotalQuantityInWarehouse(source.getId());
        assertEquals(30, sourceQty);

        // Verify Dest (0 + 20 = 20)
        Long destQty = inventoryRepository.getTotalQuantityInWarehouse(dest.getId());
        assertEquals(20, destQty);
    }

    @Test
    void testTransferInventory_DestCapacityExceeded() {
        Warehouse source = warehouseRepository.saveAndFlush(new Warehouse("Source", "NY", 100));
        Warehouse dest = warehouseRepository.saveAndFlush(new Warehouse("Tiny Dest", "NJ", 10)); // Max 10
        Product p = productRepository.saveAndFlush(new Product("Widget", "SKU1"));

        inventoryService.create(new Inventory(source, p, 50, "A"));
        inventoryRepository.flush();

        // Try to transfer 20 (Dest only holds 10)
        Exception ex = assertThrows(RuntimeException.class, () -> {
            inventoryService.transferInventory(source.getId(), dest.getId(), p.getId(), 20);
        });

        assertTrue(ex.getMessage().contains("capacity exceeded"));
    }
}