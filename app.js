const express = require('express');
const expressIp = require('express-ip');

const MongoClient = require('mongodb').MongoClient;
const mongoServerUrl = 'mongodb://localhost:27017';
const dbName = 'canary_token';

const app = express();
const PORT = process.env.PORT || 3000;

const base64string = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

app.use(expressIp().getIpInfoMiddleware)

app.get('**', async (req, res) => {
    await insert(req);

    res.write(
        Buffer.alloc(
            base64string.length,
            base64string,
            'base64'
        )
    )
    return res.send()
});


const insert = async req => {
    const dados = {
        route: req.url,
        address: req.connection.localAddress,
        date: new Date(),
        cookies: req.cookies,
        headers: req.headers,
        hostname: req.hostname,
        ipInfo: req.ipInfo
    }

    const con = await MongoClient.connect(mongoServerUrl, { useNewUrlParser: true });

    await con.db(dbName).collection('tokens').insertOne(dados);
}

app.listen(PORT, function () {
    console.log(`Server On ${PORT}`);
});