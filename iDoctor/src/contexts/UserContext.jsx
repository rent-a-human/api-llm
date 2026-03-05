import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already made a selection
    const storedUserType = localStorage.getItem('idoctor-user-type');
    const hasSeenOnboarding = localStorage.getItem('idoctor-onboarding-completed');
    
    if (storedUserType && hasSeenOnboarding) {
      setUserType(storedUserType);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    localStorage.setItem('idoctor-user-type', type);
    localStorage.setItem('idoctor-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const resetUserType = () => {
    setUserType(null);
    setShowOnboarding(true);
    localStorage.removeItem('idoctor-user-type');
    localStorage.removeItem('idoctor-onboarding-completed');
  };

  const value = {
    userType,
    showOnboarding,
    isLoading,
    handleUserTypeSelection,
    resetUserType
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};