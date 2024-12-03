import { useEffect, useState } from 'react';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function ListPanelItems({ name, price, countMap, setCountMap }) {
    
    const incrementCounter = () => {
        setCountMap((prevMap) => new Map(prevMap.set(name, (prevMap.get(name) || 0) + 1)));
    };

    const decrementCounter = () => {
        setCountMap((prevMap) => {
            const currentCount = prevMap.get(name) || 0;
            if (currentCount > 0)
                currentCount == 1 ? prevMap.delete(name) : prevMap.set(name, currentCount - 1);
            return new Map(prevMap);
        });
    };

    return (
        <li className='bg-white text-black dark:bg-slate-700 dark:border-white dark:text-white border-black shadow-black border-2 m-2 flex justify-between items-center'>
            <span className='m-2'>{name} ${price.toFixed(2)}</span>
            <div>
                <button
                    className='bg-green-600 text-white border-black border-2 rounded p-1 shadow-black m-4'
                    onClick={incrementCounter}
                > +
                </button>
                <button
                    className='bg-red-600 text-black border-black border-2 rounded p-1 shadow-black m-4'
                    onClick={decrementCounter}
                > -
                </button>
                <span className='text-black dark:text-white m-2'> x{countMap.get(name) || 0}</span>
            </div>
        </li>
    )
}

function OrderDialog({ isOpen, onClose, totalPrice, onConfirmOrder, itemMap }) {
    const [customerName, setCustomerName] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [customerAccount, setCustomerAccount] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirmOrder(customerName, employeeName, customerAccount);
        onClose();
    };

    const OrderSummary = ({ name, quantity }) => {
        return (
            <li>{name} ... x{quantity}</li>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className='flex flex-col text-center bg-white dark:bg-slate-500 text-black dark:text-white border-black dark:border-white shadow-white border-2 rounded-md'>
                <h2>Confirm Order</h2>
                <p> Total: ${totalPrice.toFixed(2)}</p>
                <label>
                    Customer Name:
                    <input
                        className='border-black border-2 rounded-md m-2'
                        type='text'
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </label>
                <label>
                    Employee Name:
                    <input
                        className='border-black border-2 rounded-md m-2'
                        type='text'
                        value={employeeName}
                        onChange={(e) => { setEmployeeName(e.target.value) }}
                    />
                </label>
                <label>
                    Customer Account:
                    <input
                        className='border-black border-2 rounded-md m-2'
                        type='number'
                        value={customerAccount}
                        onChange={(e) => { setCustomerAccount(e.target.value) }}
                    />
                </label>
                <ul>
                    {Array.from(itemMap.entries()).map(([name, quantity]) => (
                        <OrderSummary name={name} quantity={quantity} key={name} />
                    ))}
                </ul>
                <div>
                    <button
                        className='bg-red-600 text-black border-black border-2 rounded p-1 shadow-black m-4'
                        onClick={onClose}
                    >Cancel
                    </button>
                    <button
                        className='bg-green-600 text-white border-black border-2 rounded p-1 shadow-black m-4'
                        onClick={handleConfirm}
                    >Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}



function CashierPanel() {

    //get three lists os current menu items, need price, name
    // input lists into the component
    // const menuItems = [ //replace with api call
    //     {name: 'rice', price: 1.40, category: 'Side'}, 
    //     {name: 'water', price: 0.00, category: 'Drink'},
    //     {name: 'chicken', price: 3.20, category: 'Entree'}, 
    //     {name: 'rangoons', price: 2.00, category: 'Appetizer'}
    // ];

    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`${VITE_BACKEND_URL}/api/menuitems/`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setMenuItems(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching menu items:", error)
            }
        };

        fetchMenuItems();
    }, [error]);

    const categorizedItems = {
        Entrees: [],
        Sides: [],
        Drinks: [],
        Appetizers: []
    };

    menuItems.forEach((item) => {
        switch (item.category) {
            case 'Entree':
                categorizedItems.Entrees.push(item);
                break;
            case 'Side':
                categorizedItems.Sides.push(item);
                break;
            case 'Drink':
                categorizedItems.Drinks.push(item);
                break;
            case 'Appetizer':
                categorizedItems.Appetizers.push(item);
                break;
            default:
                break;
        }
    })

    //state for quantity, dialog and prices
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [countMap, setCountMap] = useState(new Map());
    const [totalPrice, setTotalPrice] = useState(0);

    const handlePlaceOrder = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleConfirmOrder = (customerName, employeeName, customerAccount) => {
        console.log(`Total Order is $${totalPrice.toFixed(2)} for ${customerName}`)
        console.log(`The map count is ${JSON.stringify(Object.fromEntries(countMap))}`);

        const transactionData = {
            items: Object.fromEntries(countMap),
            customer: customerName,
            customer_id: customerAccount,
            employee: employeeName
        };

        console.log("Serialize data:", JSON.stringify(transactionData));

        fetch(`${VITE_BACKEND_URL}/api/transactions/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        }).then((data) => {
            console.log('Transaction successful:', data);
        }).catch((error) => {
            console.error('Error:', error);
        });

        setTotalPrice(0);
        setCountMap(new Map());
    };

    const priceMap = new Map(menuItems.map((item) => [item.menu_item_name, item.price]));

    useEffect(() => {

        let newTotal = 0;
        countMap.forEach((quantity, name) => {
            const itemPrice = priceMap.get(name) || 0;
            newTotal += quantity * itemPrice;
        });
        setTotalPrice(newTotal);

    }, [countMap, priceMap])

    const CategoryCard = ({ title, items, countMap, setCountMap }) => {
        return (
            <section className='h-96 overflow-x-hidden m-4 bg-white dark:bg-slate-800 border-black dark:border-white border-2 rounded-md text-red-600 shadow-black flex-1'>
                <h2 className='border-b-black dark:border-b-white border-2 m-2 text-center'>{title}</h2>
                <ul className='overflow-y-auto '>
                    {items.map((item) => (
                        <ListPanelItems
                            name={item.menu_item_name}
                            price={item.price}
                            countMap={countMap}
                            setCountMap={setCountMap}
                            key={item.menu_item_id}
                        />
                    ))}
                </ul>
            </section>
        );
    };

    return (
        <div>
            <h1 className='flex m-4 justify-center text-red-600 font-bold text-4xl'>Cashier</h1>
            <div className='flex flex-row space-x-4'>
                <CategoryCard
                    title="Entrees"
                    items={categorizedItems.Entrees}
                    countMap={countMap}
                    setCountMap={setCountMap}
                />
                <CategoryCard
                    title="Sides"
                    items={categorizedItems.Sides}
                    countMap={countMap}
                    setCountMap={setCountMap}
                />
                <CategoryCard
                    title="Drinks"
                    items={categorizedItems.Drinks}
                    countMap={countMap}
                    setCountMap={setCountMap}
                />
                <CategoryCard
                    title="Appetizers"
                    items={categorizedItems.Appetizers}
                    countMap={countMap}
                    setCountMap={setCountMap}
                />
            </div>
            <section className='flex justify-center'>
                <button
                    className='bg-green-600 text-white border-black border-2 rounded p-1 shadow-black m-4'
                    onClick={handlePlaceOrder}
                >Place Order</button>
            </section>

            <OrderDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                totalPrice={totalPrice}
                onConfirmOrder={handleConfirmOrder}
                itemMap={countMap}
            />
        </div>
    );
}

export default CashierPanel;