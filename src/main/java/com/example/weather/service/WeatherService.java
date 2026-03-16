package com.example.weather.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    @Value("${openweathermap.api.key}")
    private String apiKey;

    @Value("${openweathermap.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public WeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Object getWeatherByCity(String city) {
        // Tạo URL gọi API, dùng units=imperial để lấy độ F
        String url = String.format("%s?q=%s&appid=%s&units=imperial", apiUrl, city, apiKey);

        // Trả về thẳng object JSON từ OpenWeatherMap
        return restTemplate.getForObject(url, Object.class);
    }
}