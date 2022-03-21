import { LightningElement, api } from 'lwc';

export default class <%= className %> extends LightningElement {
  @api getState;
  @api setState;
  @api refresh;
}