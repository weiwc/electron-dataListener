/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable react/function-component-definition */
import React, { createContext, useReducer } from 'react';
import { RState, RAction, reducer } from './reducer';

// 创建context，约定数据类型，设置初始值
export const Context = createContext<{
  state: RState;
  dispatch: React.Dispatch<RAction>;
} | null>(null);

// ContextProvide组件
const ContextProvide: React.FC<{
  children: React.ReactNode[];
}> = (props) => {
  const [state, dispatch] = useReducer(reducer, { listData: [] });
  const { children } = props;
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export default ContextProvide;
