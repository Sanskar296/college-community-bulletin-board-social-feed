import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import xlsx from 'xlsx';
import User from './models/User.js'; // Adjust the path if necessary

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/Vishwaniketan-campus', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Read Excel File
const workbook = xlsx.readFile('./data/users.xlsx');
const sheetName = workbook.SheetNames[0];
const users = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]).map(user => {
    return {
        username: user[' username '].trim(),
        password: user[' password '].trim(),
        firstname: user[' firstname '].trim(),
        lastname: user[' lastname '].trim(),
        department: user[' department '].trim(),
    };
});

console.log(users); // Log the users array to check the data

// Generate Unique Identifier Based on Department
const departmentCount = {};

async function importUsers() {
    for (let user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Generate unique identifier
        departmentCount[user.department] = (departmentCount[user.department] || 0) + 1;
        const identifier = `${user.department}-${departmentCount[user.department]}`;

        const existingUser = await User.findOne({ username: user.username });
        if (existingUser) {
            console.log(`User ${user.username} already exists. Skipping...`);
            continue; // Skip to the next user if already exists
        }
        await User.create({
            username: user.username,
            password: hashedPassword,
            firstname: user.firstname,
            lastname: user.lastname,
            department: user.department,
            identifier: identifier,
            gender: 'Not specified', // Default value
            role: 'User', // Default value
            age: 0, // Default value
            email: 'notprovided@example.com', // Default value
        });
    }

    console.log('Users imported successfully!');
    mongoose.connection.close();
}

importUsers();
