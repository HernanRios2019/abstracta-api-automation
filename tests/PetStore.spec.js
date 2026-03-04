// tests/PetStore.spec.js
const { test, expect } = require('@playwright/test');
const { PetStoreApi } = require('../api/PetStoreApi');
const testData = require('../data/pets.json');
const fs = require('fs'); // Módulo para manejar archivos

test.describe('PerfDog API Testing - Escenarios Completos', () => {
    let api;

    test.beforeEach(async ({ request }) => {
        api = new PetStoreApi(request);
    });

    // HOOK DE LIMPIEZA: Se ejecuta una vez al finalizar todos los tests del archivo
    // test.afterAll(async ({ request }) => {
    //     const cleanApi = new PetStoreApi(request);
    //     console.log('--- Iniciando limpieza de datos ---');

    //     for (const pet of testData.petsToCreate) {
    //         const response = await cleanApi.deletePet(pet.id);
    //         if (response.ok()) {
    //             console.log(`Mascota eliminada: ${pet.name} (ID: ${pet.id})`);
    //         }
    //     }
    // });

    test('Parte 1: Crear mascotas y validar códigos de respuesta', async () => {
        for (const pet of testData.petsToCreate) {
            await test.step(`Crear y validar mascota: ${pet.name}`, async () => {
                const response = await api.createPet(pet);

                // 1. Validamos el status code
                expect(response.status()).toBe(200);

                const responseBody = await response.json();

                // 2. Validamos que el cuerpo de respuesta coincida con el JSON enviado
                // Comparamos los campos principales uno a uno
                expect(responseBody.id).toBe(pet.id);
                expect(responseBody.name).toBe(pet.name);
                expect(responseBody.status).toBe(pet.status);

                // 3. Validamos objetos anidados (Category)
                expect(responseBody.category).toEqual(pet.category);

                // 4. Validamos arreglos (Tags)
                // Usamos toEqual para comparar el contenido completo del array/objeto
                expect(responseBody.tags).toEqual(pet.tags);

                // 5. Validamos arreglos (PhotoUrls)
                expect(responseBody.photoUrls).toEqual(pet.photoUrls);
            });
        }
        await test.step('Obtener detalles de mascota sold y validar integridad de datos (JSON vs API)', async () => {
            const responseSold = await api.getPetsByStatus('sold');
            expect(responseSold.status()).toBe(200);

            const soldPets = await responseSold.json();

            // 1. Extraemos la mascota "sold" de nuestro archivo local JSON
            const expectedPet = testData.petsToCreate.find(p => p.status === 'sold');

            // 2. Buscamos esa mascota específica en la respuesta de la API por su ID
            const actualPet = soldPets.find(p => p.id === expectedPet.id);

            // 3. Validamos que la mascota exista en la API
            expect(actualPet, `La mascota con ID ${expectedPet.id} no se encontró en la API`).toBeDefined();

            // 4. Validamos campo por campo la integridad de los datos
            expect(actualPet.name).toBe(expectedPet.name);
            expect(actualPet.status).toBe(expectedPet.status);
            expect(actualPet.category.id).toBe(expectedPet.category.id);
            expect(actualPet.category.name).toBe(expectedPet.category.name);

            // Validamos que los tags coincidan (comparación de contenido)
            expect(actualPet.tags).toContainEqual(expectedPet.tags[0]);
        });
    });

    test('Parte 2: Listar disponibles y crear órdenes', async () => {
        let selectedPets = [];

        // 1. Listar mascotas disponibles y guardar 5 en una estructura de datos
        await test.step('Listar mascotas disponibles y seleccionar 5', async () => {
            const response = await api.getPetsByStatus('available');
            expect(response.status()).toBe(200);

            const availablePets = await response.json();

            // Guardamos las primeras 5 en nuestra estructura de datos (selectedPets)
            selectedPets = availablePets.slice(0, 5);

            // --- SECCIÓN DE DEBUGGING ---

            // 1. Mostrar por consola con detalle (depth: null para ver todo el objeto)
            console.log('--- DEBUG: selectedPets extraídos ---');
            console.dir(selectedPets, { depth: null });

            // 2. Guardar en un archivo JSON para inspección manual
            const debugPath = './data/debug_selected_pets.json';
            fs.writeFileSync(debugPath, JSON.stringify(selectedPets, null, 2));
            console.log(`Archivo de debug creado en: ${debugPath}`);

            // ----------------------------

            // Validación de que obtuvimos la cantidad solicitada
            expect(selectedPets.length).toBe(5);
        });

        // 2. Crear una orden para cada una de las 5 mascotas obtenidas
        // Usamos un contador para generar IDs de órdenes entre 1 y 10
        let orderIdCounter = 1;

        for (const pet of selectedPets) {
            await test.step(`Crear orden ID: ${orderIdCounter} para mascota ID: ${pet.id}`, async () => {

                // Llamamos a la API enviando el ID de la mascota y el ID de orden generado
                const orderResponse = await api.placeOrder(pet.id, orderIdCounter);

                expect(orderResponse.status()).toBe(200);

                const orderData = await orderResponse.json();

                // Validaciones de integridad:
                expect(orderData.id).toBe(orderIdCounter); // Validamos ID entre 1 y 10
                expect(orderData.petId).toBe(pet.id);      // Validamos que sea la mascota correcta
                expect(orderData.status).toBe('placed');
            });

            orderIdCounter++; // Incrementamos para la siguiente orden
        }
    });
});