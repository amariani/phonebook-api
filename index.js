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

app.use(express.static("build"));
app.use(express.json());

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" });
  }

  next(error);
};

app.use(morgan("tinyWithBody"));
app.use(cors());

// Utilities
const getRequiredFieldMessage = (fieldName) =>
  `Field ${fieldName} is required.`;

// Get API info
app.get("/info", (req, res) => {
  Contact.estimatedDocumentCount()
    .then((contactsCount) => {
      res.send(`
  <div>
    <p>Phonebook has info for ${contactsCount} people</p>
    <p>${new Date()}</p>
  </div>
  `);
    })
    .catch(() => {
      res.send(`
  <div>
    <p>Phonebook App could not connect to the database.</p>
    <p>${new Date()}</p>
  </div>
  `);
    });
});

// Get list of persons
app.get("/api/persons", (req, res) => {
  Contact.find({}).then((personsResponse) => {
    res.json(personsResponse);
  });
});

// Get specific person if exists
app.get("/api/persons/:id", (req, res, next) => {
  Contact.findById(req.params.id)
    .then((contactFound) => {
      if (contactFound) {
        res.json(contactFound);
      } else {
        res.status(404).end();
      }
    })
    .catch((e) => next(e));
});

// Remove person
app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Contact.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((e) => next(e));
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

  const contact = new Contact({
    name: body.name,
    number: body.number,
  });

  contact.save().then((newContact) => {
    res.json(newContact);
  });
});

// Update person
app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const { name, number } = req.body;

  const contact = {
    name,
    number,
  };

  Contact.findByIdAndUpdate(id, contact, { new: true })
    .then((updatedContact) => {
      res.json(updatedContact);
    })
    .catch((e) => next(e));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT);
console.log(`Express app working on port ${PORT}`);
