import express from 'express';
import axios from 'axios';

import Instance from './service.json';

const app = express();

const port = parseInt(process.env.PORT as string) || 3023;
const instanceId = Instance.name + ":" + "localhost:" + port;
app.get("/", (req, res) => {
    console.log("Instance:" + port + " called");
    res.send("OK");
});

app.listen(port, () => {
    axios.post("http://admin@localhost:4000/registry/v1/instances/" + instanceId, {
        ...Instance,
        instanceId,
        url: "http://localhost:" + port,
        status: "OK",
        balancerOptions: {
            weight: parseInt(process.env.WEIGHT as string) || 1
        }
    }).then((response) => {
        console.log("REGISTERED INSTANCE:" + port);
        // startHeartbeats();
    }).catch(err => console.error)
    

    console.log("Status service started on port " + port);
});

function startHeartbeats() {
    setInterval(() => {
        axios.put("http://admin@localhost:4000/registry/v1/instances/" + instanceId, {
        ...Instance,
        instanceId,
        url: "http://localhost:" + port,
        status: "OK",
        balancerOptions: {
            weight: parseInt(process.env.WEIGHT as string) || 1
        }
    }).then((response) => {
        console.log("SENT HEARTBEAT, STATUS INSTANCE:" + port);
    }).catch(err => console.error)
    }, 30000)
}