import { test } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
// import * as path from 'path';
// import * as assert from 'yeoman-assert';

Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('force-language-services',
// 'lightningapp'
// );

describe('Lightning app creation tests:', () => {
    describe('Check lightning app creation', () => {
        test
        .withOrg()
        .withProject()
        .stdout()
        .command(['force:lightning:app:create', '--appname', 'foo', '--dirname']);
    });
});
