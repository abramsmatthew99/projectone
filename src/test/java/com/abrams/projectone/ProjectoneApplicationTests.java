package com.abrams.projectone;

import com.abrams.projectone.warehouse.Warehouse;
import com.abrams.projectone.warehouse.WarehouseRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.abrams.projectone.product.Product;
import com.abrams.projectone.product.ProductRepository;
import com.abrams.projectone.inventory.Inventory;
import com.abrams.projectone.inventory.InventoryRepository;
import com.abrams.projectone.inventory.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ProjectoneApplicationTests {

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
        inventoryRepository.deleteAllInBatch();
        warehouseRepository.deleteAllInBatch();
        productRepository.deleteAllInBatch();

    }

    @Test
    void testAddSingleWarehouse() {
        Warehouse warehouse = new Warehouse("Main Warehouse", "123 Main St", 100);
        Warehouse saved = warehouseRepository.save(warehouse);

        assertNotNull(saved.getId());
        assertEquals("Main Warehouse", saved.getName());
        assertEquals("123 Main St", saved.getLocation());
        assertEquals(100, saved.getMaxCapacity());
    }

    @Test
    void testAddSingleProduct() {
        Product product = new Product("Widget", "SKU123", "Sample widget");
        Product saved = productRepository.save(product);

        assertNotNull(saved.getId());
        assertEquals("Widget", saved.getName());
        assertEquals("SKU123", saved.getSku());
        assertEquals("Sample widget", saved.getDescription());
    }

    @Test
    void testAddSingleInventory() {
        Warehouse warehouse = warehouseRepository.saveAndFlush(new Warehouse("Main Warehouse", "123 Main St", 100));
        Product product = productRepository.saveAndFlush(new Product("Widget", "SKU123"));

        Inventory inventory = new Inventory(warehouse, product, 10, "A1");
        Inventory saved = inventoryService.create(inventory);

        assertNotNull(saved.getId());
        assertEquals(warehouse.getId(), saved.getWarehouse().getId());
        assertEquals(product.getId(), saved.getProduct().getId());
        assertEquals(10, saved.getQuantity());
        assertEquals("A1", saved.getStorageLocation());
    }

	@Test
    void testCapacityLimit() {
        // Create a warehouse with small capacity (e.g., 10)
        Warehouse warehouse = warehouseRepository.saveAndFlush(new Warehouse("Small Warehouse", "123 Main St", 10));
        Product product = productRepository.saveAndFlush(new Product("Widget", "SKU123"));

        // Add 5 items (Should work)
        inventoryService.create(new Inventory(warehouse, product, 5, "A1"));

        // Try to add 6 more (5 + 6 = 11 > 10). Should fail.
        Exception exception = assertThrows(RuntimeException.class, () -> {
            inventoryService.create(new Inventory(warehouse, product, 6, "A1"));
        });

        assertTrue(exception.getMessage().contains("Warehouse capacity exceeded"));
    }
}
