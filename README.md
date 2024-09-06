# **Blocks API**

Blocks API is a Node.js-based backend service that listens for new blocks on multiple blockchain networks (e.g., Ethereum, Polygon) using WebSocket providers and stores relevant block data (including gas prices and transaction details) into PostgreSQL databases. The project supports multiple environments (development, staging, and production) and uses Docker to easily manage PostgreSQL instances for each environment.

## **Features**

- **Real-time Block Monitoring**: Uses WebSocket providers to listen for new blocks on Ethereum, Polygon, and other chains.
- **Gas Price Tracking**: Captures and stores gas prices (min, max, average) for every transaction in each block.
- **Dockerized PostgreSQL**: Easy-to-manage PostgreSQL setup using Docker for each environment (development, staging, production).
- **Environment Configuration**: Separate databases and environment variables for development, staging, and production environments.

## **Getting Started**

### **Prerequisites**

Ensure you have the following installed:

- **Node.js**: Version 14 or higher
- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Prisma**: Installed as a development dependency

### **Project Structure**

```plaintext
├── prisma/                    # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── blockFetcher/           # Logic for fetching blocks and processing data
│   └── config/                 # Configuration files (databases, chain settings)
├── .env.dev                    # Environment variables for development
├── .env.staging                # Environment variables for staging
├── .env.prod                   # Environment variables for production
├── docker-compose.yml          # Docker configuration for PostgreSQL
├── package.json                # Project scripts and dependencies
└── README.md                   # Project documentation (this file)
```

## **Setup**

### **1. Clone the repository**:

```bash
git clone https://github.com/yourusername/blocks-api.git
cd blocks-api
```

### **2. Create Environment Files**:

You will need to create `.env` files for each environment (development, staging, and production).

#### **`.env.dev`**:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=dev_db
```

#### **`.env.staging`**:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=staging_db
```

#### **`.env.prod`**:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=prod_db
```

Make sure to add these files to your `.gitignore` to prevent committing sensitive information to version control.

### **3. Start Docker Containers**:

Start the PostgreSQL databases for all environments by running Docker Compose.

```bash
docker-compose up -d
```

This will start three PostgreSQL containers:

- **dev-db** on port `5433`
- **staging-db** on port `5434`
- **prod-db** on port `5435`

### **4. Install Dependencies**:

Install the Node.js dependencies for the project:

```bash
npm install
```

### **5. Generate Prisma Client**:

Generate the Prisma client and apply migrations:

For **development**:

```bash
npx prisma migrate dev --env .env.dev
```

For **staging**:

```bash
npx prisma migrate deploy --env .env.staging
```

For **production**:

```bash
npx prisma migrate deploy --env .env.prod
```

### **6. Run the Application**:

To start the application, use the following commands based on the environment.

#### **Development**:

```bash
npm run dev
```

#### **Staging**:

```bash
npm run staging
```

#### **Production**:

```bash
npm run prod
```

### **7. Accessing the Databases**:

If you need to access the databases (for example, the development database), use the following command:

```bash
docker exec -it dev_db psql -U myuser -d dev_db
```

## **Usage**

- **Prisma Studio**: You can use Prisma Studio to visualize and manage your database:

  ```bash
  npx prisma studio
  ```

- **Run Migrations**:
  - For development:
    ```bash
    npx prisma migrate dev --env .env.dev
    ```
  - For staging/production:
    ```bash
    npx prisma migrate deploy --env .env.prod
    ```

## **Technology Stack**

- **Node.js**: Backend framework
- **ethers.js**: Interacts with blockchain networks (Ethereum, Polygon, etc.)
- **PostgreSQL**: Database for storing block and transaction data
- **Prisma**: ORM for managing database interactions
- **Docker**: Containerization for databases (PostgreSQL)

## **Project Roadmap**

- Add support for more blockchains.
- Implement retry logic for WebSocket connections.
- Add analytics for gas price fluctuations and transaction behavior.
