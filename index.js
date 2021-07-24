const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 3001;

morgan.token("body", (req, res) => JSON.stringify(req.body));
morgan.format(
  "tinyWithBody",
  ":method :url :status :res[content-length] - :response-time ms Body: :body"
);

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(morgan("tinyWithBody"));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

// Utilities
const generateRandomId = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

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
  res.json(persons);
});

// Get specific person if exists
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const personFound = persons.find((p) => p.id === id);
  if (personFound) {
    res.json(personFound);
  } else {
    res.status(404).end();
  }
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

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateRandomId(1, 10000000),
  };

  persons = persons.concat(newPerson);

  res.json(newPerson);
});

app.listen(PORT);
console.log(`Express app working on port ${PORT}`);
