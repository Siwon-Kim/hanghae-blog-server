const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

//Swagger
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output')

const mainRouter = require("./routes/index.js");
const connect = require("./schemas");
connect();

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", [mainRouter]);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.get("/", (req, res) => {
	res.send("APIs for Voyage Blog");
});

app.listen(port, () => {
	console.log(port, `Server running on ${port} port`);
});