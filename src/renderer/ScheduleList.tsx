import React from 'react';
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Card, List, Divider, Button } from 'antd';
import JobSchedule from './entity/JobSchedule';
import ScheduleDrawer from './components/ScheduleDrawer';

const { Meta } = Card;

type ListProps = {
  datas: JobSchedule[];
};

const ScheduleList: React.FC<ListProps> = ({ datas }) => {
  const configRef = React.useRef<any>();

  return (
    <div>
      <Divider orientation="left">任务列表</Divider>
      <List
        itemLayout="vertical"
        size="large"
        bordered
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 6,
        }}
        dataSource={datas}
        grid={{
          column: 3,
          gutter: 8,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 6,
          xxl: 3,
        }}
        header={
          <div>
            <Button size="large" onClick={configRef.current.showDrawer}>
              新增任务
            </Button>
          </div>
        }
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Meta title={item.title} description={item.remark} />
            </Card>
          </List.Item>
        )}
      />
      <ScheduleDrawer ref={configRef} />
    </div>
  );
};

export default ScheduleList;
