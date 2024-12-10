import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRewards } from "../lib/RewardsContext";

export const discounts = (discount, price, order, entrees) => {
  let newPrice = price;
  let points = 0;

  if (discount === "10% Discount on Purchase") {
    newPrice = price * 0.9;
    points = 100;
  } else if (discount === "Spring Rolls" && "Spring Rolls" in order) {
    newPrice = price - 3.99;
    points = 200;
  } else if (discount === "Rangoons" && "Rangoons" in order) {
    newPrice = price - 10;
    points = 300;
  } else if (discount === "Large Fountain Drink" && "Fountain Drink" in order) {
    newPrice = price - 4;
    points = 400;
  } else if (discount === "Bottled Soda" && "Bottled Soda" in order) {
    newPrice = price - 4.50;
    points = 700;
  } else if (discount === "Chocolate Shake" && "Chocolate Shake" in order) {
    newPrice = price - 5;
    points = 700;
  } else if (discount === "BOGO Entree!") {
    const entreeCount = Object.keys(order).filter((key) => entrees.includes(key)).length;
    if (entreeCount >= 2) {
      newPrice = price - 12.99;
      points = 1500;
    }
  }

  return { newPrice, points };
};


const Rewards = () => {
  const { user } = useAuth();
  const { addAppliedReward } = useRewards();
  const navigate = useNavigate();
  let coins;
  // const [coins, setCoins] = useState(0);

  if (user) {
    // setCoins(user.current_points)
    coins = user.current_points;
  } else {
    navigate('/kiosk')
  }

  coins = 1500;

  const rewards = [
    { id: 1, name: "10% Discount on Purchase", cost: 100, available: coins >= 100, image: "💸" },
    { id: 2, name: "Spring Rolls", cost: 200, available: coins >= 200, image: "" },
    { id: 3, name: "Rangoons", cost: 300, available: coins >= 300, image: "" },
    { id: 4, name: "Large Fountain Drink", cost: 400, available: coins >= 400, image: "🥤" },
    { id: 5, name: "Bottled Soda", cost: 700, available: coins >= 700, image: "🧃" },
    { id: 6, name: "Shake", cost: 700, available: coins >= 700, image: "🥤" },
    { id: 8, name: "BOGO Entree!", cost: 1500, available: coins >= 1500, image: "🍽️" },
  ];

  const redeemReward = (reward) => {
    if (coins >= reward.cost) {
      addAppliedReward(reward.name);
      alert(`You redeemed: ${reward.name}`);
      navigate('/kiosk');
    } else {
      alert("Not enough coins!");
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 p-8">
      <div className="bg-green-800 text-white rounded-full py-2 px-6 mb-4 text-center">
        <p className="text-lg font-bold">You Have</p>
        <p className="text-3xl font-bold">{coins} Coins</p>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        Select an item below to use coins and unlock your perk!
      </h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">200 - 300 Coins</h3>
          <div className="grid grid-cols-3 gap-6">
            {rewards
              .filter((reward) => reward.cost <= 300)
              .map((reward) => (
                <RewardCard key={reward.id} reward={reward} redeemReward={redeemReward} coins={coins} />
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">400 - 700 Coins</h3>
          <div className="grid grid-cols-3 gap-6">
            {rewards
              .filter((reward) => reward.cost > 300 && reward.cost <= 700)
              .map((reward) => (
                <RewardCard key={reward.id} reward={reward} redeemReward={redeemReward} coins={coins} />
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">Premium Rewards</h3>
          <div className="grid grid-cols-3 gap-6">
            {rewards
              .filter((reward) => reward.cost > 700 && reward.cost <= 2000)
              .map((reward) => (
                <RewardCard key={reward.id} reward={reward} redeemReward={redeemReward} coins={coins} />
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const RewardCard = ({ reward, redeemReward, coins }) => {
  return (
    <div className="flex flex-col items-center bg-white shadow-md rounded-lg p-4">
      <div className="text-5xl mb-3">{reward.image}</div>

      <p className="text-lg font-semibold text-gray-800 mb-1">{reward.name}</p>

      <p className="text-sm text-gray-600 mb-4">{reward.cost} Coins</p>

      <button
        className={`px-4 py-2 rounded-full text-white ${reward.available ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-300 cursor-not-allowed"}`}
        disabled={!reward.available || coins < reward.cost}
        onClick={() => redeemReward(reward)}
      >
        Apply Reward
      </button>
    </div>
  );
};

export default Rewards;
