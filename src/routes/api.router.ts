import express = require('express');

export const apiRouter = express.Router();

import {
  flexibleStakingController,
  homeController,
  lockedStakingController,
} from '../controllers/controllers.module';

const base = '';

apiRouter.get(`${base}/status`, (req, res) =>
  homeController.serverStatus(req, res),
);

apiRouter.get(`${base}/flex_stake`, (req, res) =>
  flexibleStakingController.stake(req, res),
);

apiRouter.get(`${base}/flex_unstake`, (req, res) =>
  flexibleStakingController.unstake(req, res),
);

apiRouter.get(`${base}/flex_list`, (req, res) =>
  flexibleStakingController.list(req, res),
);

apiRouter.get(`${base}/locked_stake`, (req, res) =>
  lockedStakingController.stake(req, res),
);

apiRouter.get(`${base}/locked_unstake`, (req, res) =>
  lockedStakingController.unstake(req, res),
);
