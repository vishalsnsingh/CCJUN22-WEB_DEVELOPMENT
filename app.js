const express = require("express");
const bodyParser = require("body-parser");
const libre = require("libreoffice-convert");
const fs = require("fs");
const path = require("path");
var outputFilePath;
const multer = require("multer");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views/partials"));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

app.get("/", (req, res) => {
  res.render("service");
});

app.get("/docxtopdf", (req, res) => {
  res.render("docxtopdf", {
    title: "DOCX to PDF Converter - Free Media Tools",
  });
});

const docxtopdf = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== ".docx" && ext !== ".doc") {
    return callback("This Extension is not docx");
  }
  callback(null, true);
};

const docxtopdfupload = multer({
  storage: storage,
  fileFilter: docxtopdf,
});

app.post("/docxtopdf", docxtopdfupload.single("file"), (req, res) => {
  if (req.file) {
    console.log(req.file.path);

    const file = fs.readFileSync(req.file.path);

    outputFilePath = Date.now() + "output.pdf";

    libre.convert(file, ".pdf", undefined, (err, done) => {
      if (err) {
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputFilePath);

        res.send("some error taken place in conversion process");
      }

      fs.writeFileSync(outputFilePath, done);

      res.download(outputFilePath, (err) => {
        if (err) {
          fs.unlinkSync(req.file.path);
          fs.unlinkSync(outputFilePath);

          res.send("some error taken place in downloading the file");
        }

        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputFilePath);
      });
    });
  }
});

app.get("/pdftodocx", (req, res) => {
  res.render("pdftodocx", {
    title: "PDF to DOCX Converter - Free Media Tools",
  });
});

const pdftodocx = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== ".pdf") {
    return callback("This Extension is not docx");
  }
  callback(null, true);
};

const pdftodocxupload = multer({
  storage: storage,
  fileFilter: pdftodocx,
});

app.post("/pdftodocx", pdftodocxupload.single("file"), (req, res) => {
  if (req.file) {
    console.log(req.file.path);

    outputFilePath = Date.now() + "output.docx";

    libre.convert(req.file.path, ".docx", undefined, (err, done) => {
      if (err) {
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputFilePath);

        res.send("some error taken place in conversion process");
      }

      fs.writeFileSync(outputFilePath, done);

      res.download(outputFilePath, (err) => {
        if (err) {
          fs.unlinkSync(req.file.path);
          fs.unlinkSync(outputFilePath);

          res.send("some error taken place in downloading the file");
        }

        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputFilePath);
      });
    });
  }
});

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
