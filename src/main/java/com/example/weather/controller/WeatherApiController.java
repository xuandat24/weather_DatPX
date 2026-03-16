package com.example.weather.controller;

import com.example.weather.service.WeatherService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class WeatherApiController {

    private final WeatherService weatherService;

    // Phải có dòng này thì Java mới biết apiKey lấy từ đâu
    @Value("${openweathermap.api.key}")
    private String apiKey;

    public WeatherApiController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/api/weather")
    public Object getWeather(@RequestParam(defaultValue = "Hanoi") String city) {
        return weatherService.getWeatherByCity(city);
    }

    @GetMapping("/api/forecast")
    public ResponseEntity<?> getForecast(@RequestParam String city) {
        String url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey + "&units=imperial";
        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(result);
    }
}