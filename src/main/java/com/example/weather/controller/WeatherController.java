package com.example.weather.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WeatherController {

    @GetMapping("/")
    public String index() {
        // Mặc định Spring Boot sẽ tìm file index.html trong thư mục tĩnh (static)
        return "index.html";
    }
}