public with sharing class <%= apiName %> implements Queueable, Finalizer {

    public void execute(QueueableContext context) {
        System.attachFinalizer(this);
    }

    public void execute(FinalizerContext context) {
        if (context.getResult() == ParentJobResult.UNHANDLED_EXCEPTION ) {
           // handle failure
        }
    }
}
