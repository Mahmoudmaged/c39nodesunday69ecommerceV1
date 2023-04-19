import chalk from 'chalk';
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })
import express from 'express'
import initApp from './src/index.router.js';
const app = express()
// setup port and the baseUrl
const port = process.env.PORT || 5000;

app.set('case sensitive routing', true);



initApp(app, express)

app.listen(port, () => {
    console.log(chalk.bgCyanBright('Example app listening on port', chalk.green(`${port}`)));
})