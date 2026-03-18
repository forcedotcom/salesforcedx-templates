@isTest
public class CurrentDateTest {
    @isTest
    static void testGetCurrentDate() {
        // Prepare a dummy request
        CurrentDate.Request req = new CurrentDate.Request();
        req.Event_Type = 'movies';
        List<CurrentDate.Request> requests = new List<CurrentDate.Request>{ req };

        // Call the invocable method
        List<CurrentDate.Response> responses = CurrentDate.getCurrentDate(requests);

        // Assert that the response is not null and contains one item
        System.assertNotEquals(null, responses, 'Responses should not be null');
        System.assertEquals(1, responses.size(), 'Should return one response');

        // Assert that the date string is not empty and matches expected format
        String prompt = responses[0].Prompt;
        System.assertNotEquals(null, prompt, 'Prompt should not be null');
        System.assert(prompt.contains(','), 'Prompt should contain a comma (e.g., Thursday, May 20, 2025)');
        System.debug('Returned Prompt: ' + prompt);
    }
}