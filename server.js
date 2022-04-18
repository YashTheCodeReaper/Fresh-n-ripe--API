require("dotenv").config();
const app = require("./app.js");
const mysql2 = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

// Database connection params
const dbConnection = mysql2.createConnection({
  host: "freshnripedb.ci2pvnzozk4a.us-west-2.rds.amazonaws.com",
  user: "admin",
  database: "freshnripe",
  password: "Ya01022000#",
  port: 3306,
});

// Database connection establishment
dbConnection.connect((error) => {
  if (error) console.log(error);
  console.log("database connection established...");
});

// Creating server
app.listen(process.env.PORT || 3000, () => {
  console.log("server created at port: " + 3000 || process.env.PORT);
});

// result handler function
function dbResultHandler(
  queryString,
  response,
  successMessage,
  serverFailureMessage,
  dbFailureMessage
) {
  dbConnection.query(queryString, (error, result) => {
    if (error) {
      response.send({
        status: "failed",
        message: serverFailureMessage,
      });
    }
    if (result) {
      response.send({
        status: "success",
        message: successMessage,
        data: result,
      });
    } else {
      response.send({
        status: "failed",
        message: dbFailureMessage,
      });
    }
  });
}

app.get("/getAllCategories", (req, res) => {
  let queryString = `SELECT * FROM categories`;
  dbResultHandler(
    queryString,
    res,
    "Successfully got all categories",
    "Internal server error",
    "Error getting categories"
  );
});

app.get("/getACategory/:category", (req, res) => {
  let queryString = `SELECT * FROM categories WHERE name='${req.params.category}'`;
  dbResultHandler(
    queryString,
    res,
    "Successfully got the category",
    "Internal server error",
    "Error getting category"
  );
});

app.get("/getAllProducts", (req, res) => {
  let queryString = `SELECT * FROM products`;
  dbResultHandler(
    queryString,
    res,
    "Successfully got all products",
    "Internal server error",
    "Error getting all products"
  );
});

app.get("/getAllFeaturedProducts", (req, res) => {
  let queryString = `SELECT * FROM products WHERE isFeatured=1`;
  dbResultHandler(
    queryString,
    res,
    "Successfully got all featured products",
    "Internal server error",
    "Error getting featured products"
  );
});

app.get("/getProductsBasedOnSubCategory/:category/:subcategory", (req, res) => {
  let queryString = `SELECT * FROM products WHERE category='${req.params.category}' AND subcategory='${req.params.subcategory}'`;
  dbResultHandler(
    queryString,
    res,
    "Successfully got all products based on the specified sub-category",
    "Internal server error",
    "Error getting products"
  );
});

app.get("/getProductsBasedOnCategory/:category", (req, res) => {
  let queryString = `SELECT * FROM products WHERE category='${req.params.category}'`;
  dbResultHandler(
    queryString,
    res,
    "Successfully got all products based on the specified category",
    "Internal server error",
    "Error getting products"
  );
});

app.get(
  "/getProductsBasedOnSubCategory/:category/:subcategory/:minprice/:maxprice",
  (req, res) => {
    let queryString = `SELECT * FROM products WHERE category='${req.params.category}' AND subcategory='${req.params.subcategory}' AND price>=${req.params.minprice} AND price<=${req.params.maxprice};`;

    dbResultHandler(
      queryString,
      res,
      "Successfully got all products based on the specified sub-category",
      "Internal server error",
      "Error getting products"
    );
  }
);

app.get(
  "/getProductsBasedOnCategory/:category/:minprice/:maxprice",
  (req, res) => {
    let queryString = `SELECT * FROM products WHERE category='${req.params.category}' AND price>=${req.params.minprice} AND price<=${req.params.maxprice};`;

    dbResultHandler(
      queryString,
      res,
      "Successfully got all products based on the specified category",
      "Internal server error",
      "Error getting products"
    );
  }
);

app.get("/getProduct/:id", (req, res) => {
  let queryString = `SELECT * FROM products WHERE id = '${req.params.id}'`;
  dbResultHandler(
    queryString,
    res,
    "Got product with that id!",
    "Internal server error",
    "Got no product with that id!"
  );
});

app.get("/checkEmailExistance/:email", (req, res) => {
  let queryString = `SELECT * FROM users WHERE email = '${req.params.email}'`;
  dbResultHandler(
    queryString,
    res,
    "Got user with that email!",
    "Internal server error",
    "Got no user with that email!"
  );
});

app.post("/updateUserCart/:id", (req, res) => {
  let cart = req.body.cart;
  let queryString = `UPDATE users SET cart='${cart}' WHERE id='${req.params.id}'`;

  dbResultHandler(
    queryString,
    res,
    "Successfully updated usercart!",
    "Internal server error",
    "Can't update user cart"
  );
});

app.post("/confirmOrder", (req, res) => {
  let { cart, deliveryMethod, protection, userid } = req.body;

  let queryString = `INSERT INTO orders(id, cart, deliverymethod, protection, userid) VALUES (UUID(),'${cart}','${deliveryMethod}','${protection}','${userid}')`;

  dbResultHandler(
    queryString,
    res,
    "Successfully confirmed order!",
    "Internal server error",
    "Can't order at this time"
  );
});

app.get("/getUserOrders/:id", (req, res) => {
  let queryString = `SELECT * FROM orders WHERE userid='${req.params.id}'`;
  dbResultHandler(
    queryString,
    res,
    "Successfully found user order!",
    "Internal server error",
    "Can't find user order!"
  );
});

app.delete("/deleteUserOrder/:id", (req, res) => {
  let queryString = `DELETE FROM orders WHERE id='${req.params.id}'`;
  dbResultHandler(
    queryString,
    res,
    "Successfully deleted user order!",
    "Internal server error",
    "Can't find user order!"
  );
});

app.get("/filterProductsSearch/:searchstring", (req, res) => {
  let queryString = `SELECT name, id, category, subcategory FROM products WHERE LOWER( products.name ) LIKE '%${req.params.searchstring}%' OR LOWER( products.subcategory) LIKE '%${req.params.searchstring}%' OR LOWER( products.category) LIKE '%${req.params.searchstring}%'`;

  dbResultHandler(
    queryString,
    res,
    "Successfully got search results!",
    "Internal server error",
    "Can't find items with that name!"
  );
});

app.post("/updateReviewRating/:id", (req, res) => {
  let rating = req.body.rating;
  let reviews = req.body.reviews;
  let queryString = `UPDATE products SET rating='${rating}',reviews='${reviews}' WHERE id='${req.params.id}'`;

  dbResultHandler(
    queryString,
    res,
    "Successfully posted review!",
    "Internal server error",
    "Can't post review at this time!"
  );
});

////////////////////////////////////////////////////////////////////////////
// Authorization
////////////////////////////////////////////////////////////////////////////

// function to create jwt token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// function to create jwt token(signToken()) and send the response, set the jwt in the header
const createSendToken = (userid, res) => {
  const token = signToken(userid);
  res.send({
    status: "success",
    token,
    data: userid,
  });
};

// Register a new user
app.post("/registerUser", async (req, res) => {
  let {
    name,
    email,
    password,
    phone,
    city,
    doorno,
    locality,
    state,
    picture,
    pincode,
    street,
  } = req.body;

  encryptedPassword = await bcrypt.hash(password, 12);

  let queryString = `INSERT INTO users(name, email, phone, picture, password, doorno, street, locality, city, state, pincode, cart, id) VALUES ('${name}','${email}','${phone}','${picture}','${encryptedPassword}','${doorno}','${street}','${locality}','${city}','${state}','${pincode}','[]',UUID())`;

  dbConnection.query(queryString, (error, result) => {
    if (error) {
      res.send({
        status: "failed",
        message: "Internal Server Error",
      });
      return;
    }
    if (result) {
      let queryString = `SELECT id FROM users WHERE email = '${email}'`;
      dbConnection.query(queryString, (error, result) => {
        if (error) {
          res.send({
            status: "failed",
            message: "Internal Server Error",
          });
          return;
        }
        if (result) {
          createSendToken(result[0].id, res);
        } else {
          res.send({
            status: "failed",
            message: "Internal Server Error",
          });
        }
      });
    } else {
      res.send({
        status: "failed",
        message: "User could not be registered",
      });
    }
  });
});

// User Login Validation
app.get("/validateUserLogin/:token", async (req, res) => {
  let token;

  token = req.params.token;

  if (!token || token == "notoken" || token == undefined) {
    res.send({
      status: "failed",
      message: "You are not logged in! Please login again!",
    });
    return;
  }

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  let queryString = `SELECT * FROM users WHERE id='${decodedToken.id}'`;

  dbConnection.query(queryString, (error, result) => {
    if (error) {
      res.send({
        status: "failed",
        message: "Wrong Token / Internal Server Error!",
      });
    }
    if (result) {
      res.send({
        status: "success",
        message: "User already logged in!",
        data: result,
      });
    } else {
      res.send({
        status: "failed",
        message: "Wrong token / Internal Server Error",
      });
    }
  });
});

const checkPassword = async (loginPassword, registeredPassword) => {
  return await bcrypt.compare(loginPassword, registeredPassword);
};

// Login a user
app.post("/loginUser", (req, res) => {
  let { email, password } = req.body;
  let user;
  let isAuthorized;

  let queryString = `SELECT * FROM users WHERE email='${email}'`;

  dbConnection.query(queryString, async (error, result) => {
    if (error) {
      res.send({
        status: "failed",
        message: "Internal Server Error",
      });
      return;
    }
    if (result.length) {
      user = result[0];
      if (user) {
        isAuthorized = await checkPassword(password, user.password);
        if (isAuthorized) {
          createSendToken(user.id, res);
        } else {
          res.send({
            status: "failed",
            message: "Invalid Password!",
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "User not found!",
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "User with that email id not found",
      });
    }
  });
});
