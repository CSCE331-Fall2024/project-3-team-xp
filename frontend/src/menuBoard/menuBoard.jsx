import {useState, useEffect} from 'react';

const loadImage = async (item) => {
    if (item.category === 'Entree' || item.category === 'Side') {
        const formattedName = item.menu_item_name.replace(/\s+/g, '');
        try {
            const img = (await import(`../assets/${formattedName}.png`)).default;
            console.log(img);
            return img;
        } catch (err) {
            console.warn(`Image not found for: ${formattedName}`, err);
        }
    }
    return (await import('../assets/placeHolderImage.jpg')).default;
};

const MenuBoard = () => {
    const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

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

    const [seasonalMI, setSeasonalMI] = useState([]);
    const [seasonalImages, setSeasonalImages] = useState({});

    useEffect(() =>{
        const getSeasonalMI = async () => {
            try{
                const response = await fetch(`http://${VITE_SERVER_URL}/api/menuitems/seasonal`);
                if(!response.ok) throw new Error(`Error: ${response.status}`);
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
                    <h2 className="text-xl font-bold mb-2">Seasonal Menu Item</h2>
                    {seasonalMI.map((item, index) => (
                        <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4 flex items-center"
                        style={{ fontSize: "1.5vw" }}
                        >
                            <div className="flex flex-col justify-center">
                                <h2 className="text-lg font-semibold">{item.menu_item_name}</h2>
                                <img
                                    src={seasonalImages[item.menu_item_name] || seasonalImages['placeholder']}
                                    // alt={item.menu_item_name}
                                    className="w-10 h-10 object-cover rounded-full mb-2"
                                />
                            </div>
                        </div>
                    ))}
                    <div className="w-full h-24 bg-gray-300" />
                </div>
            </div>
        </div>
    );
};

export default MenuBoard;
