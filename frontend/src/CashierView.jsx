import react, {useEffect, useState} from 'react';
import './CashierView.css';
import './../dist/styles.css';

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
        <li className='item-card'>
            <span>{name} ${price}</span>
            <div>
                <button className='green-button' onClick={incrementCounter}> + </button>
                <button className='red-button' onClick={decrementCounter}> - </button>
                <span className='text-black'> x{countMap.get(name) || 0}</span>
            </div>
        </li>
    )
}

function OrderDialog({isOpen, onClose, totalPrice, onConfirmOrder, itemMap}){
    const [name, setName] = useState('');

    if(!isOpen){
        return null;
    }

    const handleConfirm = () =>{
        onConfirmOrder(name);
        onClose();
    };

    const OrderSummary = ({name, quantity}) =>{
        return(
            <li>{name} ... x{quantity}</li>
        );
    };

    return (
        <div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className='dialog-card'>
                <h2>Confirm Order</h2>
                <p> Total: ${totalPrice.toFixed(2)}</p>
                <label>
                    Name:
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <ul>
                {Array.from(itemMap.entries()).map(([name, quantity]) => (
                    <OrderSummary name={name} quantity={quantity} key={name} />
                ))}
                </ul>
                <div>
                    <button className='red-button' onClick={onClose}>Cancel</button>
                    <button className='green-button' onClick={handleConfirm}>Confirm</button>
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
            <h1 className='m-4'>Cashier</h1>
            <div className='columns-4'>
                <section className='category-card'>
                    <h2 className='border-b-black border-2 m-2'>Entrees</h2>
                    <ul className='overflow-scroll'>
                        {categorizedItems.Entrees.map((item) => (
                            <ListPanelItems name={item.name} price={item.price} 
                            countMap={countMap} setCountMap={setCountMap} key={item.name}/>
                        ))}
                    </ul>
                </section>
                <section className='category-card'>
                    <h2 className='border-b-black border-2 m-2'>Sides</h2>
                    <ul className='overflow-scroll'>
                        {categorizedItems.Sides.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            countMap={countMap} setCountMap={setCountMap} key={item.name}/>
                        ))}
                    </ul>
                </section>
                <section className='category-card'>
                    <h2 className='border-b-black border-2 m-2'>Drinks</h2>
                    <ul className='overflow-scroll'>
                        {categorizedItems.Drinks.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            countMap={countMap} setCountMap={setCountMap} key={item.name}/>
                        ))}
                    </ul>
                </section>
                <section className='category-card'>
                    <h2 className='border-b-black border-2 m-2'>Appetizers</h2>
                    <ul className='overflow-scroll'>
                        {categorizedItems.Appetizers.map((item) => (
                            <ListPanelItems name={item.name} price={item.price}
                            countMap={countMap} setCountMap={setCountMap} key={item.name}/>
                        ))}
                    </ul>
                </section>
            </div>
            <section>
                <button className='green-button' onClick={handlePlaceOrder}>Place Order</button>
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