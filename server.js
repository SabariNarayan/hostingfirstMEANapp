// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mime = require('mime');
const port = 3000;

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.static('./dist/angapp02'));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://officialsabarinarayan:9447103050@cluster0.buyzcu4.mongodb.net/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Employee Schema
const employeeSchema = new mongoose.Schema({
  name: String,
  age: Number,
  place: String,
  salary: Number,
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create employee model
const Employee = mongoose.model('Employee', employeeSchema);

// Define User Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

// Create User model
const User = mongoose.model('User', userSchema);

// Configure routes
app.use(express.json());

// Authenticate user or admin
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user or admin in the database
    const user = await User.findOne({ email });

    // If user or admin is found
    if (user) {
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Create JSON Web Token (JWT)
        const token = jwt.sign({ email: user.email, role: user.role }, '12345');

        // Return the token
        res.status(200).json({ token });
      } else {
        // Invalid password
        res.status(401).json({ error: 'Unauthorized' });
      }
    } else {
      // User or admin not found
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    // Error handling
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve employee data
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    // Fetch employee data from the database
    const employees = await Employee.find();

    // Return the employee data
    res.status(200).json({ employees });
  } catch (error) {
    // Error handling
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new employee
app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    const { name, age, place, salary } = req.body;

    // Create a new employee object
    const employee = new Employee({ name, age, place, salary });

    // Save the employee to the database
    await employee.save();

    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    // Error handling
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an employee
app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, place, salary } = req.body;

    // Find the employee by ID
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update the employee properties
    employee.name = name;
    employee.age = age;
    employee.place = place;
    employee.salary = salary;

    // Save the updated employee to the database
    await employee.save();

    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    // Error handling
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an employee
app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the employee by ID and remove it
    const result = await Employee.findByIdAndRemove(id);

    if (!result) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    // Error handling
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (token == null) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token,'12345', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = user;
    next();
  });
  
}

app.get('/*', function(req,res){
  res.sendFile(path.join(__dirname + '/dist/angapp02/index.html'));


  // Check if the requested file is a JavaScript file
  if (filePath.endsWith('.js')) {
    // Set the Content-Type header for JavaScript files
    res.setHeader('Content-Type', mime.getType('js'));
  }

  res.sendFile(filePath);
});
// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});




