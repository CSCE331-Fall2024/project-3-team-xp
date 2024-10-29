import { useState } from "react";

/**
 * Represents an item button component
 * @param {string} name - Name of the item
 * @param {string} img - URL of the item's image
 * @param {number} price - Price of the item
 * @param {boolean} selectEnabled - Whether the item can be selected
 * @param {boolean} isSelected - Whether the item is currently selected
 */
const MenuItem = ({ name, img, price, selectEnabled, isSelected }) => {
    const size = 150;

    // Format the name for display with line breaks
    const formattedName = name;

    return (
        <div className="relative flex flex-col items-center">
            {/* Button with image background */}
            <button
                className={`flex items-center justify-center border-2 rounded-md ${isSelected ? "border-green-500" : "border-gray-500"}`}
                style={{
                    width: size,
                    height: size,
                    backgroundImage: `url(${img})`,
                    backgroundSize: `${(2 * size) / 3}px ${(2 * size) / 3}px`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
                onClick={selectEnabled ? () => {} : null}
            />
            {/* Label with item name */}
            <div className="absolute bottom-0 text-center p-1">
                <span className="text-sm font-serif">{formattedName}</span>
            </div>
        </div>
    );
};

export default MenuItem;