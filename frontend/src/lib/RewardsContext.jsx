import { createContext, useContext, useState } from "react";

const RewardsContext = createContext();

export const RewardsProvider = ({ children }) => {
  const [appliedRewards, setAppliedRewards] = useState("");

  const addAppliedReward = (reward) => {
    setAppliedRewards(reward);
  };

  return (
    <RewardsContext.Provider value={{ appliedRewards, addAppliedReward, setAppliedRewards }}>
      {children}
    </RewardsContext.Provider>
  );
};

// Custom Hook to use the Rewards context
export const useRewards = () => {
  return useContext(RewardsContext);
};
