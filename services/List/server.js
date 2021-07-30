const express = require("express");
const axios = require("axios");
const { startService } = require("./service");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const DB = [
    {
        id: 1,
        items: [
            ["Take out the trash", false]
        ]
    }
];

app.get("/api/lists", (req, res) => {
    return res.json(DB);
});

app.get("/api/list/:Id", (req, res) => {
    const { Id } = req.params;

    const found = DB.find(list => list.id == Id);

    if (found == null) {
        return res.sendStatus(404);
    }

    return res.json(found);
});


app.post("/api/list/create", (req, res) => {
    const addedEntryIndex = DB.push({
        id: DB[DB.length - 1].id + 1,
        items: []
    });

    res.json({
        id: DB[addedEntryIndex - 1].id
    });
});

app.post("/api/list/:Id/createItem", (req, res) => {
    const { Id } = req.params;
    const { todo_desc } = req.body;

    const found = DB.find(list => list.id == Id);

    if (found == null) {
        return res.sendStatus(404);
    }

    if (todo_desc == null) {
        return res.status(400).send("'todo_desc' was not found in the body.");
    }

    found.items.push([req.body.todo_desc, false]);

    res.sendStatus(204);
});

app.delete("/api/list/:Id/items/:itemId", (req, res) => {
    const { Id, itemId } = req.params;

    const foundList = DB.find(list => list.id == Id);
    const foundItem = foundList.items[itemId];

    if (foundList == null || foundItem == null) {
        return res.sendStatus(404);
    }

    delete foundList.items[itemId];

    // filter all nulls out upon deletion
    const foundListIndex = DB.findIndex(list => list.id == Id);
    DB[foundListIndex].items = foundList.items.filter(item => item != null);

    res.sendStatus(204);
});

app.listen(4001, () => {
    console.log("List instance listening on port 4001");
    startService();
});