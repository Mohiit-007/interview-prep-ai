require("dotenv").config();
const app = require("./src/app");
const connectdb = require("./src/db");
// Provide sensible defaults for local development to avoid silent failures.
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "production") {
	process.env.JWT_SECRET = "dev_jwt_secret";
	console.warn("JWT_SECRET not set — using development default (not for production)");
}
if (!process.env.MONGO_URI && process.env.NODE_ENV !== "production") {
	process.env.MONGO_URI = "mongodb://127.0.0.1:27017/resumeAI";
	console.warn("MONGO_URI not set — using local MongoDB default (ensure MongoDB is running)");
}

connectdb()
	.then(() => {
		const PORT = process.env.PORT || 8000;
		app.listen(PORT, () => {
			console.log(`server started on port ${PORT}`);
			console.log(`CLIENT_URL=${process.env.CLIENT_URL}`);
		});
	})
	.catch((err) => {
		console.error("Failed to connect to database, exiting.", err);
		process.exit(1);
	});