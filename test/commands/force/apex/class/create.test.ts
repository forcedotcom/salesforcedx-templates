import {test, expect} from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
import * as path from 'path';

// tslint:disable-next-line:no-var-requires
const assert = require ('yeoman-assert');
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('force-language-services', 'apexclass');

describe('apex class create tests', () => {
    // Command properly creates files
    describe('test apex class creation', () => {
    test
    .withOrg()
    .withProject()
    .stdout()
    .command(['force:apex:class:create', '--classname', 'foo'])
    .it ('should create foo class using DefaultApexClass template and default output directory', ctx => {
        console.log('end');
        assert.file(['foo.cls', 'foo.cls-meta.xml']);
        assert.fileContent(path.join(process.cwd(), 'foo.cls'), 'public with sharing class foo');
        });

    test
    .withOrg()
    .withProject()
    .stdout()
    .command(['force:apex:class:create', '--classname', 'foo', '--outputdir', 'testfolder', '--template', 'ApexException'])
    .it('should create foo class with a targetpath set', ctx => {
        assert.file([path.join('testfolder', 'foo.cls'), path.join('testfolder', 'foo.cls-meta.xml')]);
        assert.fileContent(path.join('testfolder', 'foo.cls'), 'public class foo extends Exception');
        });

    test
    .withOrg()
    .withProject()
    .stdout()
    .command(['force:apex:class:create', '--classname', 'foo', '--template', 'ApexException'])
    .it ('should override foo class using ApexException template', ctx => {
        assert.file(['foo.cls', 'foo.cls-meta.xml']);
        assert.fileContent('foo.cls', 'public class foo extends Exception');
        });

    test
    .withOrg()
    .withProject()
    .stdout()
    .command(['force:apex:class:create', '--classname', 'foo', '--outputdir', 'classes create'])
    .it ('should create foo class in custom folder name that has a space in it', ctx => {
        assert.file([path.join('classes create', 'foo.cls'), path.join('classes create', 'foo.cls-meta.xml')]);
        assert.fileContent('foo.cls', 'public class foo extends Exception');
        });
    });

    // Properly throws errors
    describe ('Check that all errors are thrown' , () => {
    test
    .withOrg()
    .withProject()
    .stderr()
    .command(['force:apex:class:create'])
    .it('should throw a missing classname error', ctx => {
        expect(ctx.stderr).to.contain('Missing required flag');
    });

    test
    .withOrg()
    .withProject()
    .stderr()
    .command(['force:apex:class:create', '--classname', '/a'])
    .it('should throw invalid non alphanumeric class name error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('AlphaNumericNameError'));
    });

    test
    .withOrg()
    .withProject()
    .stderr()
    .command(['force:apex:class:create', '--classname', '3aa'])
    .it('should throw invalid class name starting with numeric error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('NameMustStartWithLetterError'));
    });

    test
    .withOrg()
    .withProject()
    .stderr()
    .command(['force:apex:class:create', '--classname', 'a_'])
    .it('should throw invalid class name ending with underscore error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('EndWithUnderscoreError'));
    });

    test
    .withOrg()
    .withProject()
    .stderr()
    .command(['force:apex:class:create', '--classname', 'a__a'])
    .it('should throw invalid class name with double underscore error', ctx => {
        expect(ctx.stderr).to.contain(messages.getMessage('DoubleUnderscoreError'));
    });
    });
});

// // Check that foo class is created with given api version

// // Check that foo class is created with json output

// // Check that help output work properly
