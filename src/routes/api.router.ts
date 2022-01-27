import express = require('express');

export const apiRouter = express.Router();

import {homeController} from '../controllers/controllers.module';

const base = '';

apiRouter.get(`${base}/status`, (req, res) =>
  homeController.serverStatus(req, res),
);

apiRouter.get(`${base}/stake_flex`, (req, res) =>
  homeController.stake_flex(req, res),
);

apiRouter.get(`${base}/unstake_flex`, (req, res) =>
  homeController.unstake_flex(req, res),
);

apiRouter.get(`${base}/list`, (req, res) =>
  homeController.stake_list(req, res),
);
