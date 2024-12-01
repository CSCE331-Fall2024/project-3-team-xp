import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRewards } from "../lib/RewardsContext";


const Rewards = () => {
  const { user } = useAuth();
  const { appliedRewards, addAppliedReward } = useRewards(); // Access the context
  const navigate = useNavigate;
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
    // Appetizers
    { id: 1, name: "10% Discount on Purchase", cost: 100, available: coins >= 100, image: "💸" },
    { id: 2, name: "Spring Rolls", cost: 200, available: coins >= 200, image: "" },
    { id: 3, name: "Rangoons", cost: 300, available: coins >= 300, image: "" },

    // 400 - 700 Coins: Mid-tier rewards
    { id: 4, name: "Medium Fountain Drink", cost: 400, available: coins >= 400, image: "🥤" },
    { id: 5, name: "Bottled Drink", cost: 700, available: coins >= 700, image: "🧃" },
    { id: 6, name: "Shake", cost: 700, available: coins >= 700, image: "🥤" },

    // 1000 Coins: Premium Rewards
    { id: 7, name: "Free Entree", cost: 1000, available: coins >= 1000, image: "🍽️" },
    { id: 8, name: "BOGO!", cost: 1500, available: coins >= 1500, image: "🍽️" },
  ];

  const redeemReward = (reward) => {
    if (coins >= reward.cost) {
      coins -= reward.cost;

      addAppliedReward(reward.name);
      console.log(appliedRewards);

      switch (reward.id) {
        case 1:
          alert('Applied 10% discount!');
          break;
        case 2:
          alert(`You redeemed: ${reward.name}`);
          break;
        case 3:
          alert(`You redeemed: ${reward.name}`);
          break;
        case 4:
          alert(`You redeemed a Medium Fountain Drink!`);
          break;
        case 5:
          alert(`You redeemed a Bottled Drink!`);
          break;
        case 6:
          alert(`You redeemed a Shake!`);
          break;
        case 7:
          alert(`You redeemed a Free Entree!`);
          break;
        case 8:
          alert(`You redeemed a BOGO deal!`);
          break;
        default:
          alert('Reward redeemed!');
      }
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
                <RewardCard key={reward.id} reward={reward} redeemReward={redeemReward} coins={coins}/>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">400 - 700 Coins</h3>
          <div className="grid grid-cols-3 gap-6">
            {rewards
              .filter((reward) => reward.cost > 300 && reward.cost <= 700)
              .map((reward) => (
                <RewardCard key={reward.id} reward={reward} redeemReward={redeemReward} coins={coins}/>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">Premium Rewards</h3>
          <div className="grid grid-cols-3 gap-6">
            {rewards
              .filter((reward) => reward.cost > 700 && reward.cost <= 2000)
              .map((reward) => (
                <RewardCard key={reward.id} reward={reward} redeemReward={redeemReward} coins={coins}/>
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
