import React, { useState, useEffect } from "react";
import axios from "axios";








const MenuBoard = () => {


    const [currTemperature, setTemperature] = useState(null);
    const [weatherCondition, setWeatherCondition] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(null);
    const [lowTemperature, setLow] = useState(null);
    const [highTemperature, setHigh] = useState(null);

  
    const menuItems = [
        { name: "Orange Chicken", nutrition: "Calories: 490", imgPath: "/src/assets/OrangeChicken.png" },
        { name: "Beijing Beef", nutrition: "Calories: 480", imgPath: "/src/assets/BeijingBeef.png" },
        { name: "Honey Walnut Shrimp", nutrition: "Calories: 360", imgPath: "/src/assets/HoneyWalnutShrimp.png" },
        { name: "Kung Pao Chicken", nutrition: "Calories: 290", imgPath: "/src/assets/KungPaoChicken.png" },
        { name: "Broccoli Beef", nutrition: "Calories: 150", imgPath: "/src/assets/BroccoliBeef.png" },
        { name: "Mushroom Chicken", nutrition: "Calories: 220", imgPath: "/src/assets/MushroomChicken.png" },
        { name: "Grilled Teriyaki Chicken", nutrition: "Calories: 300", imgPath: "/src/assets/GrilledTeriyakiChicken.png" },
        { name: "Honey Sesame Chicken", nutrition: "Calories: 380", imgPath: "/src/assets/HoneySesameChickenBreast.png" }
    ];

    const options = [
        {
            name: "Bowl",
            description: "Includes 1 Entree + 1 Side",
            imgPath: "/src/assets/bowl.png"
        },
        {
            name: "Plate",
            description: "Includes 2 Entrees + 1 Side",
            imgPath: "/src/assets/plate.png"
        },
        {
            name: "Bigger Plate",
            description: "Includes 3 Entrees + 1 Side",
            imgPath: "/src/assets/bigPlate.png"
        }
    ];
    


    useEffect(() => {
        // Replace with your API key
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const city = "College Station"; // Change to the city you want

        // Fetch the weather data from WeatherAPI
        axios
            .get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1`)
            .then((response) => {
                const currentWeather = response.data.current;
                const forecastWeather = response.data.forecast ? response.data.forecast.forecastday[0].day : null;

                setTemperature(currentWeather.temp_f);
                setWeatherCondition(currentWeather.condition.text);
                setWeatherIcon(currentWeather.condition.icon);

                // Check if forecast data is available before setting low and high temperatures
                if (forecastWeather) {
                    setLow(forecastWeather.mintemp_f);
                    setHigh(forecastWeather.maxtemp_f);
                } else {
                    console.error("Forecast data is unavailable.");
                }
            })
            .catch((error) => {
                console.error("Error fetching weather data: ", error);
            });

    }, []);

    const getWeatherImage = () => {
        // Set different image based on the weather condition
        if (!weatherCondition) return null;

        if (weatherCondition.includes("Sunny")) {
            return "path/to/sunny-image.png"; // Replace with actual image path
        } else if (weatherCondition.includes("Rain")) {
            return "path/to/rainy-image.png"; // Replace with actual image path
        } else if (weatherCondition.includes("Cloudy")) {
            return "path/to/cloudy-image.png"; // Replace with actual image path
        }
        // Add more conditions as necessary...
        return "path/to/default-weather-image.png";
    };
    

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Section */}
            <div className="flex-1 grid grid-cols-2 gap-2 p-4">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-2 flex flex-col items-center text-center"
                        style={{ fontSize: "1vw" }}
                    >
                        <img
                            src={item.imgPath}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-full mb-2"
                        />
                        <h2 className="text-lg font-bold">{item.name}</h2>
                        <p className="text-sm text-gray-600">{item.nutrition}</p>
                    </div>
                ))}
            </div>

            {/* Black Bar Separator */}
            <div className="w-1 bg-black" />

            {/* Right Section */}
            <div className="flex-1 flex flex-col h-1/2">
                {/* Top Half */}
                <div className="flex-1 grid grid-cols-3 gap-2 p-4">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="border border-gray-300 rounded-lg p-4 flex items-center"
                            style={{ fontSize: "1.5vw" }}
                        >
                            <img
                                src={option.imgPath}
                                alt={option.name}
                                className="w-16 h-16 object-cover rounded-lg mr-4"
                            />
                            <div className="flex flex-col justify-center">
                                <h2 className="text-lg font-semibold">{option.name}</h2>
                                <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Half */}
                <div className="border-t border-gray-400 p-4">
                    <h2 className="text-xl font-bold mb-4">Seasonal Menu Item</h2>
                    <div className="w-full bg-gradient-to-r from-blue-400 to-blue-300 text-white rounded-lg shadow-md p-4 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold mb-2">Current Weather</h3>

                            {currTemperature !== null && weatherCondition !== null ? (
                                <>
                                    {/* Current Temperature Section */}
                                    <div className="mb-4">
                                        <p className="text-4xl font-bold">{currTemperature}°F</p>
                                    </div>

                                    {/* Weather Icon and Condition */}
                                    <div className="flex items-center justify-center mb-4">
                                        <img
                                            src={`https:${weatherIcon}`}
                                            alt={weatherCondition}
                                            className="w-16 h-16 mr-2"
                                        />
                                        <p className="text-lg capitalize">{weatherCondition}</p>
                                    </div>

                                    {/* High and Low Temperature Section */}
                                    <div className="flex justify-around text-center text-lg">
                                        <div>
                                            <p className="font-semibold">High</p>
                                            <p className="text-xl">{highTemperature}°F</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Low</p>
                                            <p className="text-xl">{lowTemperature}°F</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-lg">Loading...</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MenuBoard;
