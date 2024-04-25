# Blog App

This is a simple blogging application with user registration and login functionality. Users can manage their blog posts, including viewing all posts, creating new ones, editing existing ones, and deleting them. Additional features include a search function and a like system to enhance user interaction.

## Project Structure

- `backend`: Contains the backend code for the application.
  - `constants.js`: Defines constants used in the application.
  - `db.js`: Sets up the MongoDB database connection and defines database schemas.
  - `index.js`: Entry point for the backend server.
  - `routes`: Contains route handlers for different endpoints.
    - `index.js`: Main router combining user and blog routes.
    - `user.js`: Handles user-related endpoints (signup, login, update, delete, get details).
    - `blog.js`: Handles blog-related endpoints (create, update, delete, get all, filter, get recommended).
    - `Middlewares`: Contains middleware functions.
      - `authentication.js`: Handles user authentication using JWT.
    - `Schemas`: Contains request validation schemas using Zod.
      - `blog.js`: Defines schemas for blog-related requests.
      - `user.js`: Defines schemas for user-related requests.

## Installation and Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Aryan-Garg-dev/Blog-App-Backend.git
   ```

2. **Install dependencies**:

   ```bash
   cd Blog-App/backend
   npm install
   ```

3. **Environment variables**:

   Create a `.env` file in the `backend` directory with the following content:

   ```plaintext
   DB_HOST=<your-mongodb-uri>
   JWT_SECRET=<your-secret-key>
   ```

   Replace `<your-mongodb-uri>` with your MongoDB connection string and `<your-secret-key>` with a secret key for JWT.

4. **Start the server**:

   ```bash
   npx nodemon index.js
   ```

   This will start the backend server at `http://localhost:3000`.

## API Documentation

### User Endpoints

#### Signup

- **Endpoint**: `POST /api/v1/user/signup`
- **Request Body**:
  ```json
  {
    "username": "username",
    "name": {
      "first": "First",
      "last": "Last"
    },
    "password": "password",
    "email": "user@example.com",
    "preferences": ["travel", "food", "fitness"]
  }
  ```
- **Response**:
  ```json
  {
    "token": "access-token",
    "message": "User created successfully",
    "success": true
  }
  ```

#### Login

- **Endpoint**: `POST /api/v1/user/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "token": "access-token",
    "message": "User logged in successfully",
    "success": true
  }
  ```

#### Update User Info

- **Endpoint**: `PUT /api/v1/user/update`
- **Authorization**: Bearer token
- **Request Body**:
  ```json
  {
    "username": "newusername",
    "name": {
      "first": "NewFirst",
      "last": "NewLast"
    },
    "email": "newemail@example.com",
    "preferences": ["food", "technology", "travel"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "User-Info updated successfully",
    "success": true
  }
  ```

#### Delete Account

- **Endpoint**: `DELETE /api/v1/user/delete`
- **Authorization**: Bearer token
- **Response**:
  ```json
  {
    "message": "User deleted successfully",
    "success": true
  }
  ```

#### Get All Users

- **Endpoint**: `GET /api/v1/user/bulk`
- **Authorization**: Bearer token
- **Query Parameters**:
  - `filter`: Search filter
- **Response**:
  ```json
  {
    "users": [
      {
        "username": "username1",
        "name": {
          "first": "First1",
          "last": "Last1"
        },
        "email": "user1@example.com",
        "_id": "user-id-1"
      },
      {
        "username": "username2",
        "name": {
          "first": "First2",
          "last": "Last2"
        },
        "email": "user2@example.com",
        "_id": "user-id-2"
      }
    ],
    "success": true,
    "message": "Users fetched successfully."
  }
  ```

#### Get User Details

- **Endpoint**: `GET /api/v1/user/details`
- **Authorization**: Bearer token
- **Response**:
  ```json
  {
    "user": {
      "username": "username",
      "name": {
        "first": "First",
        "last": "Last"
      },
      "email": "user@example.com",
      "preferences": ["travel", "food", "fitness"]
    },
    "message": "Users details fetched successfully",
    "success": true
  }
  ```

### Blog Endpoints

#### Create Blog

- **Endpoint**: `POST /api/v1/blog/create`
- **Authorization**: Bearer token
- **Request Body**:
  ```json
  {
    "title": "Blog Title",
    "body": "Blog Content",
    "tags": ["food", "travel"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Blog created successfully",
    "blogId": "blog-id",
    "success": true
  }
  ```

#### Update Blog

- **Endpoint**: `PUT /api/v1/blog/update/:id`
- **Authorization**: Bearer token
- **Request Body**:
  ```json
  {
    "title": "Updated Blog Title",
    "body": "Updated Blog Content",
    "tags": ["fitness", "personal-development"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Blog updated successfully",
    "success": true
  }
  ```

#### Delete Blog

- **Endpoint**: `DELETE /api/v1/blog/delete/:id`
- **Authorization**: Bearer token
- **Response**:
  ```json
  {
    "message": "Blog deleted successfully",
    "success": true
  }
  ```
  
#### Like a Blog

- **Endpoint**: `PUT /api/v1/blog/like/:id`
- **Authorization**: Bearer token
- **Request Parameters**:
  - `:id`: The ID of the blog post to like
- **Response**:
  ```json
  {
    "success": true,
    "message": "Like toggled successfully",
    "liked": true
  }
  ```

#### Comment on a Blog

- **Endpoint**: `PUT /api/v1/blog/comment/:id`
- **Authorization**: Bearer token
- **Request Parameters**:
  - `:id`: The ID of the blog post to comment on
- **Request Body**:
  ```json
  {
    "comment": "Your comment here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Comment added successfully",
  }
  ```

#### Get All Blogs Written by User
##### Blogs can be filtered by passing filter as query parameter

- **Endpoint**: `GET /api/v1/blog`
- **Authorization**: Bearer token
- **Query Parameters**:
  - `filter`: Search filter
- **Response**:
  ```json
  {
    "blogs": [
      {
        "author": "user-id",
        "title": "Blog Title",
        "body": "Blog Content",
        "likes": {
          "count": 0,
          "users": []
        },
        "comments": [],
        "authoredDate": "2024-04-25T00:00:00.000Z",
        "tags": ["food", "travel"],
        "_id": "blog-id"
      }
    ],
    "success": true,
    "message": "fetched all the users' blogs successfully"
  }
  ```

#### Get All Blogs From DB 
##### Blogs can be filtered by passing filter as query parameter
- **Endpoint**: `GET /api/v1/blog/all`
- **Authorization**: Bearer token
- **Query Parameters**:
  - `filter`: Search filter
- **Response**: Same as above

#### Get Recommended Blogs

- **Endpoint**: `GET /api/v1/blog/recommended`
- **Authorization**: Bearer token
- **Response**: Same as above

## Testing Locally

To test the application locally, follow these steps:

1. **Start the server**:

   ```bash
   cd Blog-App/backend
   npx nodemon index.js
   ```

2. **Use Postman**:

   - Import [Postman Collection](https://api.postman.com/collections/31991421-cdde7c1b-3c46-4aec-be8a-28adfb59a278?access_key=PMAT-01HWB168ZQ4S9SP13DNXVSSSMN) to test the API endpoints.
   - Set the environment variables if necessary.



