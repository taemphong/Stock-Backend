import express from "express";
import indexRoutes from "./index.routes.js"
import cors from 'cors'; // Import cors


const app = express();
const port = process.env.PORT


// app.use(cors({
//     // origin: 'http://localhost:5173', // Allow requests from this specific origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
// }));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/stock/api", indexRoutes)

app.get("/stock/api", (req, res) => {
    res.status(200).send({ status: "success", message: `Server is Running Port ${port}` });
});

// app.use("/stock/api/b", indexRoutes)

// app.get("/stock/api/b", (req, res) => {
//     res.status(200).send({ status: "success", message: `Server is Running Port ${port}` });
// });


app.listen(port, () => {
    console.log(`Server Running AT ${port}`)
});