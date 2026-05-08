# Car Matrix

Car Matrix is a comprehensive web application for managing and renting cars. It is built using a modern full-stack architecture with a React front-end and a Node.js/Express back-end, backed by a SQL Server database.

## Technologies Used

### Front-End
- **React** (v19)
- **React Router** for navigation
- **Vite** as the build tool
- **Tailwind CSS** for styling (optional/configured)
- **Axios** for API requests

### Back-End
- **Node.js** & **Express**
- **SQL Server (mssql)** for database management
- **JSON Web Tokens (JWT)** for secure authentication
- **bcryptjs** for password hashing

## Project Structure

- `/client` - Contains the React front-end code.
- `/server` - Contains the Node.js/Express API and server logic.
- `*.sql` files - SQL scripts for setting up the database schemas and seeding initial data.

## Getting Started

### Prerequisites
- Node.js (v18+)
- SQL Server

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AhmadHassan28/Car-Matrix.git
   cd Car-Matrix
   ```

2. **Database Setup:**
   Run the SQL scripts provided in the root directory (`FullSeed.sql`, etc.) on your SQL Server instance to create the necessary tables and populate initial data.

3. **Server Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and configure your database connection and JWT secrets.
   Start the server:
   ```bash
   npm run dev
   ```

4. **Client Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

## License
ISC
