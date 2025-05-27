import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";

const WeatherContext = createContext();

const API_KEY = "14560b284589a2019c898a497a9bff1d"; // Replace with your OpenWeatherMap API Key

const WeatherProvider = ({ children }) => {
  const [city, setCity] = useState(
    localStorage.getItem("lastCity") || "London"
  );
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error("City not found");
      const data = await response.json();
      setWeatherData(data);
      setError(null);
      localStorage.setItem("lastCity", city);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [city]);

  return (
    <WeatherContext.Provider value={{ city, setCity, weatherData, error }}>
      {children}
    </WeatherContext.Provider>
  );
};

const SearchBar = () => {
  const { setCity } = useContext(WeatherContext);
  const [input, setInput] = useState("");

  const handleSearch = () => {
    if (input) setCity(input);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search city..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

const WeatherDisplay = () => {
  const { weatherData } = useContext(WeatherContext);

  if (!weatherData) return null;

  const { main, weather, wind, name } = weatherData;

  return (
    <div className="weather-display">
      <h2>{name}</h2>
      <p>{weather[0].description}</p>
      <p>Temperature: {main.temp} °C</p>
      <p>Humidity: {main.humidity} %</p>
      <p>Wind Speed: {wind.speed} m/s</p>
      <img
        src={`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
        alt="weather icon"
      />
    </div>
  );
};

const ErrorMessage = () => {
  const { error } = useContext(WeatherContext);
  return error ? <div className="error-message">{error}</div> : null;
};

function App() {
  return (
    <WeatherProvider>
      <div className="App">
        <h1>Weather Dashboard</h1>
        <SearchBar />
        <ErrorMessage />
        <WeatherDisplay />
      </div>
    </WeatherProvider>
  );
}

export default App;
