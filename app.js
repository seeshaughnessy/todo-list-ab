const express = require("express");
const app = express();
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const PORT = process.env.PORT || 3000;

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://appBrewery:Casmnoo85@cluster0-ubsrw.mongodb.net/todoListDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
);

const itemsSchema = {
  name: {
    type: String,
    required: true
  },
  category: {
    type: String
  }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item" });
const item3 = new Item({ name: "<-- Hit this to delete an item" });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Routes
app.get("/", (req, res) => {
  // const day = date.getDate();

  Item.find((err, items) => {
    if (items.length === 0) {
      if (err) return console.log(err);

      Item.insertMany(defaultItems, err => {
        if (err) {
          console.log(err);
        }
      });

      res.redirect("/");
    }

    res.render("list", {
      listTitle: "Today",
      listItems: items
    });
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.isComplete;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:listName", (req, res) => {
  const listName = _.capitalize(req.params.listName);

  List.findOne({ name: listName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: listName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + listName);
      } else {
        // Show existing list
        res.render("list", {
          listTitle: foundList.name,
          listItems: foundList.items
        });
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// mongodb+srv://appBrewery:Casmnoo85@cluster0-ubsrw.mongodb.net/todoListDB?retryWrites=true&w=majority
// user: appBrewery
// pass: Casmnoo85
