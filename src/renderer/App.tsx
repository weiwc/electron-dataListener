/* eslint-disable no-undef */
import { useContext, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import React = require('react');
import ScheduleList from './ScheduleList';
import './App.css';
import ContextProvide, { Context } from './usereducer/context';

const AppContext: React.FC = () => {
  const { state, dispatch } = useContext(Context)!;
  // let listData: JobSchedule[] = [];

  window.electron.ipcRenderer.sendMessage('lowdb-query', []);

  useEffect(() => {
    window.electron.ipcRenderer.once('query-reply', async (datas: any) => {
      __electronLog.info(`jobs query --->${datas}`);
      dispatch({
        type: 'update',
        payload: datas,
      });
    });
  });

  return (
    <ConfigProvider>
      <ScheduleList datas={state.listData} />
    </ConfigProvider>
  );
};

export default function App() {
  return (
    <ContextProvide>
      <AppContext />
      <div />
    </ContextProvide>
  );
}
