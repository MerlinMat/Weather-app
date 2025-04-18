
let cityInput=document.getElementById('city_input');
searchBtn=document.getElementById('searchBtn');
const dropdownMenu = document.getElementById('dropdown-menu');
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
api_key='16def61af543e0fdeaac1b9f0fa18d3b';
currentWeatherCard=document.querySelectorAll('.weather-left .card')[0];
fiveDaysForecastCard=document.querySelector('.day-forecast');
humidityVal=document.getElementById('humidityVal');
pressureVal=document.getElementById('pressureVal');
visibilityVal=document.getElementById('visibilityVal');
windSpeedVal=document.getElementById('windSpeedVal');
feelsVal=document.getElementById('feelsVal');

function getWeatherDetails(name,lat,lon,country,state){
    
    let FORECAST_API_URL=`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
    WEATHER_API_URL=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
    days=[
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ],
    months=[
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec'
    ];
    fetch(WEATHER_API_URL).then(res=>res.json()).then(data=>{
        let date=new Date();
        currentWeatherCard.innerHTML=`
        <div class="current-weather flex justify-between items-center">
                        <div class="details">
                            <p>Now</p>
                            <h2>${(data.main.temp-273.15).toFixed(2)}&deg;C</h2>
                            <p>${data.weather[0].description}</p>
                        </div>
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                        </div>
                    </div>
                    <hr>
                    <div class="card-footer mb-2 mt-2">
                        <p><i class="fa-light fa-calendar"></i>${days[date.getDay()]},${date.getDate()},${months[date.getMonth()]},${date.getFullYear()}</p>
                        <p><i class="fa-light fa-location-dot"></i>${name},${country}</p>
                    </div>`;
    let {timezone,visibility}=data;
    let {humidity,pressure,feels_like}=data.main;
    let {speed}=data.wind;
    humidityVal.innerHTML=`${humidity}%`;
    pressureVal.innerHTML=`${pressure}hPa`;
    visibilityVal.innerHTML=`${visibility/1000}km`;
    windSpeedVal.innerHTML=`${speed}m/s`;
    feelsVal.innerHTML=`${(feels_like-273.15).toFixed(2)}&deg;C`;

    }).catch(()=>{
        alert(`Failed to fetch current weather`);
    });

    fetch(FORECAST_API_URL).then(res=>res.json()).then(data=>{
       let uniqueForecastDays=[];
       let fiveDaysForecast=data.list.filter(forecast=>{
        let forecastDate=new Date(forecast.dt_txt).getDate();
        if(!uniqueForecastDays.includes(forecastDate)){
            return uniqueForecastDays.push(forecastDate);
        }
       })
       fiveDaysForecastCard.innerHTML='';
       for(i=1;i<fiveDaysForecast.length;i++){
        let date=new Date(fiveDaysForecast[i].dt_txt);
        fiveDaysForecastCard.innerHTML+=`
        <div class="forecast-item grid grid-cols-3 mb-2 place-items-center">
                            <div class="icon-wrapper flex items-center">
                                <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                                <span>${(fiveDaysForecast[i].main.temp-273.15).toFixed(2)}&deg;C</span>
                            </div>
                            <p>${date.getDate()} ${months[date.getMonth()]}</p>
                            <p>${days[date.getDay()]}</p>
                        </div>
        `;
       }
    }).catch(()=>{
        alert(`Failed to fetch current weather forecast`);
    });

}

function getCityCoordinates(){
    let cityName=cityInput.value.trim();
   cityInput.value='';
   if(!cityName) return;

   // Add to recent cities if not already there
   if (!recentCities.includes(cityName)) {
    recentCities.unshift(cityName);
    
    // Keep only the last 5 cities
    if (recentCities.length > 5) {
        recentCities = recentCities.slice(0, 5);
    }
    
    // Save to localStorage
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
}

   let GEOCODING_API_URL=`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&
   limit=1&appid=${api_key}`;
   fetch(GEOCODING_API_URL).then(res=>res.json()).then(data=>{
    let {name,lat,lon,country,state}=data[0];
    getWeatherDetails(name,lat,lon,country,state);
   }).catch(()=>{
    alert(`Failed to fetch coordinates of ${cityName}`);
   });
}

searchBtn.addEventListener('click',getCityCoordinates);

cityInput.addEventListener('focus', function() {
    if (recentCities.length > 0) {
        updateDropdown();
        dropdownMenu.style.display = 'block';
    }
});

document.addEventListener('click', function(e) {
    if (e.target !== cityInput && e.target !== dropdownMenu) {
        dropdownMenu.style.display = 'none';
    }
});
// Add this function to update the dropdown menu
function updateDropdown() {
    dropdownMenu.innerHTML = '';
    
    if (recentCities.length === 0) {
        dropdownMenu.style.display = 'none';
        return;
    }
    
    recentCities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = city;
        item.addEventListener('click', function() {
            cityInput.value = city;
            dropdownMenu.style.display = 'none';
            // Trigger the search directly when a city is selected
            getCityCoordinates();
        });
        dropdownMenu.appendChild(item);
    });
}

// Initialize dropdown (hidden by default)
updateDropdown();
dropdownMenu.style.display = 'none';