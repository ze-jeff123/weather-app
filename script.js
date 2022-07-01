const info = fetch("https://api.openweathermap.org/data/2.5/weather?q=Bucharest&APPID=d5e3dc7863b8b7e4a6697fff3ea4fbea", { mode: 'cors' });



///this returns a promise that holds only the needed information
function getWeatherInfo(location) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=d5e3dc7863b8b7e4a6697fff3ea4fbea`, { mode: 'cors' })
        .then((value) => {
            if (value.ok === false) {
                throw new Error("Fetch request not ok")
            }
            return value.json();
        })
        .then((value) => {
            return {
                tempKelvin: value.main.temp,
                description: value.weather[0].main,
                imgId: value.weather[0].icon,
                visibility: value.visibility,
                humidity: value.main.humidity,
                wind: value.wind.speed,
            };
        })
}

const wrapper = document.querySelector(".wrapper");
const checkbox = document.querySelector("#checkbox");
const currentCity = document.querySelector(".city-name");
const weatherImg = document.querySelector(".weather-img");
const description = document.querySelector(".description");
const temperature = document.querySelector(".temperature");
const fahrenheitButton = document.querySelector(".fahrenheit");
const celsiusButton = document.querySelector(".celsius");
const visibility = document.querySelector(".visibility");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");
const form = document.querySelector(".city-form");
const cityInput = document.querySelector("#location");
const body = document.querySelector("body");

function getGif(searchTerm) {
    return fetch(`https://api.giphy.com/v1/gifs/search?api_key=kQjwnpnZoAVgjNICk8DL6pXcv98UG4pZ&q=${searchTerm + " weather"}&limit=25&offset=0&rating=g&lang=en`, { mode: 'cors' })
        .then((value) => {
            return value.json();
        })
        .then((value) => {
            const imgIndex = Math.floor(Math.random() * 3 + 1);
            return value.data[imgIndex].images.original.url;
        });
}

function loadImage(searchTerm) {
    getGif(searchTerm).then((value) => {
        wrapper.style["background-image"] = `url(${value})`;
    })
}

function getWeatherImageUrl(imgId) {
    return `https://openweathermap.org/img/wn/${imgId}@2x.png`;
}


const state = {
    displayBackground: true,
    weatherInfo: null,
    currentCityName: 'Romania',
    tempFormat: "celsius",
}

function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

function kelvinToFahrenheit(kelvin) {
    return 1.8 * (kelvin - 273) + 32;
}

function formatTemperature(kelvin, format) {
    if (format === 'celsius') {
        return kelvinToCelsius(kelvin);
    } else if (format === 'fahrenheit') {
        return kelvinToFahrenheit(kelvin);
    }
}

function mPerSecondTokmPerHour(mPerSecond) {
    return mPerSecond * 3.6;
}
function render(state) {
    // Render background GIF
    if (state.displayBackground) {
        loadImage(state.weatherInfo.description);
    } else {
        wrapper.style['background-image'] = "";
    }

    ///render current city
    currentCity.textContent = state.currentCityName;

    ///render weather display
    weatherImg.src = getWeatherImageUrl(state.weatherInfo.imgId);
    description.textContent = state.weatherInfo.description;
    temperature.textContent = Math.round(formatTemperature(state.weatherInfo.tempKelvin, state.tempFormat));

    visibility.textContent = `Visibility:  ${state.weatherInfo.visibility}m`;
    humidity.textContent = `Humidity: ${state.weatherInfo.humidity}%`;
    wind.textContent = `Wind: ${mPerSecondTokmPerHour(state.weatherInfo.wind).toFixed(2)}km/h`;
    if (state.tempFormat === 'celsius') {
        celsiusButton.classList.add('selected');
        fahrenheitButton.classList.remove('selected');
    } else {
        celsiusButton.classList.remove('selected');
        fahrenheitButton.classList.add('selected');
    }
}

checkbox.addEventListener('click', () => {
    state.displayBackground = !state.displayBackground;
    render(state);
});

fahrenheitButton.addEventListener('click', () => {
    if (state.tempFormat !== 'fahrenheit') {
        state.tempFormat = 'fahrenheit';
        render(state);
    }
});

celsiusButton.addEventListener('click', () => {
    if (state.tempFormat !== 'celsius') {
        state.tempFormat = 'celsius';
        render(state);
    }
});

function changeCity(newCityName) {
    state.currentCityName = newCityName;
    return getWeatherInfo(state.currentCityName)
        .then((value) => {
            state.weatherInfo = value;
            render(state);
        });
}
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCityName = cityInput.value;

    changeCity(newCityName).then(
        () => {
            cityInput.setCustomValidty("");
        },
        (error) => {
            cityInput.setCustomValidity("Not a valid location");
        }
    ).then(() => {
        if (e.target.checkValidity()) {
            e.target.reset();
        } else {
            e.target.reportValidity();
        }
    });
});

cityInput.addEventListener('change' , () => {
    cityInput.setCustomValidity("");
});
changeCity('Bucharest').then(() => {
    body.style.opacity = 1;
});
