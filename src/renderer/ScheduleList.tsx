import React, { useContext } from 'react';
import {
  EditOutlined,
  DeleteOutlined,
  FolderViewOutlined,
} from '@ant-design/icons';
import { Card, List, Divider, Button, Popconfirm } from 'antd';
import JobSchedule from './entity/JobSchedule';
import ScheduleDrawer from './components/ScheduleDrawer';
import './ScheduleList.css';
import { Context } from './usereducer/context';

const { Meta } = Card;

type ListProps = {
  datas: JobSchedule[];
};

const ScheduleList: React.FC<ListProps> = ({ datas }) => {
  const configRef = React.createRef<any>();
  const { state, dispatch } = useContext(Context)!;

  const openDrawer = (data: any, typestr: string) => {
    configRef.current.showDrawer(data, typestr);
  };

  const editRule = (data: any, typestr: string) => {
    configRef.current.showDrawer(data, typestr);
  };

  const checkRule = (data: any, typestr: string) => {
    configRef.current.showDrawer(data, typestr);
  };

  const deleteRule = (data: any) => {
    const updateData: any[] = state.listData;
    const newData: any[] = [];
    window.electron.ipcRenderer.sendMessage('lowdb-delete', [data.jobId]);
    for (let i = 0; i < updateData.length; i += 1) {
      const delData: JobSchedule = updateData[i];
      if (delData.jobId !== data.jobId) {
        newData.push(delData);
      }
    }
    dispatch({
      type: 'delete',
      payload: updateData,
    });
  };

  return (
    <div>
      <Divider orientation="left">任务列表</Divider>
      <List
        className="list-sty"
        itemLayout="vertical"
        size="large"
        bordered
        pagination={{
          onChange: () => {},
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
            <Button size="large" onClick={() => openDrawer({}, 'add')} disabled>
              新增任务
            </Button>
          </div>
        }
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Popconfirm
                  title="删除提示"
                  description="确认要删除此数据？"
                  onConfirm={() => deleteRule(item)}
                  okText="删除"
                  okType="danger"
                  cancelText="取消"
                >
                  <Button
                    type="default"
                    shape="circle"
                    icon={<DeleteOutlined key="delete" />}
                    disabled
                  />
                </Popconfirm>,
                <Button
                  type="default"
                  shape="circle"
                  onClick={() => editRule(item, 'edit')}
                  icon={<EditOutlined key="edit" />}
                  disabled
                />,
                <Button
                  type="default"
                  shape="circle"
                  onClick={() => checkRule(item, 'check')}
                  icon={<FolderViewOutlined key="check" />}
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
