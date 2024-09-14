import { serverInit } from "./app";

async function init(){
    const PORT = 8080;
    const app = await serverInit()

    app.listen(PORT,()=>{console.log("server started")})
}

init();