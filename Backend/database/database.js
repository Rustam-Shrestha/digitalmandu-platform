const goose = require("mongoose");
const adminSeeder = require("../adminSeeder");


exports.connectDatabase = async (URI) => {
    await goose.connect(URI);
    console.log("successfully connected");
    // put admin right after the database is connected
    adminSeeder();
}

// connection string: mongodb+srv://bdave5457:adminPassword@mandu-data.ac49f.mongodb.net/?retryWrites=true&w=majority&appName=mandu-data
