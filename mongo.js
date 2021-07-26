const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://mclain:${password}@fs-phonebookcluster0.gio9v.mongodb.net/phonebook-db?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Contact = mongoose.model("Contact", contactSchema);

const fetchContacts = () => {
  Contact.find({}).then((res) => {
    console.log(`phonebook:`);

    res.forEach((c) => {
      console.log(`${c.name} ${c.number}`);
    });
    mongoose.connection.close();
  });
};

const insertContact = () => {
  const contactName = process.argv[3];
  const contactNumber = process.argv[4];

  const testContact = new Contact({
    name: contactName,
    number: contactNumber,
  });

  testContact.save().then((res) => {
    console.log(`added ${contactName} number ${contactNumber} to phonebook.`);
    mongoose.connection.close();
  });
};

// Return all results if no contact arguments were passed
if (process.argv.length === 3) {
  console.log("No arguments found, fetching contacts...");
  fetchContacts();
}

// If contact args passed, insert
if (process.argv.length === 5) {
  console.log("Inserting contact...");
  insertContact();
}
