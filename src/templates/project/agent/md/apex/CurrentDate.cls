public with sharing class CurrentDate {
    // Make this method available for grounding
    // the Local Events prompt template.
    @InvocableMethod()
    public static List<Response> getCurrentDate(List<Request> requests) {
        Request input = requests[0];

        // Get current time in GMT
        DateTime nowGmt = System.now();
        // Get the desired time zone (e.g., 'America/New_York')
        TimeZone tz = TimeZone.getTimeZone('America/New_York');
        // Convert to the desired time zone
        DateTime nowInTz = nowGmt.addSeconds(tz.getOffset(nowGmt) / 1000);
        // Get the date part in that time zone
        Date easternDate = nowInTz.date();
        // Format the date using a DateTime at the start of that day in the desired time zone
        DateTime easternStartOfDay = DateTime.newInstance(easternDate, Time.newInstance(0, 0, 0, 0));
        String currentDate = easternStartOfDay.format('EEEE, MMMM d, yyyy', 'America/New_York');
        // Create expected response
        List<Response> responses = new List<Response>();
        Response res = new Response();
        res.Prompt = currentDate;
        responses.add(res);
        return responses;
    }

    // The variables in this class need to match the prompt template inputs,
    // that may be different on each prompt template
    public class Request {
        @InvocableVariable(required=false)
        public String Event_Type;
    }

    public class Response {
        @InvocableVariable
        public String Prompt;
    }
}