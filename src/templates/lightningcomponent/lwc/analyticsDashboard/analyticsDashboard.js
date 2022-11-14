import { LightningElement, api } from 'lwc';

export default class <%= pascalCaseComponentName %> extends LightningElement {
  @api getState;
  @api setState;
  @api refresh;

  @api stateChangedCallback(prevState, newState) {}
}