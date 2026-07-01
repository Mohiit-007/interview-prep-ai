require("dotenv").config();
const app = require("./src/app");
const connectdb = require("./src/db");
connectdb();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`server started on port ${PORT}`);
	console.log(`CLIENT_URL=${process.env.CLIENT_URL}`);
});