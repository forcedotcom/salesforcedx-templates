public with sharing class CheckWeather {
    @InvocableMethod(
        label='Check Weather'
        description='Check weather at the resort for a specific date'
    )
    public static List<WeatherResponse> getWeather(
        List<WeatherRequest> requests
    ) {
        // Retrieve the date for which we want to check the weather
        Datetime dateToCheck = (Datetime) requests[0].dateToCheck;

        WeatherService.Weather weather = WeatherService.getResortWeather(
            dateToCheck
        );
        // Create the response for Copilot
        WeatherResponse response = new WeatherResponse();
        response.minTemperature = weather.minTemperatureC;
        response.maxTemperature = weather.maxTemperatureC;
        response.temperatureDescription =
            'Temperatures will be between ' +
            weather.minTemperatureC +
            '°C (' +
            weather.minTemperatureF +
            '°F) and ' +
            weather.maxTemperatureC +
            '°C (' +
            weather.maxTemperatureF +
            '°F) at the resort.';
        return new List<WeatherResponse>{ response };
    }

    public class WeatherRequest {
        @InvocableVariable(
            required=true
            description='Date for which we want to check the temperature. The variable needs to be an Apex Date type with format yyyy-MM-dd.'
        )
        public Date dateToCheck;
    }

    public class WeatherResponse {
        @InvocableVariable(
            description='Minimum temperature in Celsius at the resort location for the provided date'
        )
        public Decimal minTemperature;
        @InvocableVariable(
            description='Maximum temperature in Celsius at the resort location for the provided date'
        )
        public Decimal maxTemperature;
        @InvocableVariable(
            description='Description of temperatures at the resort location for the provided date'
        )
        public String temperatureDescription;
    }
}
