import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import ScheduleList from './ScheduleList';
import './App.css';
import JobSchedule from './entity/JobSchedule';

const AppContext: React.FC = () => {
  const [listData, setListData] = useState([]);
  // let listData: JobSchedule[] = [];

  window.electron.ipcRenderer.sendMessage('lowdb-query', []);

  useEffect(() => {
    window.electron.ipcRenderer.once('query-reply', async (datas: any) => {
      console.log(datas);
      setListData(datas);
    });
  }, [listData]);

  return (
    <ConfigProvider>
      <ScheduleList datas={listData} />
    </ConfigProvider>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContext />} />
      </Routes>
    </Router>
  );
}
