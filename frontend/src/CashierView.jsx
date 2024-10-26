import react, {useEffect, useState} from 'react';

function ListPanelItems({name, price, countMap, setCountMap}){
    const incrementCounter = () => {
        setCountMap((prevMap) => new Map(prevMap.set(name, (prevMap.get(name) || 0) + 1)));
    };

    const decrementCounter = () =>{
        setCountMap((prevMap) => {
            const currentCount = prevMap.get(name) || 0;
            return new Map(prevMap.set(name, currentCount > 0 ? currentCount - 1 : 0));
        });
    };

    return (
        <li className='item-panel'>
            <span>{name} ${price}</span>
            <div>
                <button onClick={incrementCounter}> + </button>
                <button onClick={decrementCounter}> - </button>
                <span> x{countMap.get(name) || 0}</span>
            </div>
        </li>
    )
}

function OrderDialog({isOpen, onClose, totalPrice, onConfirmOrder}){
    const [name, setName] = useState('');

    if(!isOpen){
        return null;
    }

    const handleConfirm = () =>{
        onConfirmOrder(name);
        onClose();
    };

    return (
        <div>
            <div>
                <h2>Confirm Order</h2>
                <p> Total: ${totalPrice.toFixed(2)}</p>
                <label>
                    Name:
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <div>
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
}



function CashierPanel(){

    //get three lists os current menu items, need price, name
    // input lists into the component
    const menuItems = [ //replace with api call
        {name: 'rice', price: 1.40, category: 'Side'}, 
        {name: 'water', price: 0.00, category: 'Drink'},
        {name: 'chicken', price: 3.20, category: 'Entree'}, 
        {name: 'rangoons', price: 2.00, category: 'Appetizer'}
    ];

    const categorizedItems = {
        Entrees: [],
        Sides: [],
        Drinks: [],
        Appetizers: []
    };

    menuItems.forEach((item) => {
        switch(item.category){
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

    const handleQuantityChange = (price) =>{
        setTotalPrice(totalPrice + price);
    };

    const handlePlaceOrder = () =>{
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () =>{
        setIsDialogOpen(false);
    };

    const handleConfirmOrder = (name) =>{
        console.log(`Total Order is $${totalPrice.toFixed(2)} for ${name}`);
        setTotalPrice(0);
        setCountMap(new Map());
    };

    const priceMap = new Map(menuItems.map((item) => [item.name, item.price]));

    useEffect(()=>{
        let newTotal = 0;
        countMap.forEach((quantity, name) =>{
            const itemPrice = priceMap.get(name) || 0;
            newTotal += quantity * itemPrice;
        });
        setTotalPrice(newTotal);
    }, [countMap, priceMap])


    return (
        <div>
            <h1>Cashier</h1>
            <div>
                <section>
                    <h2>Entrees</h2>
                    <ul>
                        {categorizedItems.Entrees.map((item) => (
                            <ListPanelItems name={item.name} price={item.price} 
                            countMap={countMap} setCountMap={setCountMap}/>
                        ))}
                    </ul>
                </section>
                <section>
                    <h2>Sides</h2>
                    <ul>
                        {categorizedItems.Sides.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            countMap={countMap} setCountMap={setCountMap}/>
                        ))}
                    </ul>
                </section>
                <section>
                    <h2>Drinks</h2>
                    <ul>
                        {categorizedItems.Drinks.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            countMap={countMap} setCountMap={setCountMap}/>
                        ))}
                    </ul>
                </section>
                <section>
                    <h2>Appetizers</h2>
                    <ul>
                        {categorizedItems.Appetizers.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            countMap={countMap} setCountMap={setCountMap}/>
                        ))}
                    </ul>
                </section>
            </div>
            <section>
                <button onClick={handlePlaceOrder}>Place Order</button>
            </section>

            <OrderDialog
            isOpen={isDialogOpen}
            onClose={handleCloseDialog}
            totalPrice={totalPrice}
            onConfirmOrder={handleConfirmOrder}
            />
        </div>
    );
}

export default CashierPanel;