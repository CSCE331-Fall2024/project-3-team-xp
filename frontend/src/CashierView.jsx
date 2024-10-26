import react, {useState} from 'react';

function ListPanelItems({name, price, onQuantityChange}){
    const [count, setCount] = useState(0);

    const incrementCounter = () => {
        setCount(count + 1);
        onQuantityChange(price); //notify other component of price change
    };

    const decrementCounter = () =>{
        if(count - 1 >= 0){
            setCount(count-1);
            onQuantityChange(-1 * price);
        }
    };

    return (
        <li class='item-panel'>
            <span>{name} ${price}</span>
            <div>
                <button onClick={incrementCounter}> + </button>
                <button onClick={decrementCounter}> - </button>
                <span> x{count}</span>
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

    const sides = [{name: 'rice', price: 1.40}];
    const drinks = [{name: 'water', price: 0.00}];
    const entrees = [{name: 'chicken', price: 3.20}];
    const appetizers = [{name: 'rangoons', price: 2.00}];

    //state for dialog and prices
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    };


    return (
        <div>
            <h1>Cashier</h1>
            <div>
                <section>
                    <h2>Entrees</h2>
                    <ul>
                        {entrees.map((item) => (
                            <ListPanelItems name={item.name} price={item.price} 
                            onQuantityChange={handleQuantityChange} />
                        ))}
                    </ul>
                </section>
                <section>
                    <h2>Sides</h2>
                    <ul>
                        {sides.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            onQuantityChange={handleQuantityChange} />
                        ))}
                    </ul>
                </section>
                <section>
                    <h2>Drinks</h2>
                    <ul>
                        {drinks.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            onQuantityChange={handleQuantityChange} />
                        ))}
                    </ul>
                </section>
                <section>
                    <h2>Appetizers</h2>
                    <ul>
                        {appetizers.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            onQuantityChange={handleQuantityChange} />
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