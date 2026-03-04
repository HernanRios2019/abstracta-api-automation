// api/PetStoreApi.js

/**
 * Clase controladora para interactuar con la API de PetStore.
 * Sigue la convención PascalCase para el nombre de la clase y el archivo.
 */
class PetStoreApi {
    /**
     * @param {import('@playwright/test').APIRequestContext} request 
     */
    constructor(request) {
        this.request = request;
        this.baseUrl = 'https://petstore.swagger.io/v2';
    }

    /**
     * Crea una nueva mascota en la tienda.
     * @param {Object} petData - Objeto que debe seguir el esquema de Swagger (id, category, name, etc.)
     */
    async createPet(petData) {
        return await this.request.post(`${this.baseUrl}/pet`, {
            data: petData
        });
    }

    /**
     * Busca mascotas por su estado.
     * @param {string} status - Estados válidos: available, pending, sold.
     */
    async getPetsByStatus(status) {
        return await this.request.get(`${this.baseUrl}/pet/findByStatus`, {
            params: { status: status }
        });
    }

    /**
     * Crea una orden de compra para una mascota específica.
     * @param {number} petId - ID de la mascota existente.
     */
    async placeOrder(petId, orderId) {
        return await this.request.post(`${this.baseUrl}/store/order`, {
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
     * Elimina una mascota por su ID. 
     * Útil para limpieza de datos (Cleanup).
     * @param {number} petId 
     */
    async deletePet(petId) {
        return await this.request.delete(`${this.baseUrl}/pet/${petId}`);
    }
}

// Exportación nombrada en PascalCase para consistencia en los tests
module.exports = { PetStoreApi };