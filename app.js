const express = require("express");
require('express-async-errors');
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

const mainRouter = require("./routes/index.routes.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", [mainRouter]);

//Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/", (req, res) => {
	res.send("APIs for Voyage Blog");
});

app.listen(port, () => {
	console.log(port, `Server running on ${port} port`);
});
