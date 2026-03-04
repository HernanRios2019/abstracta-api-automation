// api/PetStoreApi.js

/**
 * Controller class to interact with the PetStore API.
 * Follows PascalCase convention for class name and file.
 */
class PetStoreApi {
    /**
     * @param {import('@playwright/test').APIRequestContext} request 
     */
    constructor(request) {
        this.request = request;
    }

    /**
     * Creates a new pet in the store.
     * @param {Object} petData - Object that must follow the Swagger schema (id, category, name, etc.)
     */
    async createPet(petData) {
        return await this.request.post('pet', {
            data: petData
        });
    }

    /**
     * Finds pets by status.
     * @param {string} status - Valid states: available, pending, sold.
     */
    async getPetsByStatus(status) {
        return await this.request.get('pet/findByStatus', {
            params: { status: status }
        });
    }

    /**
     * Creates a purchase order for a specific pet.
     * @param {number} petId - ID of the existing pet.
     */
    async placeOrder(petId, orderId) {
        return await this.request.post('store/order', {
            data: {
                id: orderId, // ID entero entre 1 y 10
                petId: petId,
                quantity: 1,
                shipDate: new Date().toISOString(),
                status: 'placed',
                complete: true
            }
        });
    }

    /**
     * Deletes a pet by its ID. 
     * Useful for data cleanup.
     * @param {number} petId 
     */
    async deletePet(petId) {
        return await this.request.delete(`pet/${petId}`);
    }

    async deleteOrder(orderId) {
        return await this.request.delete(`store/order/${orderId}`);
    }
}

// Named export in PascalCase for consistency in tests
module.exports = { PetStoreApi };