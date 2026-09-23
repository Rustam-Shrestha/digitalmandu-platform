const express = require("express");
const { connectDatabase } = require("./database/database");
const app = express();

// requiring the registeruser and login user from auth controller from controller file
const { registerUser, loginUser } = require("./controller/auth/authController");



// We need this to parse JSON format data and URL-encoded data   
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// code for making client access the folder named uploads only by defalt node doesnnot allow us access the folder
//directly by lcient 
app.use(express.static("./uploads"))


// Include .env to access environment variables
require('dotenv').config();

// Make database connection
connectDatabase(process.env.Mongo_URI);


const {Server} = require("socket.io")
//requirieng cors for fixing cors related error
const cors = require("cors")


//importing the authRoute.js in this file to work with routes
const admin_user_route = require("./routes/admin/adminUserRoute")
const admin_order_route = require("./routes/admin/adminOrderRoute")
const product_routes = require("./routes/admin/productRoute");
const auth_routes = require("./routes/auth/authRoute");
const user_review_route = require("./routes/user/userReviewRoute")
const user_profile_route = require("./routes/user/profileRoute")
const user_order_route = require("./routes/user/orderRoute")
const user_payment_route = require("./routes/user/paymentRoute")

//step:5 create the requirement of the route path here
const user_cart_route = require("./routes/user/cartRoute")

app.use(cors({
    origin:'*'
}))

// using the routes we added for the auth routes
// the "/" denotes that there are no subfolders for the route 
// we can leave it "" only it will work
app.use("/api",auth_routes)
app.use("/api",product_routes)
app.use("/api",admin_user_route)
app.use("/api",user_review_route)
app.use("/api",user_order_route)
app.use("/api",admin_order_route)
app.use("/api",user_payment_route)

// another way of using route either add everything on main route file like top
//or explicitly mention path here like i did  tin this boottm part mentioning profile route explicitly
app.use("/api/profile",user_profile_route)

// step 6: make use of the included route
//notice how id did /api and did /profile 
//it is basically same as i worte whole path here for profile
//and for cart i have written it in their own route file cartRoute 
app.use("/api",user_cart_route)

// Test API
app.get("/", (req, res) => {
    res.status(404).json({
        message: "I am alive"
    });
});


const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not set
// setting server variable
const server = app.listen(PORT, () => {
    console.log("Server is running at: http://localhost:" + PORT);
});

// passing our server address to socket
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("connected to a socket");
    // You can add more event listeners here
    console.log(server)
});

const getSocketIo = ()=>{
    return io
}
module.exports.getSocketIo = getSocketIo