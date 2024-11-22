import { useState, useEffect } from 'react';
import axios from "axios";

import OrangeChicken from '../assets/OrangeChicken.png'
import BeijingBeef from '../assets/BeijingBeef.png'
import HoneyWalnutShrimp from '../assets/HoneyWalnutShrimp.png'
import KungPaoChicken from '../assets/KungPaoChicken.png'
import BroccoliBeef from '../assets/BroccoliBeef.png'
import MushroomChicken from '../assets/MushroomChicken.png'
import GrilledTeriyakiChicken from '../assets/GrilledTeriyakiChicken.png'
import HoneySesameChicken from '../assets/HoneySesameChickenBreast.png'
import Bowl from '../assets/bowl.png'
import Plate from '../assets/plate.png'
import BigPlate from '../assets/bigPlate.png'

const loadImage = async (item) => {
    if (item.category === 'Entree' || item.category === 'Side') {
        const formattedName = item.menu_item_name.replace(/\s+/g, '');
        try {
            console.log(formattedName);
            const img = (await import(`../assets/${formattedName}.png`)).default;
            console.log("fund image", item);
            return img;
        } catch (err) {
            console.warn(`Image not found for: ${formattedName}`, err);
        }
    }
    return (await import('../assets/placeHolderImage.jpg')).default;
};

const MenuBoard = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    const [currTemperature, setTemperature] = useState(null);
    const [weatherCondition, setWeatherCondition] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(null);
    const [lowTemperature, setLow] = useState(null);
    const [highTemperature, setHigh] = useState(null);


    const menuItems = [
        { name: "Orange Chicken", nutrition: "Calories: 490", img: OrangeChicken},
        { name: "Beijing Beef", nutrition: "Calories: 480", img: BeijingBeef },
        { name: "Honey Walnut Shrimp", nutrition: "Calories: 360", img: HoneyWalnutShrimp },
        { name: "Kung Pao Chicken", nutrition: "Calories: 290", img: KungPaoChicken },
        { name: "Broccoli Beef", nutrition: "Calories: 150", img: BroccoliBeef },
        { name: "Mushroom Chicken", nutrition: "Calories: 220", img: MushroomChicken },
        { name: "Grilled Teriyaki Chicken", nutrition: "Calories: 300", img: GrilledTeriyakiChicken },
        { name: "Honey Sesame Chicken", nutrition: "Calories: 380", img: HoneySesameChicken }
    ];

    const [seasonalMI, setSeasonalMI] = useState([]);
    const [seasonalImages, setSeasonalImages] = useState({});

    useEffect(() => {
        const getSeasonalMI = async () => {
            try {
                const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/seasonal`);
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();
                setSeasonalMI(data);

                const images = {};
                await Promise.all(data.map(async (item) => {
                    images[item.menu_item_name] = await loadImage(item);
                }));
                setSeasonalImages(images);
            }
            catch (err) {
                console.error("Error fetching menu items:", err);
            }
        };
        getSeasonalMI();
    }, []);

    const options = [
        {
            name: "Bowl",
            description: "Includes 1 Entree + 1 Side",
            img: Bowl
        },
        {
            name: "Plate",
            description: "Includes 2 Entrees + 1 Side",
            img: Plate
        },
        {
            name: "Bigger Plate",
            description: "Includes 3 Entrees + 1 Side",
            img: BigPlate
        }
    ];

    useEffect(() => {
        // Replace with your API key
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
    });

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Section */}
            <div className="flex flex-col w-1/2 p-4">
                <h2 className="text-2xl text-center font-bold">Popular Entrees</h2>
                <div className="flex-1 grid grid-cols-2 gap-2 p-4">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className="border border-gray-300 rounded-lg p-2 flex flex-col items-center text-center"
                            style={{ fontSize: "1vw" }}
                        >
                            <img
                                src={item.img}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-full mb-2"
                            />
                            <h2 className="text-lg font-bold">{item.name}</h2>
                            <p className="text-sm text-gray-600">{item.nutrition}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Black Bar Separator */}
            <div className="w-1 bg-black" />

            {/* Right Section */}
            <div className="flex-1 flex flex-col h-1/2">
                {/* Top Half */}
                <div className="flex-1 p-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Choose Your Meal Option</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className="border border-gray-300 rounded-lg p-4 flex items-center"
                                style={{ fontSize: "1.5vw" }}
                            >
                                <img
                                    src={option.img}
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
                </div>

                {/* Bottom Half */}
                <div className="flex-1 flex flex-col h-full p-4">
                    <div className="flex-1">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2">Seasonal Menu Items</h2>
                            {/* <p className="text-gray-600">Discover our latest seasonal selections</p> */}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {seasonalMI.map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-300 rounded-lg p-4 flex flex-col items-center text-center"
                                    style={{ fontSize: "1vw" }}
                                >
                                    <img
                                        src={seasonalImages[item.menu_item_name] || seasonalImages['placeholder']}
                                        alt={item.menu_item_name}
                                        className="w-16 h-16 object-cover rounded-full mb-2"
                                    />
                                    <h2 className="text-lg font-bold">{item.menu_item_name}</h2>
                                    <p className="text-sm text-gray-600">{item.nutrition}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full bg-gradient-to-r from-blue-400 to-blue-300 text-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center mt-4 space-y-4">
                        <h3 className="text-2xl font-semibold">Current Weather</h3>
                        {currTemperature !== null && weatherCondition !== null ? (
                            <div className='flex space-x-10'>
                                <div className="flex items-center justify-center space-x-4">
                                    <p className="text-4xl font-bold">{currTemperature}°F</p>
                                    <img
                                        src={`https:${weatherIcon}`}
                                        alt={weatherCondition}
                                        className="w-16 h-16"
                                    />
                                </div>

                                <p className="text-lg capitalize py-4">{weatherCondition}</p>

                                <div className="flex justify-around w-full text-center">
                                    <div>
                                        <p className="font-semibold">High</p>
                                        <p className="text-xl">{highTemperature}°F</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Low</p>
                                        <p className="text-xl">{lowTemperature}°F</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-lg">Loading...</p>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default MenuBoard;
