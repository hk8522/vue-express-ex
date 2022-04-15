const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { networkInterfaces } = require('os');

const messages = require('./db/messages');

require('dotenv').config();

const nets = networkInterfaces();

var privateKey  = fs.readFileSync('ssl/private.key', 'utf8');
var certificate = fs.readFileSync('ssl/certificate.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Behold The MEVN Stack!'
    });
});

app.get('/messages', (req, res) => {
    messages.getAll().then((messages) => {
        res.json(messages);
    });
});

app.post('/messages', (req, res) => {
    console.log(req.body);
    messages.create(req.body).then((message) => {
        res.json(message);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
});

const port = process.env.PORT || 4000;

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.on('listening', function () {
    console.log('Server running at http://' + get_ip() + ':' + this.address().port);
});
httpsServer.on('listening', function () {
    console.log('Server running at https://' + get_ip() + ':' + this.address().port);
});

httpServer.listen(process.env.PORT || 8080);
httpsServer.listen(process.env.PORT_HTTPS || 8443);

function get_ip() {
    // const results = Object.create(null);
    // for (const name of Object.keys(nets)) {
    //     for (const net of nets[name]) {
    //         // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    //         if (net.family === 'IPv4' && !net.internal) {
    //             if (!results[name]) {
    //                 results[name] = [];
    //             }
    //             results[name].push(net.address);
    //         }
    //     }
    // }
    // console.log(results);
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return "127.0.0.1";
}