import app from "./index.js";
import { connectDB } from "./database/db.js";

connectDB();

app.listen(5000, () => {
    console.log("Server up and running at port 5000")
})