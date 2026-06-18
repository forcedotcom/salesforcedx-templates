public with sharing class <%= apiName %> implements Database.Batchable<<%= sobjectType %>>, Database.RaisesPlatformEvents {

    public Database.QueryLocator start(Database.BatchableContext context) {
        return Database.getQueryLocator('SELECT Id FROM <%= sobjectType %>');
    }

    public void execute(Database.BatchableContext context, List<<%= sobjectType %>> scope) {

    }

    public void finish(Database.BatchableContext context) {

    }
}
