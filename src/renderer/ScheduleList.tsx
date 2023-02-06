import React from 'react';
import {
  EditOutlined,
  EllipsisOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Card, List, Divider, Button } from 'antd';
import JobSchedule from './entity/JobSchedule';
import ScheduleDrawer from './components/ScheduleDrawer';

const { Meta } = Card;

type ListProps = {
  datas: JobSchedule[];
};

const ScheduleList: React.FC<ListProps> = ({ datas }) => {
  const configRef = React.createRef<any>();

  const openDrawer = () => {
    configRef.current.showDrawer();
  };

  const editRule = (data: any) => {
    configRef.current.showDrawer(data);
  };

  const deleteRule = (data: any) => {
    window.electron.ipcRenderer.sendMessage('lowdb-delete', [data.title]);
  };

  return (
    <div>
      <Divider orientation="left">任务列表</Divider>
      <List
        itemLayout="vertical"
        size="large"
        bordered
        style={{ width: '500px' }}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 6,
        }}
        dataSource={datas}
        grid={{
          column: 3,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 6,
          xxl: 6,
        }}
        header={
          <div>
            <Button size="large" onClick={openDrawer}>
              新增任务
            </Button>
          </div>
        }
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Button
                  type="default"
                  shape="circle"
                  onClick={(e) => deleteRule(item)}
                  icon={<DeleteOutlined key="delete" />}
                />,
                <Button
                  type="default"
                  shape="circle"
                  onClick={(e) => editRule(item)}
                  icon={<EditOutlined key="edit" />}
                />,
                <Button
                  type="default"
                  shape="circle"
                  icon={<EllipsisOutlined key="ellipsis" />}
                />,
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
