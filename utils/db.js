const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/contact", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// // Menambah 1 data
// const contact1 = new Contact({
//   nama: "Erick",
//   nohp: "081364532278",
//   email: "erick@gmail.com",
// });

// // simpan to collections
// contact1.save().then((res) => console.log(res));
