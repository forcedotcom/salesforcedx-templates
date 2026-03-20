@isTest
private class WeatherServiceTest {
    @isTest
    static void getResortWeather_returnsMockData() {
        Datetime dateToCheck = Datetime.newInstance(2026, 7, 14);

        Test.startTest();
        WeatherService.Weather weather = WeatherService.getResortWeather(
            dateToCheck
        );
        Test.stopTest();

        Assert.areEqual(18.5, weather.minTemperatureC);
        Assert.areEqual(65.3, weather.minTemperatureF);
        Assert.areEqual(27.3, weather.maxTemperatureC);
        Assert.areEqual(81.1, weather.maxTemperatureF);
        Assert.isTrue(
            weather.description.contains('July 14'),
            'Description should contain the formatted date'
        );
    }
}
