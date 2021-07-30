const axios = require("axios").default;
const serviceData = require("./service.json");

const lunaAuth = {
    user: "admin",
    pass: "secretphrase2"
}

const lunaUrl = `http://${lunaAuth.user}:${lunaAuth.pass}@localhost:5000`
const instanceId = `${serviceData.name}:localhost:4001`;

async function startService() {
    const instanceUrl = `${lunaUrl}/registry/v1/instances/${instanceId}`;
    const instanceData = {
        instanceId: instanceId,
        name: serviceData.name,
        description: serviceData.description,
        version: serviceData.version,
        status: "OK",
        balancerOptions: {},
        url: "http://localhost:4001"
    };

    axios.put(instanceUrl, instanceData).then((resp) => {
        console.log("Sent Heartbeat.");
        return setTimeout(startService, 15000);
    }).catch(err => {
        if (err.response && err.response.status === 404) {
            // register instance
            axios.post(instanceUrl, instanceData)
                .then(() => {
                    console.log("Registered Instance!");
                    startService();
                })
                .catch((err) => {
                    console.error(err);
                })
        }
    });
}

module.exports = {
    startService
}
