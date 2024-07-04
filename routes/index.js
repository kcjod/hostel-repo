var express = require("express");
var router = express.Router();
const userModel = require("../models/users");
const adminModel = require("../models/admins");
const hostelModel = require("../models/hostels");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/about", function (req, res, next) {
  res.render("about");
});
router.get("/rooms", function (req, res, next) {
  res.render("rooms");
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
router.get("/admin/dashboard", async (req, res) => {
  try {
    // Check if admin is logged in
    if (!req.session.admin) {
      return res.redirect('/admin/login');
    }

    // Retrieve admin details from the database
    const admin = await adminModel.findOne({ username: req.session.admin.username });

    if (admin) {
      // Render the admin dashboard with admin data
      res.render('admin-dashboard', { admin });
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

// Render the create hostel form
router.get("/admin/create-hostel", (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }

  const admin = req.session.admin;
  res.render('create-hostel', { admin });
});

// Handle hostel creation form submission
router.post("/admin/create-hostel", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin/login');
    }

    const { name, location, capacity } = req.body;
    const adminId = req.session.admin.id;

    // Create hostel document
    const newHostel = await Hostel.create({
      name,
      location,
      capacity,
      admin: adminId
    });

    console.log("Hostel created:", newHostel);
    res.redirect('/admin/dashboard'); // Redirect to admin dashboard or wherever appropriate
  } catch (error) {
    console.error("Error creating hostel:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
