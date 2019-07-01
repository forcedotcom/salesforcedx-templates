import {test, expect} from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
// import { ensureJsonMap, ensureString } from '@salesforce/ts-types';
// import * as chai from 'chai';

Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('force-language-services', 'apexclass');

// // Check that foo class is created with default api version
describe('apexcreate success set', () => {
    test
    .stdout()
    .command(['force:apex:class:create', '--classname', 'foo', '--template', 'ApexException'])
    .it ('should create foo class with the default apiVersion'), ctx => {
        expect(ctx.stdout).to.contain('');
    };
    // parseInt(new (require('salesforce-alm/dist/lib/core/configApi').Config)().getApiVersion());

});
// // Check that foo class is created with a targetpath set

// // Check that foo class is created with absolute targetpath set

// // Check that foo class is created with given api version

// // Check that foo class is created overring exisisting identical class

// // Check that foo class is created overriding existing different class

// // Check that foo class is created with json output

// // Check that foo class can be created in a custom folder name that has a space in it

// // Check that flags work properly

// // Check that all the check input issues are thrown

describe('apexcreate failure set', () => {
    test
    .do(() => { test .command(['force:apex:class:create', '--classname', '/a']); } )
    .catch( err => expect(err).to.throw(new Error(messages.getMessage('AlphaNumericNameError'))))
    .end('invalid non alphanumeric class name');
});
