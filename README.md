# Abstracta API Automation - PetStore Project

This repository contains a robust automated testing suite for the **Swagger PetStore API**, built using **Playwright Test**. The project demonstrates advanced API testing techniques, including Data-Driven Testing (DDT), end-to-end data integrity validation, and dynamic resource management.

---

## 🚀 Key Features

* **API Controller Architecture**: Centralized HTTP request logic using a clean, PascalCase class-based structure (`PetStoreApi.js`).
* **Data-Driven Testing**: Test data is decoupled from the code and managed via external JSON files (`pets.json`) for better maintainability.
* **Deep Data Integrity Validation**: Beyond basic HTTP 200 checks, the framework performs deep comparisons of response bodies, including nested objects (`category`) and arrays (`tags`, `photoUrls`), against the source data.
* **Dynamic Resource Handling**: The suite interacts with real-time store data, retrieving live "available" pets to generate subsequent commercial orders.
* **Advanced Reporting**: Implementation of `test.step` for granular traceability. Even in successful runs, the report provides a clear narrative of the test execution.
* **Automated Cleanup**: Integrated `afterAll` hooks ensure a clean testing environment by automatically deleting created resources via the API.



---

## 🛠️ Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* npm (installed with Node.js)

---

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/HernanRios2019/abstracta-api-automation.git](https://github.com/HernanRios2019/abstracta-api-automation.git)
    cd abstracta-api-automation
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Install Playwright Browsers**:
    *This step is mandatory to download the browser binaries required by the test runner.*
    ```bash
    npx playwright install
    ```

---

## 🧪 Running Tests

To execute the full suite and generate a report:
```bash
npx playwright test
```

To view the interactive HTML report after execution:
```bash
npx playwright show-report
```


---

## 📂 Project Structure
```plain text
├── api/
│   └── PetStoreApi.js      # The API Controller (Logic)
├── data/
│   ├── pets.json           # Test data source
│   └── selected_from_api.json # Debug log for API responses
├── tests/
│   └── PetStore.spec.js    # Main test specification
├── package.json
└── playwright.config.js
```

---

## 📝 Design Decisions & Troubleshooting

### Global BaseURL Management
The `baseURL` is defined in `playwright.config.js`. To ensure correct URL concatenation, endpoints in the `PetStoreApi` class are defined as **relative paths**. This prevents common errors where the versioning of the API (`/v2`) is accidentally overwritten by absolute paths.

Example of safe concatenation:
* **BaseURL**: `https://petstore.swagger.io/v2/`
* **Endpoint**: `pet`
* **Result**: `https://petstore.swagger.io/v2/pet`

### JavaScript Integer Precision (BigInt)
The PetStore API returns 64-bit integers (int64) for IDs. Since JavaScript numbers lose precision above Number.MAX_SAFE_INTEGER, a debugging mechanism was implemented to export retrieved pets to data/selected_from_api.json for verification.

### Strict Schema Adherence
The PetStore API requires a strict payload structure. The framework was designed to always include mandatory arrays (photoUrls, tags) even if empty, ensuring compliance with the Swagger specification and preventing 500 errors from the server.

---

* ## 👨‍💻 Author
**Hernán Rios** 
### [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/HernanRios2019)
### [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rios-hernan/)
