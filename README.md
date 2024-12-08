# Stock CRUD api

This is a RESTful API to manage stocks, providing CRUD operations for stock data, such as creating, reading, updating, and deleting stock entries.

## API Endpoints

### 1. **Create a Stock**

- **Endpoint**: `POST api/stocks`
- **Description**: Create a new stock entry.
- **Request Body**:

  ```json
  {
    "companyName": "Facebook",
    "ticker": "META",
    "foundingDate": "2004-02-04"
  }
  ```

- **Response**:

  - **Status Code**: `201 Created`
  - **Body**:
    ```json
    {
      "_id": "uniqueStockId",
      "companyName": "Facebook",
      "ticker": "META",
      "foundingDate": "2004-02-04",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

- **Error Response**:

  - **Status Code**: `400 Bad Request`
  - **Body**:
    ```json
    {
      "message": "Validation error or invalid data"
    }
    ```

- **Usage Example**:
  - **Request**:
    ```bash
    curl -X POST http://localhost:4000/api/stocks \
    -H "Content-Type: application/json" \
    -d '{"companyName": "Facebook", "ticker": "META", "foundingDate": "2004-02-04"}'
    ```
  - **Response**:
    ```json
    {
      "_id": "uniqueStockId",
      "companyName": "Facebook",
      "ticker": "META",
      "foundingDate": "2004-02-04",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

---

### 2. **Get Stock by Ticker**

- **Endpoint**: `GET api/stocks/:ticker`
- **Description**: Retrieve a stock entry by its ticker symbol.
- **Path Parameters**:

  - `ticker`: The stock's ticker symbol (e.g., `AAPL` for Apple).

- **Response**:

  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "_id": "uniqueStockId",
      "companyName": "Apple",
      "ticker": "AAPL",
      "foundingDate": "1976-04-01",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

- **Error Response**:

  - **Status Code**: `404 Not Found`
  - **Body**:
    ```json
    {
      "message": "Stock not found"
    }
    ```

- **Usage Example**:
  - **Request**:
    ```bash
    curl -X GET http://localhost:4000/api/stocks/AAPL
    ```
  - **Response**:
    ```json
    {
      "_id": "uniqueStockId",
      "companyName": "Apple",
      "ticker": "AAPL",
      "foundingDate": "1976-04-01",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

---

### 3. **Update Stock by Ticker**

- **Endpoint**: `PUT api/stocks/:ticker`
- **Description**: Update an existing stock entry by its ticker symbol.
- **Path Parameters**:

  - `ticker`: The stock's ticker symbol (e.g., `AAPL` for Apple).

- **Request Body**:

  ```json
  {
    "companyName": "Apple Inc.",
    "foundingDate": "1976-04-01"
  }
  ```

- **Response**:

  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "_id": "uniqueStockId",
      "companyName": "Apple Inc.",
      "ticker": "AAPL",
      "foundingDate": "1976-04-01",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

- **Error Response**:

  - **Status Code**: `404 Not Found`
  - **Body**:
    ```json
    {
      "message": "Stock not found"
    }
    ```

- **Usage Example**:
  - **Request**:
    ```bash
    curl -X PUT http://localhost:4000/api/stocks/AAPL \
    -H "Content-Type: application/json" \
    -d '{"companyName": "Apple Inc.", "foundingDate": "1976-04-01"}'
    ```
  - **Response**:
    ```json
    {
      "_id": "uniqueStockId",
      "companyName": "Apple Inc.",
      "ticker": "AAPL",
      "foundingDate": "1976-04-01",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

---

### 4. **Delete Stock by Ticker**

- **Endpoint**: `DELETE api/stocks/:ticker`
- **Description**: Delete a stock entry by its ticker symbol.
- **Path Parameters**:

  - `ticker`: The stock's ticker symbol (e.g., `AAPL` for Apple).

- **Response**:

  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Stock deleted successfully"
    }
    ```

- **Error Response**:

  - **Status Code**: `404 Not Found`
  - **Body**:
    ```json
    {
      "message": "Stock not found"
    }
    ```

- **Usage Example**:
  - **Request**:
    ```bash
    curl -X DELETE http://localhost:4000/api/stocks/AAPL
    ```
  - **Response**:
    ```json
    {
      "message": "Stock deleted successfully"
    }
    ```

---

## Validation Rules

Each endpoint that requires data validation uses **Joi** for schema validation. Below are the validation rules for each DTO (Data Transfer Object):

- **createStockDto**:

  - `companyName`: Required, string, no extra spaces.
  - `ticker`: Required, unique, uppercase, string.
  - `foundingDate`: Required, Date.

- **getStockByTickerDto**:

  - `ticker`: Required, string, uppercase.

- **updateStockDto**:
  - `companyName`: Optional, string, no extra spaces.
  - `foundingDate`: Optional, Date.

---

## Example Usage with cURL

To interact with the API, you can use the following cURL commands.

- **Create Stock**:

  ```bash
  curl -X POST http://localhost:4000/api/stocks \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Facebook", "ticker": "META", "foundingDate": "2004-02-04"}'
  ```

- **Get Stock by Ticker**:

  ```bash
  curl -X GET http://localhost:4000/api/stocks/AAPL
  ```

- **Update Stock**:

  ```bash
  curl -X PUT http://localhost:4000/api/stocks/AAPL \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Apple Inc.", "foundingDate": "1976-04-01"}'
  ```

- **Delete Stock**:
  ```bash
  curl -X DELETE http://localhost:4000/api/stocks/AAPL
  ```

---

## Error Handling

Each API endpoint will return appropriate error responses, including status codes and messages for:

- Validation errors (`400 Bad Request`)
- Not found errors (`404 Not Found`)
- Server errors (`500 Internal Server Error`)

---
