const swaggerAutogen = require("swagger-autogen")();

const doc = {
	info: {
		title: "항해 14기 노드반 HW2 Blog APIs",
		description: "김시원, 정하욱",
	},
	host: "localhost:3001",
	schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];
swaggerAutogen(outputFile, endpointsFiles, doc);
