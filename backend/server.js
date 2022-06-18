const express = require('express')
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require("dotenv").config();


const app = express();
const server = http.createServer(app);



const PORT = process.env.PORT || 5000;

const connectDB = require('./config/db');
connectDB();


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors());
app.use('/assets/', express.static(__dirname + '/public'));
console.log(__dirname + '/public')


app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));

app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));

app.use('/api/auth', require('./Auth/route'));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

process.on('unhandledRejection', err => {
    console.log(`An Error occurred: ${err.message}`);
    server.close(() => process.exit(1))
})