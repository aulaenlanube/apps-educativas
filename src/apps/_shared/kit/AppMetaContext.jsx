import React, { createContext, useContext } from 'react';

// Datos de la app en curso (los pone AppRunnerPage) para que el kit de interfaz
// pinte icono, nombre y curso sin que cada app tenga que pasarlos.
//   { appId, name, description, level, grade, subjectId, isDuel }
const AppMetaContext = createContext(null);

export const AppMetaProvider = ({ value, children }) => (
  <AppMetaContext.Provider value={value}>{children}</AppMetaContext.Provider>
);

export const useAppMeta = () => useContext(AppMetaContext) || {};
