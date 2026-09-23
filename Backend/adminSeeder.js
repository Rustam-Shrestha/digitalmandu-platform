const hx = require('bcryptjs');
const User = require("./models/userModel");
const adminSeeder = async ()=>{
    // Hash the password
    const saltRounds = 10;
    const plainPassword = "admin";
    const hashedPassword = await hx.hash(plainPassword, saltRounds);
    
    // Check if admin already exists
    const isAdminExisted = await User.findOne({ email: "rustamshrestha619@gmail.com" });
    if (!isAdminExisted) {
        // admin data seeding after connection arrives
        await User.create({
            name: "Rustam",
            phone: 9861473532,
            password: hashedPassword,
            email: "rustamshrestha619@gmail.com",
            role: "admin",
        });
        console.log("admin seeded successfully");
    } else {
        console.log("admin already exists");
    }
}

// exprot above module
module.exports = adminSeeder;