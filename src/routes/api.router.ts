import express = require('express');

export const apiRouter = express.Router();

import {homeController} from '../controllers/controllers.module';

const base = '';

apiRouter.get(`${base}/status`, (req, res) =>
  homeController.serverStatus(req, res),
);

apiRouter.get(`${base}/stake`, (req, res) => homeController.stake(req, res));

apiRouter.get(`${base}/unstake`, (req, res) =>
  homeController.unstake(req, res),
);

apiRouter.get(`${base}/list`, (req, res) =>
  homeController.stake_list(req, res),
);
