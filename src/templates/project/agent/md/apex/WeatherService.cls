public class WeatherService {
    /**
     * Gets the weather at the resort for the provided date.
     * Returns mocked weather data for demonstration purposes.
     */
    public static Weather getResortWeather(Datetime dateToCheck) {
        // Adjust the input date to the current year
        Integer currentYear = Date.today().year();
        Integer yearDelta = currentYear - dateToCheck.year();
        dateToCheck = dateToCheck.addYears(yearDelta);
        String dateString = dateToCheck.format('MMMM d');

        // Generate mock temperature data
        Decimal minTempC = 18.5;
        Decimal maxTempC = 27.3;
        Decimal minTempF = toFahrenheit(minTempC);
        Decimal maxTempF = toFahrenheit(maxTempC);
        String description =
            'On ' +
            dateString +
            ', temperature should be between ' +
            minTempC +
            '°C (' +
            minTempF +
            '°F) and ' +
            maxTempC +
            '°C (' +
            maxTempF +
            '°F) at the resort.';

        Weather weather = new Weather();
        weather.minTemperatureC = minTempC;
        weather.minTemperatureF = minTempF;
        weather.maxTemperatureC = maxTempC;
        weather.maxTemperatureF = maxTempF;
        weather.description = description;
        return weather;
    }

    private static Decimal toFahrenheit(Decimal celsius) {
        return (celsius * 9 / 5 + 32).setScale(1);
    }

    public class Weather {
        public Decimal minTemperatureC;
        public Decimal minTemperatureF;
        public Decimal maxTemperatureC;
        public Decimal maxTemperatureF;
        public String description;
    }
}
