# Instructions:

Clone the repo, `docker compose up --build ` will start express app service and a mongo service, OHLCV data will be automatically restored from the ./dump
during mongo service runtime at the startup. For simplicity app service binds to localhost:4000, connects to a database service running on mongodb://localhost:27017, all by default.
Ensure ports 4000 and 27017 are not in use.

4 endpoints on http://localhost:4000/api/stocks
1 on http://localhost:4000/api/ohlcv

run tests locally with:
npm install
npm run test

or inside app docker container,

# Stock CRUD API

This is a RESTful API to manage stocks, providing CRUD operations for stock data, such as creating, reading, updating, and deleting stock entries.

## API Endpoints

### 1. **Get Paginated Stocks**

- **Endpoint**: `GET api/stocks`
- **Description**: Retrieve a paginated list of stocks with sorting options.
- **Query Parameters**:

  - `page`: Page number (default: 1, min: 1)
  - `limit`: Number of items per page (default: 20, min: 1, max: 100)
  - `sortBy`: Field to sort by (options: "ticker", "companyName", "foundingDate", default: "ticker")

- **Response**:

  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "stocks": [
        {
          "_id": "uniqueStockId",
          "companyName": "Apple Inc.",
          "ticker": "AAPL",
          "foundingDate": "1976-04-01",
          "createdAt": "timestamp",
          "updatedAt": "timestamp"
        }
        // ... more stocks
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 100,
        "itemsPerPage": 20,
        "hasNextPage": true,
        "hasPreviousPage": false
      }
    }
    ```

- **Error Response**:

  - **Status Code**: `400 Bad Request`
  - **Body**:
    ```json
    {
      "message": "Invalid pagination parameters. Page must be ≥ 1 and limit between 1 and 100"
    }
    ```

- **Usage Example**:
  ```bash
  curl -X GET "http://localhost:4000/api/stocks?page=1&limit=20&sortBy=ticker"
  ```

### 2. **Create a Stock**

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
  ```bash
  curl -X POST http://localhost:4000/api/stocks \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Facebook", "ticker": "META", "foundingDate": "2004-02-04"}'
  ```

### 3. **Get Stock by Ticker**

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
  ```bash
  curl -X GET http://localhost:4000/api/stocks/AAPL
  ```

### 4. **Update Stock by Ticker**

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
  ```bash
  curl -X PUT http://localhost:4000/api/stocks/AAPL \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Apple Inc.", "foundingDate": "1976-04-01"}'
  ```

### 5. **Delete Stock by Ticker**

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
  ```bash
  curl -X DELETE http://localhost:4000/api/stocks/AAPL
  ```

## Validation Rules

Each endpoint that requires data validation uses **Joi** for schema validation. Below are the validation rules for each DTO (Data Transfer Object):

- **getPaginatedStocksDto**:

  - `page`: Optional, integer, minimum 1, defaults to 1
  - `limit`: Optional, integer, minimum 1, maximum 100, defaults to 20
  - `sortBy`: Optional, string, must be one of ["ticker", "companyName", "foundingDate"], defaults to "ticker"

- **createStockDto**:

  - `companyName`: Required, string, no extra spaces
  - `ticker`: Required, unique, uppercase, string
  - `foundingDate`: Required, Date

- **getStockByTickerDto**:

  - `ticker`: Required, string, uppercase

- **updateStockDto**:
  - `companyName`: Optional, string, no extra spaces
  - `foundingDate`: Optional, Date

## Example Usage with cURL

To interact with the API, you can use the following cURL commands.

- **Get Paginated Stocks**:

  ```bash
  curl -X GET "http://localhost:4000/api/stocks?page=1&limit=20&sortBy=ticker"
  ```

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

## Error Handling

Each API endpoint will return appropriate error responses, including status codes and messages for:

- Validation errors (`400 Bad Request`)
- Not found errors (`404 Not Found`)
- Server errors (`500 Internal Server Error`)

# OHLCV data api

Analyzes the profit potential of a stock within a specified date range and compares it to the previous and next periods of the same length, as well as to other stocks.

## API Endpoints

### 5. **Analyze Profit Potential**

- **Endpoint**: `GET api/ohlcv/:ticker/:startDate/:endDate`
- **Description**: Analyzes the profit potential of a stock within a specified date range and compares it to the previous and next periods of the same length, as well as to other stocks.
- **Path Parameters**:

  - `ticker`: The stock's ticker symbol (e.g., `AAPL` for Apple).
  - `startDate`: The start date of the period to analyze (ISO 8601 format, e.g., `2020-01-01`).
  - `endDate`: The end date of the period to analyze (ISO 8601 format, e.g., `2020-01-07`).

- **Response**:

  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "previousPeriod": {
        "period": {
          "startDate": "2019-12-24",
          "endDate": "2019-12-30",
          "workingDays": 5
        },
        "bestSingleTrade": {
          "buyDate": "2019-12-24",
          "buyPrice": 100,
          "sellDate": "2019-12-30",
          "sellPrice": 110,
          "profit": 10
        },
        "maxMultipleTradesProfit": 15
      },
      "currentPeriod": {
        "period": {
          "startDate": "2020-01-01",
          "endDate": "2020-01-07",
          "workingDays": 5
        },
        "bestSingleTrade": {
          "buyDate": "2020-01-01",
          "buyPrice": 105,
          "sellDate": "2020-01-07",
          "sellPrice": 120,
          "profit": 15
        },
        "maxMultipleTradesProfit": 20
      },
      "nextPeriod": {
        "period": {
          "startDate": "2020-01-08",
          "endDate": "2020-01-14",
          "workingDays": 5
        },
        "bestSingleTrade": {
          "buyDate": "2020-01-08",
          "buyPrice": 115,
          "sellDate": "2020-01-14",
          "sellPrice": 125,
          "profit": 10
        },
        "maxMultipleTradesProfit": 12
      },
      "betterPerformingStocks": [
        {
          "ticker": "MSFT",
          "profit": 25
        },
        {
          "ticker": "GOOG",
          "profit": 22
        }
      ]
    }
    ```

- **Error Response**:

  - **Status Code**: `400 Bad Request`
  - **Body**:
    ```json
    {
      "message": "No data available for the specified period"
    }
    ```

- **Usage Example**:

  - **Request**:
    ```bash
    curl -X GET http://localhost:4000/api/ohlcv/AAPL/2020-01-01/2020-01-07
    ```
  - **Response**:
    ```json
    {
      "previousPeriod": {
        "period": {
          "startDate": "2019-12-26T00:00:00.000Z",
          "endDate": "2019-12-31T00:00:00.000Z",
          "workingDays": 4
        },
        "bestSingleTrade": {
          "buyDate": "2019-12-27T00:00:00.000Z",
          "buyPrice": 72.449997,
          "sellDate": "2019-12-31T00:00:00.000Z",
          "sellPrice": 73.412498,
          "profit": 0.9625010000000032
        },
        "maxMultipleTradesProfit": 0.9625010000000032
      },
      "currentPeriod": {
        "period": {
          "startDate": "2020-01-01T00:00:00.000Z",
          "endDate": "2020-01-07T00:00:00.000Z",
          "workingDays": 4
        },
        "bestSingleTrade": {
          "buyDate": "2020-01-03T00:00:00.000Z",
          "buyPrice": 74.357498,
          "sellDate": "2020-01-06T00:00:00.000Z",
          "sellPrice": 74.949997,
          "profit": 0.5924989999999895
        },
        "maxMultipleTradesProfit": 0.5924989999999895
      },
      "nextPeriod": {
        "period": {
          "startDate": "2020-01-08T00:00:00.000Z",
          "endDate": "2020-01-13T00:00:00.000Z",
          "workingDays": 4
        },
        "bestSingleTrade": {
          "buyDate": "2020-01-08T00:00:00.000Z",
          "buyPrice": 75.797501,
          "sellDate": "2020-01-13T00:00:00.000Z",
          "sellPrice": 79.239998,
          "profit": 3.442497000000003
        },
        "maxMultipleTradesProfit": 3.442497000000003
      },
      "betterPerformingStocks": [
        {
          "ticker": "GOOG",
          "profit": 36.29003899999998
        },
        {
          "ticker": "AMZN",
          "profit": 31.890014000000065
        },
        {
          "ticker": "NFLX",
          "profit": 9.929993000000024
        },
        {
          "ticker": "META",
          "profit": 4.390000000000015
        }
      ]
    }
    ```
