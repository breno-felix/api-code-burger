import express from "express"
import routes from "./routes"
import connectMongoDB from "./database/database"

class App {
    constructor(){
        this.app = express()

        this.database()
        this.middlewares()
        this.routes()
    }

    database(){
        connectMongoDB()
    }

    middlewares(){
        this.app.use(express.json())
    }

    routes(){
        this.app.use(routes)
    }
}

export default new App().app