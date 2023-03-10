import { Response } from 'express';
import { getErrorMessage } from '../services/errors';

/**
 * Provides functions to be used with express routes. Serves common CRUD fuctionality.
 */
export class BaseController {
  public useModReturnNew = { useFindAndModify: false, new: true };

  constructor() {}

  addErrorMessage(doc: any) {
    const { success, error_code, ...others } = doc;
    if (!success && error_code) {
      return {
        success,
        error_code,
        error_message: getErrorMessage(error_code),
        ...others,
      };
    } else {
      return doc;
    }
  }
  /**
   * Sends the document as JSON in the body of response, and sets status to 200
   * @param doc the document to be returned to the client as JSON
   * @param res the response object that will be used to send http response
   */
  jsonRes(doc: any, res: Response) {
    res.status(200).json(this.addErrorMessage(doc));
  }

  /**
   * @param err error object of any type genereated by the system
   * @param message custom response message to be provided to the client in a JSON body response ({error:'message'})
   * @param res response object to be used to to send
   * @param status custom status code, defaults to 500
   */
  errRes(err: any, res: Response, message = 'Sever Error', status = 500) {
    res.status(status).json({ error: message });
  }
}
