document.addEventListener('DOMContentLoaded', function() {
    let currentWeatherData = null;
    let currentForecastData = null; // THÊM DÒNG NÀY

    // Bộ sưu tập hình nền đặc trưng
    const cityBackgrounds = {
        'Hanoi': 'https://images.unsplash.com/photo-1599739291060-4578e77dac5d?q=80&w=1920&auto=format&fit=crop', // Hà Nội
        'Tokyo': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1920&auto=format&fit=crop', // Tokyo
        'Paris': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1920&auto=format&fit=crop', // Paris
        'London': 'https://images.unsplash.com/photo-1513635269975-5969336cd100?q=80&w=1920&auto=format&fit=crop', // London
        'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1920&auto=format&fit=crop' // New York
    };

    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const tabs = document.querySelectorAll('.tab-btn');

    // ============================================
    // 1. CÁC HÀM GỌI API (FETCH)
    // ============================================

    function fetchWeatherData(city) {
        fetch(`/api/weather?city=${city}`)
            .then(response => {
                if (!response.ok) throw new Error("Không tìm thấy thành phố");
                return response.json();
            })
            .then(data => {
                currentWeatherData = data;
                updateUI(data);
                document.querySelector('[data-type="temp"]').click();
            })
            .catch(error => {
                console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
                alert("Lỗi: " + error.message);
            });
    }

    // Hàm gọi dự báo 5 ngày mới thêm
    function fetchForecastData(city) {
        fetch(`/api/forecast?city=${city}`)
            .then(response => {
                if (!response.ok) throw new Error("Không lấy được dự báo");
                return response.json();
            })
            .then(data => {
                currentForecastData = data; // Lưu lại dữ liệu dự báo để dùng lại khi bấm tab

                // Lấy tab hiện tại đang active (mặc định là temp)
                const activeTab = document.querySelector('.active-tab');
                const dataType = activeTab ? activeTab.getAttribute('data-type') : 'temp';

                updateHourlyForecast(data.list, dataType);
                updateDailyForecast(data.list);
            })
            .catch(error => console.error("Lỗi Forecast:", error));
    }

    // ============================================
    // 2. CÁC HÀM CẬP NHẬT GIAO DIỆN (UI)
    // ============================================

    function updateUI(data) {
        document.getElementById('city-name').innerText = `${data.name}, ${data.sys.country}`;
        let desc = data.weather[0].description;
        document.getElementById('weather-desc').innerText = desc.charAt(0).toUpperCase() + desc.slice(1);

        const countryCode = data.sys.country.toLowerCase();
        const flagImg = document.getElementById('country-flag');
        flagImg.src = `https://flagcdn.com/w40/${countryCode}.png`;
        flagImg.classList.remove('d-none');

        document.getElementById('side-humidity').innerText = `Humidity: ${data.main.humidity}%`;
        document.getElementById('side-wind').innerText = `Wind: ${data.wind.speed} mph`;
        document.getElementById('side-pressure').innerText = `Pressure: ${data.main.pressure} hPa`;

        // Tính năng đổi hình nền
        const cityName = data.name;
        const matchedCity = Object.keys(cityBackgrounds).find(key => key.toLowerCase() === cityName.toLowerCase());

        if (matchedCity) {
            document.body.style.backgroundImage = `url('${cityBackgrounds[matchedCity]}')`;
        } else {
            document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1920&auto=format&fit=crop')`;
        }
    }

    function getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'bi-sun-fill text-warning', '01n': 'bi-moon-stars-fill text-dark',
            '02d': 'bi-cloud-sun-fill text-secondary', '02n': 'bi-cloud-moon-fill text-secondary',
            '03d': 'bi-cloud-fill text-secondary', '03n': 'bi-cloud-fill text-secondary',
            '04d': 'bi-clouds-fill text-secondary', '04n': 'bi-clouds-fill text-secondary',
            '09d': 'bi-cloud-rain-heavy-fill text-primary', '09n': 'bi-cloud-rain-heavy-fill text-primary',
            '10d': 'bi-cloud-rain-fill text-primary', '10n': 'bi-cloud-rain-fill text-primary',
            '11d': 'bi-cloud-lightning-fill text-warning', '11n': 'bi-cloud-lightning-fill text-warning',
            '13d': 'bi-snow text-info', '13n': 'bi-snow text-info',
            '50d': 'bi-cloud-haze-fill text-secondary', '50n': 'bi-cloud-haze-fill text-secondary'
        };
        return iconMap[iconCode] || 'bi-cloud-fill text-secondary';
    }

    function updateHourlyForecast(list, dataType = 'temp') {
        const hourlyContainer = document.getElementById('hourly-forecast');
        hourlyContainer.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            let item = list[i];
            let date = new Date(item.dt * 1000);
            let timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

            let displayValue = '';
            let topIconClass = ''; // Icon nhỏ hiển thị trên con số
            let bottomIconClass = getWeatherIcon(item.weather[0].icon); // Icon thời tiết (Mây, mưa, nắng...)

            // Kiểm tra xem tab nào đang được chọn để lấy đúng dữ liệu
            if (dataType === 'temp') {
                displayValue = Math.round(item.main.temp) + '°';
                topIconClass = 'bi-thermometer-half text-danger';
            } else if (dataType === 'wind') {
                displayValue = Math.round(item.wind.speed) + ' mph';
                topIconClass = 'bi-wind text-secondary';
            } else if (dataType === 'precipitation') {
                // pop = Probability of precipitation (Tỉ lệ mưa từ 0 đến 1)
                let pop = Math.round((item.pop || 0) * 100);
                displayValue = pop + '%';
                topIconClass = 'bi-cloud-rain text-primary';
            } else {
                // UV, AQI, Sunset không có dữ liệu theo giờ trong API này
                displayValue = '-';
                topIconClass = 'bi-dash text-secondary';
            }

            hourlyContainer.innerHTML += `
                <div class="col px-2" style="min-width: 80px;">
                    <div class="text-muted small mb-2">${timeStr.toLowerCase()}</div>
                    <div class="mb-2 fw-bold">${displayValue}</div>
                    <i class="bi ${topIconClass} fs-5 d-block mb-1"></i>
                    <i class="bi ${bottomIconClass} fs-4"></i>
                </div>
            `;
        }
    }
    function updateDailyForecast(list) {
        const dailyContainer = document.getElementById('daily-forecast');
        dailyContainer.innerHTML = '';

        const daysData = {};
        list.forEach(item => {
            const dateStr = item.dt_txt.split(' ')[0];
            if (!daysData[dateStr]) daysData[dateStr] = [];
            daysData[dateStr].push(item);
        });

        const dates = Object.keys(daysData).slice(0, 6);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        dates.forEach((date, index) => {
            let items = daysData[date];
            let temps = items.map(i => i.main.temp);
            let maxTemp = Math.round(Math.max(...temps));
            let minTemp = Math.round(Math.min(...temps));

            let midDayItem = items[Math.floor(items.length / 2)];
            let iconClass = getWeatherIcon(midDayItem.weather[0].icon);

            let dateObj = new Date(date);
            let dayName = index === 0 ? 'Today' : dayNames[dateObj.getDay()];

            dailyContainer.innerHTML += `
                <div class="px-2" style="min-width: 60px;">
                    <div class="fw-bold mb-2">${dayName}</div>
                    <i class="bi ${iconClass} fs-3 mb-2 d-block"></i>
                    <div class="text-muted small">${maxTemp}° / ${minTemp}°</div>
                </div>
            `;
        });
    }

    // ============================================
    // 3. XỬ LÝ SỰ KIỆN (EVENTS)
    // ============================================

    // Hàm xử lý tìm kiếm chung
    function handleSearch() {
        let city = cityInput.value.trim();

        // Nếu ô tìm kiếm trống, tự động tìm Hà Nội
        if (city === "") {
            city = "Hanoi";
            cityInput.value = "Hanoi";
        }

        fetchWeatherData(city);
        fetchForecastData(city);
    }

    searchBtn.addEventListener('click', handleSearch);

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            if (!currentWeatherData) return;

            tabs.forEach(t => {
                t.classList.remove('active-tab', 'btn-primary');
                t.classList.add('btn-outline-secondary');
            });
            this.classList.remove('btn-outline-secondary');
            this.classList.add('active-tab', 'btn-primary');

            const dataType = this.getAttribute('data-type');
            const mainValue = document.getElementById('main-value');
            const mainUnit = document.getElementById('main-unit');
            const mainIcon = document.getElementById('main-icon');

            if (dataType === 'temp') {
                mainValue.innerText = Math.round(currentWeatherData.main.temp);
                mainUnit.innerText = '°F';
                mainIcon.className = 'bi bi-thermometer-half text-danger weather-main-icon me-3';
            }
            else if (dataType === 'wind') {
                mainValue.innerText = currentWeatherData.wind.speed;
                mainUnit.innerText = 'mph';
                mainIcon.className = 'bi bi-wind text-secondary weather-main-icon me-3';
            }
            else if (dataType === 'precipitation') {
                let rain = currentWeatherData.rain ? currentWeatherData.rain['1h'] : 0;
                mainValue.innerText = rain;
                mainUnit.innerText = 'mm';
                mainIcon.className = 'bi bi-cloud-rain text-primary weather-main-icon me-3';
            }
            else if (dataType === 'air_quality') {
                mainValue.innerText = 'N/A';
                mainUnit.innerText = 'AQI';
                mainIcon.className = 'bi bi-moisture text-info weather-main-icon me-3';
            }
            else if (dataType === 'uv_index') {
                mainValue.innerText = 'N/A';
                mainUnit.innerText = 'UVI';
                mainIcon.className = 'bi bi-sun text-warning weather-main-icon me-3';
            }
            else if (dataType === 'sunset') {
                let sunsetTime = new Date(currentWeatherData.sys.sunset * 1000);
                let hours = sunsetTime.getHours() % 12 || 12;
                let minutes = "0" + sunsetTime.getMinutes();

                mainValue.innerText = hours + ':' + minutes.substr(-2);
                mainUnit.innerText = 'PM';
                mainIcon.className = 'bi bi-sunrise text-warning weather-main-icon me-3';
            }
            if (currentForecastData) {
                updateHourlyForecast(currentForecastData.list, dataType);
            }
        });
    });

    // Mặc định gọi cả 2 API khi vừa vào web
    fetchWeatherData('Hanoi');
    fetchForecastData('Hanoi');
});