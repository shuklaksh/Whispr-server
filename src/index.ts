import { serverInit } from "./app";
import dotenv from 'dotenv';
dotenv.config();

async function init(){
    const PORT = 8080;
    const app = await serverInit()

    app.listen(PORT,()=>{console.log("server started")})
}

init();