
# Cryptomarket

Cryptomarket is a cutting-edge online marketplace that leverages the power of NestJS and Prisma for backend services, enabling users to buy and sell items with cryptocurrency transactions. Inspired by platforms like Vinted, Cryptomarket aims to streamline peer-to-peer transactions by integrating blockchain technology for secure and transparent dealings.

## Features

- **User Management**: Secure login and registration using blockchain wallets.
- **Item Listings**: Users can list items for sale, set prices in various cryptocurrencies, and upload item images.
- **Crypto Payments**: Facilitates direct cryptocurrency transactions between buyers and sellers.
- **Messaging**: Enables communication between buyers and sellers for negotiation and transaction details.
- **Transaction History**: Records and displays a history of user transactions, enhancing transparency and trust.

## Technologies

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: Next-generation ORM for Node.js and TypeScript, providing a powerful database toolkit.
- **Blockchain/Cryptocurrency Integration**: Utilizes smart contracts for handling transactions and wallet interactions.

## Getting Started

To get started with Cryptomarket, follow these steps:

1. **Clone the repository**:

```bash
git clone https://github.com/yourrepository/cryptomarket.git
```

2. **Install dependencies**:

```bash
cd cryptomarket
npm install
```

3. **Set up environment variables**:

Create a `.env` file in the root directory and configure your database and blockchain API settings as per the `.env.example`.

4. **Run database migrations**:

```bash
npx prisma migrate dev
```

5. **Start the application**:

```bash
npm run start
```

The server will start, and you can begin exploring the API endpoints as documented in the Swagger UI.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

Cryptomarket is [MIT licensed](LICENSE).
