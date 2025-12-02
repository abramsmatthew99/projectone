import { useState } from 'react';

/**
 * A custom hook to manage CRUD form state and logic.
 * * @param {Object} initialState - The initial state of the form fields (e.g., { name: '', location: '' })
 * @param {Function} createAction - The API function to create an item
 * @param {Function} updateAction - The API function to update an item
 * @param {Function} onSuccess - Callback function to run after a successful submission (e.g., reloading the list)
 */
const useCrudForm = (initialState, createAction, updateAction, onSuccess) => {
    const [formData, setFormData] = useState(initialState);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Open the modal for creating a new item
    const openCreateModal = () => {
        setFormData(initialState);
        setEditingId(null);
        setShowModal(true);
    };

    // Open the modal for editing an existing item
    const openEditModal = (item) => {
        //Right now, I'm assuming that the fields match the items perfectly. 
        setFormData(item); 
        setEditingId(item.id);
        setShowModal(true);
    };

    // Close the modal and reset form
    const closeModal = () => {
        setFormData(initialState);
        setEditingId(null);
        setShowModal(false);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAction(editingId, formData);
                alert("Item Updated Successfully!");
            } else {
                await createAction(formData);
                alert("Item Created Successfully!");
            }
            closeModal();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to submit form.");
        }
    };

    return {
        formData,
        editingId,
        showModal,
        handleInputChange,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit,
        setFormData 
    };
};

export default useCrudForm;