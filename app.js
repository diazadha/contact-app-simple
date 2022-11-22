const express = require("express");
const expressLayouts = require("express-ejs-layouts");

require("./utils/db.js");
const Contact = require("./model/contact.js");

const { body, validationResult, check } = require("express-validator");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const alert = require("alert");

const methodOverride = require("method-override");

const app = express();
const port = 3000;

// Setup method override
app.use(methodOverride("_method"));

// Gunakan ejs
app.set("view engine", "ejs");

// ThirParty Middleware
app.use(expressLayouts);
// app.use(morgan("dev"));

// Builtin Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Halaman Home
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Diaz",
      email: "diaz@gmail.com",
    },
    {
      nama: "Erick",
      email: "erick@gmail.com",
    },
    {
      nama: "Dody",
      email: "Dody@gmail.com",
    },
  ];
  // const mahasiswa = [];
  res.render("index", {
    layout: "layouts/main-layout",
    nama: "Diaz Adha Asri Prakoso",
    title: "Home",
    mahasiswa,
  });
});

app.get("/about", (req, res, next) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
  // next();
});

app.get("/contact", async (req, res) => {
  const contacts = await Contact.find({});

  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Halaman Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "Form Tambah Data Contact",
  });
});

app.post(
  "/contact",
  [
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
    body("nohp").custom(async (value) => {
      const duplicate = await Contact.findOne({ nohp: value });
      if (duplicate) {
        throw new Error("No Hp sudah terdaftar");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ error: errors.array() });
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (err, result) => {
        req.flash("msg", "Data Contact berhasil ditambahkan!");
        res.redirect("/contact");
      });
    }
  }
);

app.get("/contact/edit/:id", async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  res.render("edit-contact", {
    layout: "layouts/main-layout",
    title: "Form Edit Data Contact",
    contact,
  });
});

app.put(
  "/contact",
  [
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
    body("nohp").custom(async (value, { req }) => {
      if (value === req.body.oldnohp) {
        return true;
      } else {
        const duplicate = await Contact.findOne({ nohp: value });
        if (duplicate) {
          throw new Error("No Hp sudah terdaftar");
        }
        return true;
      }
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ error: errors.array() });
      res.render("edit-contact", {
        title: "Form Edit Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      const nama = req.body.nama;
      const email = req.body.email;
      const nohp = req.body.nohp;
      Contact.updateOne(
        { _id: req.body.id },
        {
          $set: {
            nama: nama,
            email: email,
            nohp: nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data Contact berhasil diupdate!");
        res.redirect("/contact");
      });
    }
  }
);

app.delete("/contact", async (req, res) => {
  const contact = await Contact.findById(req.body.id);
  if (!contact) {
    alert("Kontak tidak ditemukan");
    res.redirect("/contact");
  } else {
    await Contact.deleteOne({ _id: req.body.id });
    req.flash("msg", `Kontak ${contact.nama} telah dihapus`);
    res.redirect("/contact");
  }
});

app.get("/contact/:id", async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Halaman Contact",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact APP is listening on port ${port}`);
});
