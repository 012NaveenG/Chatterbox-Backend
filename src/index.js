import { app } from "./app.js"
import { dbconnect } from "./DB/_db.js"
import dotenv from 'dotenv'

const PORT = process.env.PORT || 8000
dotenv.config()


dbconnect().then(() => {
    console.log("Connected to database");
    app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`))
}).catch((err) => console.log(err))


