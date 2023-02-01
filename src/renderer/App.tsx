import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ScheduleList from './ScheduleList';
import icon from '../../assets/icon.svg';
import './App.css';
import JobSchedule from './entity/JobSchedule';
import SourceConfig from './entity/SourceConfig';
import HandleConfig from './entity/HandleConfig';
import TargetConfig from './entity/TargetConfig';

const data = Array.from({ length: 23 }).map(
  (_, i) =>
    new JobSchedule(
      `${i}`,
      `ant design part ${i}`,
      '*****',
      new SourceConfig(),
      new HandleConfig(),
      new TargetConfig(),
      'Ant Design, a design language for background applications, is refined by Ant UED Team.'
    )
);

const AppContext: React.FC = () => {
  return (
    <ConfigProvider>
      <ScheduleList datas={data} />
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
