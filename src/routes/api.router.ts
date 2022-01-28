import express = require('express');

export const apiRouter = express.Router();

import {homeController} from '../controllers/controllers.module';
import {flexController} from '../controllers/controllers.module';
import {lockController} from '../controllers/controllers.module';

const base = '';

apiRouter.get(`${base}/status`, (req, res) =>
  homeController.serverStatus(req, res),
);

apiRouter.get(`${base}/flex_stake`, (req, res) =>
  flexController.stake(req, res),
);

apiRouter.get(`${base}/flex_unstake`, (req, res) =>
  flexController.unstake(req, res),
);

apiRouter.get(`${base}/flex_list`, (req, res) =>
  flexController.list(req, res),
);

apiRouter.get(`${base}/locked_stake`, (req, res) =>
  lockController.stake(req, res),
);

apiRouter.get(`${base}/locked_stake`, (req, res) =>
  lockController.unstake(req, res),
);
