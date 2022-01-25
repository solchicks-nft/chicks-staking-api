import {App} from './application';
import {middleware} from './middleware';
import {apiRouter} from './routes/api.router';

const port: number = Number(process.env.PORT) || 8080;
const app = new App(port, middleware, [apiRouter]);

app.listen();
