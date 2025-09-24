import { useState } from 'react';
import './App.css'
import type { WeatherData } from './interface/weather.i';
import { CITY } from './interface/Constant';
const API_KEY = import.meta.env.VITE_API_KEY;
const WEATHER_URL = import.meta.env.VITE_WEATHER_URL;
const FORECAST_URL = import.meta.env.VITE_FORECAST_URL;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [weatherData, setWeatherData] = useState(null as WeatherData | null);
  const [forecast, setForecast] = useState([] as WeatherData[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const city: string = event.target.value;
    setSearchInput(city);
  }

  function handleSearchWeather(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleCallApiforecast(searchInput);
  }

  async function handleCallApiforecast(information: string) {
    const getWeatherUrl = WEATHER_URL.replace("{city_name}", information).replace("{VITE_API_KEY}", API_KEY);
    const getForecastUrl = FORECAST_URL.replace("{city_name}", information).replace("{VITE_API_KEY}", API_KEY);

    try {
      setLoading(true);
      const weatherResponse = await fetch(getWeatherUrl);
      const foreCastReposnse = await fetch(getForecastUrl);
      const data = await weatherResponse.json();
      const forecastData = await foreCastReposnse.json();

      if (data.cod === "404" || forecastData.cod === "404") {
        setError("Forecast data not found");
        setWeatherData(null);
        setForecast([]);
        return;
      }
      const formatForecast = forecastData.list.filter((_reading: WeatherData, index: number) => index % 8 === 0);

      setWeatherData(data);
      setForecast(formatForecast);
      setError("");
    } catch {
      setError("Error fetching weather data");
    } finally {
      setLoading(false);
      setSearchInput("");
    }
  }

  function converFahrenheitToCelsius(fahrenheit: number): number {
    return Math.round(fahrenheit - 273.15);
  }

  return (
    <>
      <div className="header-container">
        <h1 className="app-title">Weather App</h1>
      </div>
      <div className="wrapper">
        <form className="form" onSubmit={(e) => {handleSearchWeather(e)}}>
          <input type="text" className="search-input" placeholder='Enter city name' value={searchInput} onChange={handleInputChange}/>
          <button className="search-btn" type='submit'>Search</button>
        </form>
        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}
        {weatherData && weatherData.main &&(
          <>
            <div className="header">
              <h1 className="city">{CITY[weatherData.name] || weatherData.name}</h1>
              <p className="temperature">{converFahrenheitToCelsius(weatherData.main.temp)}°C</p>
              <p className="condition">{weatherData.weather[0].main}</p>
            </div>
            <div className="weather-details">
              <div >
                <p >Humidity</p>
                <p style={{fontWeight:"bold"}}>{Math.round(weatherData.main.humidity)}%</p>
              </div>
              <div>
                <p>Wind Speed</p>
                <p style={{fontWeight:"bold"}}>{Math.round(weatherData.wind.speed)} mph</p>
              </div>
            </div>
          </>
        )}
        {forecast.length > 0 && (
          <>
            <div className="forecast">
              <h2 className="forecast-header">5-Day Forecast</h2>
              <div className="forecast-days">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <p>
                      {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <img
                      src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt={day.weather[0].description}
                    />
                    <p>{converFahrenheitToCelsius(day.main.temp)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default App;
