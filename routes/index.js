var express = require("express");
var router = express.Router();
const userModel = require("../models/users");
const adminModel = require("../models/admins");
const hostelModel = require("../models/hostels");

/* GET home page. */
router.get("/", function (req, res, next) {
  // Assuming you have some logic to determine if the user is logged in
  let user = req.session.user; // Replace with your actual user authentication logic
  
  res.render("index", { user: user });
});

router.get("/about", function (req, res, next) {
  res.render("about");
});

router.get("/rooms",isLoggedIn, async function (req, res, next) {
  const hostels = await hostelModel.find();
  res.render("rooms",{hostels: hostels});
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/register", function (req, res, next) {
  res.render("register");
});

router.get("/admin/register", function (req, res, next) {
  res.render("adminregister");
});

router.get("/admin/login", function (req, res, next) {
  res.render("adminlogin");
});

router.get("/m-reg",function(req,res){
  res.render("m-reg");
});

router.get("/m-log",function(req,res){
  res.render("m-log");
});

router.get('/profile', async function (req, res, next) {
  try {
      // Check if the user is logged in by verifying the session
      if (!req.session.user) {
          return res.status(401).send('Unauthorized: Please log in to view your profile');
      }

      const username = req.session.user.username; // Accessing username from session
      const user = await userModel.findOne({ username }).populate('bookedHostels').exec();
      
      if (!user) {
          return res.status(404).send('User not found');
      }
      
      res.render('profile', { user });
  } catch (err) {
      next(err);
  }
});

router.get("/admin/dashboard", async (req, res) => {
  try {
    // Check if admin is logged in
    if (!req.session.admin) {
      return res.redirect('/admin/login');
    }

    // Retrieve admin details from the database
    const admin = await adminModel.findOne({ username: req.session.admin.username });
    const hostels = await admin.populate("hostelsCreated");

    if (admin) {
      // Render the admin dashboard with admin data and populated hostels
      res.render('admin-dashboard', { admin, hostels });
    } else {
      // Admin not found in database (handle as per your application logic)
      res.status(404).send("Admin not found");
    }
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/register", async function (req, res) {
  const userData = await userModel.create({
    username: req.body.username,
    name: req.body.name,
    phone: req.body.phone,
    password: req.body.password
  });

  console.log("User created");
  res.redirect("/login");
});

router.post("/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ username: req.body.username });
    if (user && user.password === req.body.password) {
      req.session.user = {
        id: user._id,
        username: user.username,
        name: user.name,
        phone: user.phone
      };
      return res.redirect("/rooms");
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/book-hostel', async function (req, res, next) {
  const { hostelId, username, password } = req.body;
  
  try {
      const user = await userModel.findOne({ username, password }).exec();
      if (!user) {
          return res.status(400).send('Invalid username or password');
      }
      
      const hostel = await hostelModel.findById(hostelId).exec();
      if (!hostel) {
          return res.status(404).send('Hostel not found');
      }
      
      user.bookedHostels.push(hostel._id);
      await user.save();
      
      hostel.bookedBy.push(user._id);
      await hostel.save();
      
      res.redirect('/rooms');
  } catch (err) {
      next(err);
  }
});



// Register Admin
router.post("/admin/register", async (req, res) => {
  try {
    const adminData = await adminModel.create({
      username: req.body.username,
      name: req.body.name,
      phone: req.body.phone,
      password: req.body.password
    });

    console.log("Admin created");
    res.redirect("/admin/login");
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Login Admin
router.post("/admin/login", async (req, res) => {
  try {
    const admin = await adminModel.findOne({ username: req.body.username });
    if (admin && admin.password === req.body.password) {
      req.session.admin = {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        phone: admin.phone
      };
      return res.redirect("/admin/dashboard");
    }
    res.redirect("/admin/login");
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Handle hostel creation form submission
router.post("/admin/create-hostel", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin/login');
    }

    const { name, location, price, img } = req.body;
    const adminId = req.session.admin.id;

    // Create hostel document
    const newHostel = await hostelModel.create({
      name: name,
      location: location,
      pricePerDay: price,
      img: img,
      admin: adminId
    });

    console.log("Hostel created:", newHostel);
    res.redirect('/admin/dashboard'); // Redirect to admin dashboard or wherever appropriate
  } catch (error) {
    console.error("Error creating hostel:", error);
    res.status(500).send("Internal Server Error");
  }
});

function isLoggedIn(req, res, next) {
  if (req.session.user) {
      res.locals.user = req.session.user; // Make user available in templates
      next();
  } else {
      res.locals.user = null;
      next();
  }
}

router.get('/logout', function(req, res) {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Could not log out');
      }
      res.redirect('/'); // Redirect to homepage or login page
  });
});


module.exports = router;
