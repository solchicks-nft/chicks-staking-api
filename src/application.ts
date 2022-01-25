import {Application} from 'express';
import express = require('express');
import {logger} from './services/winston';

/**
 * Primary Class that constructs all of the parts of the Express server
 */
export class App {
  public app: Application;

  /**
   * @param port Port Application listens on
   * @param middleware Array of middleware to be applied to app
   * @param routes Array of express.Router objects for application routes
   * @param apiPath Base path for this api that will be prepended to all routes
   */
  constructor(
    private port: number,
    middleware: Array<any>,
    routes: Array<express.Router>,
    private apiPath: string = '/',
  ) {
    this.app = express();
    this.middleware(middleware);
    this.routes(routes);
  }

  /**
   * @param mware Array of middlewares to be loaded into express app
   */
  private middleware(mware: any[]) {
    mware.forEach((m) => {
      this.app.use(m);
    });
  }

  public addMiddleWare(middleWare: any) {
    this.app.use(middleWare);
  }

  /**
   * Attaches route objects to app, appending routes to `apiPath`
   * @param routes Array of router objects to be attached to the app
   */
  private routes(routes: Array<express.Router>) {
    routes.forEach((r) => {
      this.app.use(`${this.apiPath}`, r);
    });
  }

  /**
   * Start the Express app
   */
  public listen() {
    this.app.listen(this.port, () => {
      logger.debug(`app listening on port ${JSON.stringify(this.port)}`);
    });
  }
}
