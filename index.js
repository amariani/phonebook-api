require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Contact = require("./models/contact");
const app = express();
const PORT = process.env.PORT;

morgan.token("body", (req, res) => JSON.stringify(req.body));
morgan.format(
  "tinyWithBody",
  ":method :url :status :res[content-length] - :response-time ms Body: :body"
);

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(morgan("tinyWithBody"));

// Utilities
const getRequiredFieldMessage = (fieldName) =>
  `Field ${fieldName} is required.`;

const nameExist = (name) => persons.find((p) => p.name === name);

// Get API info
app.get("/info", (req, res) => {
  res.send(`
  <div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  </div>
  `);
});

// Get list of persons
app.get("/api/persons", (req, res) => {
  Contact.find({}).then((personsResponse) => {
    res.json(personsResponse);
  });
});

// Get specific person if exists
app.get("/api/persons/:id", (req, res) => {
  Contact.findById(req.params.id)
    .then((contactFound) => {
      if (contactFound) {
        res.json(contactFound);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(400).send({ error: "Malformatted id" });
    });
});

// Remove person
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);
  res.status(204).end();
});

// Create person
app.post("/api/persons", (req, res) => {
  const { body } = req;

  if (!body.name) {
    return res.status(400).json({
      error: getRequiredFieldMessage("name"),
    });
  }
  if (!body.number) {
    return res.status(400).json({
      error: getRequiredFieldMessage("number"),
    });
  }

  if (nameExist(body.name)) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const contact = new Contact({
    name: body.name,
    number: body.number,
  });

  contact.save().then((newContact) => {
    res.json(newContact);
  });
});

app.listen(PORT);
console.log(`Express app working on port ${PORT}`);
