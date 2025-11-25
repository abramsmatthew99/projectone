package com.abrams.projectone.product;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found!"));
    }

    public Product update(Long id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found!"));

        existing.setName(updatedProduct.getName());
        existing.setSku(updatedProduct.getSku());
        existing.setDescription(updatedProduct.getDescription());

        return productRepository.save(existing);
    }

    public void delete(Long id) {
        Product existing = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found!"));

        productRepository.delete(existing);
    }

}
