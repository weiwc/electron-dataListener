import { Drawer, Space, Button, message, Form, Input } from 'antd';
import {
  ProFormInstance,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { useState, forwardRef, useImperativeHandle, Ref, useRef } from 'react';
import { FileOutlined } from '@ant-design/icons';
import fs from 'fs';
import JobSchedule from 'renderer/entity/JobSchedule';

const ScheduleDrawer = (props: any, ref: Ref<unknown> | undefined) => {
  const [open, setOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const formMapRef = useRef<
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([]);

  const showDrawer = (data: any) => {
    console.log(data);
    if (data) {
      setIsEdit(true);
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue(data);
      });
    }
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({
    showDrawer: (data: any) => {
      showDrawer(data);
    },
  }));

  const onClose = () => {
    setOpen(false);
  };

  const onSelectFile = () => {
    window.electron.ipcRenderer.sendMessage('open-directory-dialog', []);
    window.electron.ipcRenderer.once('selected-path', async (paths: any) => {
      if (!paths[0]) return;
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldValue('filePath', paths[0]);
      });
    });
  };

  const genFile = <FileOutlined onClick={onSelectFile} />;

  const onReset = () => {
    formMapRef?.current?.forEach((formInstanceRef) => {
      formInstanceRef?.current?.resetFields();
    });
  };

  const handleOk = async (values: any) => {
    console.log(values);
    message.success('Processing complete!');
    const jobSchedule = new JobSchedule(
      values.title,
      values.rule,
      values.remark,
      values.sourceType,
      values.filePath,
      values.callbackType,
      values.ip,
      values.port
    );
    console.log(jobSchedule);
    // console.log(os.homedir());
    // 通过lowdb 将 form数据入库
    if (isEdit) {
      console.log('update');
      window.electron.ipcRenderer.sendMessage('lowdb-update', [jobSchedule]);
    } else {
      console.log('insert');
      window.electron.ipcRenderer.sendMessage('lowdb-insert', [jobSchedule]);
    }
    onClose();
    return true;
  };

  return (
    <Drawer
      title={isEdit ? '编辑任务' : '创建任务'}
      width={720}
      maskClosable
      onClose={onClose}
      closable={false}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button onClick={onReset}>重置</Button>
        </Space>
      }
    >
      <StepsForm<{
        name: string;
      }>
        formMapRef={formMapRef}
        onFinish={handleOk}
        formProps={{
          validateMessages: {
            required: '此项为必填项',
          },
        }}
      >
        <StepsForm.StepForm<{
          name: string;
        }>
          name="base"
          title="创建任务"
          stepProps={{
            description: '这里填入的都是基本信息',
          }}
        >
          <ProFormText
            name="title"
            label="任务名称"
            width="md"
            tooltip="最长为 24 位，用于标定的唯一 id"
            placeholder="请输入名称"
            rules={[{ required: true }]}
          />
          <ProFormDatePicker name="rule" label="定时任务执行规则" />
          <ProFormTextArea
            name="remark"
            label="备注"
            width="lg"
            placeholder="请输入备注"
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="sourceConfig"
          title="数据源配置"
          stepProps={{
            description: '这里填入运维参数',
          }}
        >
          <ProFormSelect
            label="数据源类型"
            name="sourceType"
            rules={[
              {
                required: true,
              },
            ]}
            initialValue="1"
            options={[
              {
                value: '1',
                label: 'csv',
              },
            ]}
          />
          <ProFormText
            label="文件路径"
            name="filePath"
            rules={[{ required: true, message: '请选择文件!' }]}
          >
            <Input disabled addonAfter={genFile} />
          </ProFormText>
        </StepsForm.StepForm>
        <StepsForm.StepForm name="callbackConfig" title="回调配置">
          <ProFormSelect
            label="回调方式"
            name="callbackType"
            rules={[
              {
                required: true,
              },
            ]}
            initialValue="1"
            options={[
              {
                value: '1',
                label: 'socket',
              },
            ]}
          />
          <ProFormText
            name="ip"
            label="回调ip"
            width="md"
            tooltip="socket服务端ip地址"
            placeholder="请输入ip"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="port"
            label="端口"
            width="md"
            tooltip="socket服务端端口"
            placeholder="请输入port"
            rules={[{ required: true }]}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Drawer>
  );
};

export default forwardRef(ScheduleDrawer);
