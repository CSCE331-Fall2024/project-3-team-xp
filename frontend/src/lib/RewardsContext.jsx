import { createContext, useContext, useState } from "react";

const RewardsContext = createContext();

export const RewardsProvider = ({ children }) => {
  const [appliedRewards, setAppliedRewards] = useState([]);

  const addAppliedReward = (reward) => {
    setAppliedRewards((prev) => [...prev, reward]);
  };

  return (
    <RewardsContext.Provider value={{ appliedRewards, addAppliedReward }}>
      {children}
    </RewardsContext.Provider>
  );
};

// Custom Hook to use the Rewards context
export const useRewards = () => {
  return useContext(RewardsContext);
};
