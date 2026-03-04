// tests/PetStore.spec.js
const { test, expect } = require('@playwright/test');
const { PetStoreApi } = require('../api/PetStoreApi');
const testData = require('../data/pets.json');
const fs = require('fs');

test.describe('PerfDog API Testing - Escenarios Completos', () => {
    let api;

    test.beforeEach(async ({ request }) => {
        api = new PetStoreApi(request);
    });

    //Clean up HOOK: It runs once at the end of all the tests in the file
    test.afterAll(async ({ request }) => {
        const cleanApi = new PetStoreApi(request);
        console.log('--- Iniciando limpieza de datos ---');

        // Pets clean up
        for (const pet of testData.petsToCreate) {
            const response = await cleanApi.deletePet(pet.id);
            if (response.ok()) {
                console.log(`Mascota eliminada: ${pet.name} (ID: ${pet.id})`);
            }
        }

        // Orders clean up
        for (let id = 1; id <= 5; id++) {
            const res = await cleanApi.deleteOrder(id);
            if (res.ok()) {
                console.log(`Orden eliminada con éxito: ID ${id}`);
            }
        }
    });

    test('Parte 1: Crear mascotas y validar códigos de respuesta', async () => {
        for (const pet of testData.petsToCreate) {
            await test.step(`Crear y validar mascota: ${pet.name}`, async () => {
                const response = await api.createPet(pet);

                // 1. Status code validation
                expect(response.status()).toBe(200);

                const responseBody = await response.json();

                // 2. Response body validation
                // Compare the main fields one by one
                expect(responseBody.id).toBe(pet.id);
                expect(responseBody.name).toBe(pet.name);
                expect(responseBody.status).toBe(pet.status);

                // 3. Nested objects validation (Category)
                expect(responseBody.category).toEqual(pet.category);

                // 4. Arrays validation (Tags)
                // Use toEqual to compare the complete content of the array/object
                expect(responseBody.tags).toEqual(pet.tags);

                // 5. Arrays validation (PhotoUrls)
                expect(responseBody.photoUrls).toEqual(pet.photoUrls);
            });
        }
        await test.step('Obtener detalles de mascota sold y validar integridad de datos (JSON vs API)', async () => {
            const responseSold = await api.getPetsByStatus('sold');
            expect(responseSold.status()).toBe(200);

            const soldPets = await responseSold.json();

            // 1. Extract the "sold" pet from our local JSON file
            const expectedPet = testData.petsToCreate.find(p => p.status === 'sold');

            // 2. Search for that specific pet in the API response by its ID
            const actualPet = soldPets.find(p => p.id === expectedPet.id);

            // 3. Validate that the pet exists in the API
            expect(actualPet, `La mascota con ID ${expectedPet.id} no se encontró en la API`).toBeDefined();

            // 4. Validate field by field the integrity of the data
            expect(actualPet.name).toBe(expectedPet.name);
            expect(actualPet.status).toBe(expectedPet.status);
            expect(actualPet.category.id).toBe(expectedPet.category.id);
            expect(actualPet.category.name).toBe(expectedPet.category.name);

            // Validate that the tags match (content comparison)
            expect(actualPet.tags).toContainEqual(expectedPet.tags[0]);
        });
    });

    test('Parte 2: Listar disponibles y crear órdenes', async () => {
        let selectedPets = [];

        // 1. List available pets and save 5 in a data structure
        await test.step('List available pets and select 5', async () => {
            const response = await api.getPetsByStatus('available');
            expect(response.status()).toBe(200);

            const availablePets = await response.json();

            // Save the first 5 in our data structure (selectedPets)
            selectedPets = availablePets.slice(0, 5);

            // --- DEBUGGING SECTION ---

            // 1. Show by console with detail (depth: null to see the whole object)
            console.log('--- DEBUG: selectedPets extracted ---');
            console.dir(selectedPets, { depth: null });

            // 2. Save in a JSON file for manual inspection
            const debugPath = './data/debug_selected_pets.json';
            fs.writeFileSync(debugPath, JSON.stringify(selectedPets, null, 2));
            console.log(`Debug file created at: ${debugPath}`);

            // ----------------------------

            // Validation of that we obtained the requested quantity
            expect(selectedPets.length).toBe(5);
        });

        // 2. Create an order for each of the 5 pets obtained
        // We use a counter to generate order IDs between 1 and 10
        let orderIdCounter = 1;

        for (const pet of selectedPets) {
            await test.step(`Create order ID: ${orderIdCounter} for pet ID: ${pet.id}`, async () => {

                // Call the API sending the pet ID and the generated order ID
                const orderResponse = await api.placeOrder(pet.id, orderIdCounter);

                expect(orderResponse.status()).toBe(200);

                const orderData = await orderResponse.json();

                // Integrity validations:
                expect(orderData.id).toBe(orderIdCounter); // Validate ID between 1 and 10
                expect(orderData.petId).toBe(pet.id);      // Validate that it is the correct pet
                expect(orderData.status).toBe('placed');
            });

            orderIdCounter++; // Increment for the next order
        }
    });
});