import React from 'react';
import { useAuth } from './auth/AuthContext';
import WagonLayout from './layouts/WagonLayout';
import BroilerLayout from './layouts/BroilerLayout';
import BreederLayout from './layouts/BreederLayout';

const CategoryLayoutSwitcher = () => {
  const { user } = useAuth();

  // Use a switch statement to return the correct layout
  switch (user?.category) {
    case 'Wagon':
      return <WagonLayout />;
    case 'Broiler':
      return <BroilerLayout />;
    case 'Breeder':
      return <BreederLayout />;
    default:
      // Fallback: You could redirect to login or show an error
      // For now, it will just show nothing or you can default to one
      console.warn("No valid user category found, rendering default layout.");
      return <WagonLayout />; // Or return null / <Navigate to="/login" />
  }
};

export default CategoryLayoutSwitcher;