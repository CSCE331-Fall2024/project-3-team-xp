import informationIcon from '../assets/informationIcon.png';

/**
 * Represents an item button component
 * @param {string} name - Name of the item
 * @param {string} img - URL of the item's image
 * @param {boolean} selectEnabled - Whether the item can be selected
 * @param {boolean} isSelected - Whether the item is currently selected
 * @param {number} calories - Calories of the item
 * @param {function} onInfoClick - Function to handle info icon click
 * @param {boolean} hasAllergens - Whether the item has allergens
 */
const MenuItem = ({ name, img, selectEnabled, isSelected, calories, onInfoClick, hasAllergens }) => {
    const size = 150;

    return (
        <div className="relative flex flex-col dark:bg-white items-center border-2 rounded-md" style={{ width: size, height: size + 40, borderColor: isSelected ? "green" : "gray" }}>
            <div
                className="flex items-center justify-center"
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
            {hasAllergens && (
                <img
                    src={informationIcon}
                    alt="Info"
                    className="absolute top-1 right-1 cursor-pointer"
                    style={{ width: 20, height: 20 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onInfoClick();
                    }}
                />
            )}
            <div className="text-center p-1">
                <span className="text-sm font-serif">{name}</span>
                <br />
                {calories && <span className="text-xs text-gray-500">{calories} cal</span>}
            </div>
        </div>
    );
};

export default MenuItem;