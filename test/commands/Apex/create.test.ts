import { Messages } from '@salesforce/core';
import * as chai from 'chai';
import * as path from 'path';
import ApexClassCreateGenerator from '../../../src/commands/force/apex/class/apexclasscreategenerator';

const expect = chai.expect;
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apexclass');

// Check that foo class is created with default api version

// Check that foo class is created with a targetpath set

// Check that foo class is created with absolute targetpath set

// Check that foo class is created with given api version

// Check that foo class is created overring exisisting identical class

// Check that foo class is created overriding existing different class

// Check that foo class is created with json output

// Check that foo class can be created in a custom folder name that has a space in it

// Check that flags work properly

// Check that all the check input issues are thrown

// tslint:disable-next-line:only-arrow-functions
describe('apexcreate failure set', function() {
    it('invalid non alphanumeric class name', async function(): Promise<void> {
        this.classname = 'a&a';
        try {
            const yeoman = require('yeoman-environment');
            const env = yeoman.createEnv();

            env.registerStub(ApexClassCreateGenerator, 'apexclassgenerator');
            this.log('target dir =' + path.join(process.cwd() , this.flags.outputdir));
            env.run('apexclassgenerator', this.flags);
        } catch (err) {
            expect(err.message).equal(messages.getMessage('AlphaNumericNameError'));
            return;
        }
        // tslint:disable-next-line:no-unused-expression
        expect('did not throw error').false;
    });
});
