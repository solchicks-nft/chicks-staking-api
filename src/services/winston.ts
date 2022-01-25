import winston from 'winston';

const options = {
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: false,
  },
};

export const logger = winston.createLogger({
  transports: [new winston.transports.Console(options.console)],
  format: winston.format.combine(winston.format.simple()),
});
