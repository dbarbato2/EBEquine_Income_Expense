# EB Equine Income and Expense Tracker

An Expense Tracker application designed for EB Equine built with React, Node.js, Express, and MongoDB to help users manage their revenue, expenses, tax deductions and clients efficiently.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)


![Recording2024-07-20061649-ezgif com-optimize](https://github.com/user-attachments/assets/64e35882-fa9c-497c-90ec-802331e0d6f9)

## Backlog
- Create Invoice Functionality
- Update All Recent Data Under Erin's username
- Publish Site
After publishing:
- Test Change Password Functionality
- Add a listener to the Google Form so that a new row gets added to the database (/Users/darrelbarbato/Documents/JavascriptPrograms/EBEquine_Income_Expense/google-apps-script/GoogleSheetsWebhook.gs)
- Create Notes Functionality Using AI

## Features
- User authentication (register, login, logout)
- Adjust Settings for a user including switching between light and dark mode
- Add, edit, and delete revenue including fuzzy search capabilities to find specific transactions
- Add, edit, and delete expenses including fuzzy search capabilities to find specific transactions
- Add, edit, and delete deductions including fuzzy search capabilities to find specific transactions
- Add, edit, and delete clients including fuzzy search capabilities to find specific transactions
- Automatically adds clients to the database when one fills out the Google Form
- View transaction histories
- For revenue transactions, crerate an editable invoice to display or print
- Comprehensive charts and graphs to visualize revenue, expenses, deductions, and clients
- Download all charts as .csv files and all graphs as .png files
- Ability to display unpaid invoices and create new invoices for clients from that list
- Button to create pdf file for any given historical month of all transactions for tax purposes
- Notifications for user actions and errors

## Technologies Used
### Frontend
- **React.js**: For building the user interface
- **React Router**: For client-side routing
- **Styled Components**: For styling components
- **Chart.js**: For displaying charts
- **react-chartjs-2**: React wrapper for Chart.js
- **axios**: For making HTTP requests
- **react-cookie**: For handling cookies
- **react-hot-toast**: For displaying toast notifications

### Backend
- **Node.js**: For server-side JavaScript execution
- **Express.js**: For building the backend API
- **MongoDB**: NoSQL database for storing data
- **Mongoose**: ODM for MongoDB
- **JWT (JSON Web Tokens)**: For authentication
- **bcrypt**: For password hashing
- **cors**: For handling Cross-Origin Resource Sharing
- **dotenv**: For managing environment variables
- **body-parser**: For parsing incoming request bodies

### Development Tools
- **Visual Studio Code**: Code editor
- **Git**: Version control
- **GitHub**: Repository hosting

### Hosting and Deployment
- **Netlify/Vercel**: For hosting the frontend (if used)
- **Heroku**: For hosting the backend (if used)
- **Docker**: For containerizing the application (if used)

## Installation
### Prerequisites
- Node.js
- npm or yarn
- MongoDB

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. Install dependencies:
```bash
   npm install
   # or
   yarn install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
   npm run dev
   # or
   yarn dev
```


## API Endpoints
### Auth
- **POST /api/v1/register**: Register a new user
- **POST /api/v1/login**: Log in an existing user
- **POST /api/v1/logout**: Log out the current user
- **POST /**: Check user authentication status

### Revenue
- **POST /api/v1/add-revenue**: Add a new revenue
- **GET /api/v1/get-revenue**: Get all revenue for the user
- **DELETE /api/v1/delete-revenue/:id**: Delete an revenue by ID

### Expense
- **POST /api/v1/add-expense**: Add a new expense
- **GET /api/v1/get-expenses**: Get all expenses for the user
- **DELETE /api/v1/delete-expense/:id**: Delete an expense by ID

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to reach out if you have any questions or suggestions!
