import React, {createContext, useState, useContext } from 'react';

//Create the UserContext
const UserContext = createContext();

//Create a provider component
export const UserProvider = ({ children }) => {
    const [ user, setUser ] = useState(null);

    return(
        <UserContext.Provider value ={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

//custom hook to use the UserContext
export const useUser = () => {
    return useContext(UserContext);
};