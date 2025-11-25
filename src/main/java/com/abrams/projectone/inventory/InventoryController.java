package com.abrams.projectone.inventory;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<Inventory> getAll() {
        return inventoryService.getAll();
    }

    @PostMapping
    public Inventory create(@RequestBody Inventory inventory) {
        return inventoryService.create(inventory);
    }

    @GetMapping("/{id}")
    public Inventory getById(@PathVariable Long id) {
        return inventoryService.getById(id);
    }

    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @Valid @RequestBody Inventory inventory) {
        return inventoryService.update(id, inventory);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inventoryService.delete(id);
    }

    @PostMapping("/transfer")
    public String transferInventory(@RequestBody TransferRequest request) {
        inventoryService.transferInventory(
            request.sourceWarehouseId, 
            request.destWarehouseId, 
            request.productId, 
            request.amount
        );
        return "Transfer successful!";
    }

    public static class TransferRequest {
        public Long sourceWarehouseId;
        public Long destWarehouseId;
        public Long productId;
        public int amount;
    }

}
