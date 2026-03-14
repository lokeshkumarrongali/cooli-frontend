import { createContext, useContext, useState } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState(() => {
    return localStorage.getItem("activeRole") || null;
  });

  const setActiveRole = (role) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem("activeRole", role);
    } else {
      localStorage.removeItem("activeRole");
    }
  };

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
