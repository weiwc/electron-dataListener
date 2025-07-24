/* eslint-disable no-undef */
/* eslint-disable react/jsx-no-useless-fragment */
import { Drawer, Space, Button, message, Input } from 'antd';
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
import JobSchedule from 'renderer/entity/JobSchedule';

const ScheduleDrawer = (props: any, ref: Ref<unknown> | undefined) => {
  const [open, setOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({} as JobSchedule);

  const [callbackVal, setCallbackVal] = useState('1');

  const [title, setTitle] = useState('新建任务');

  const [formDisabled, setFormDisabled] = useState(false);

  const formMapRef = useRef<
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([]);

  const showDrawer = (data: any, typestr: string) => {
    __electronLog.info(`showDrawer data --->${data}`);
    if (data && JSON.stringify(data) !== '{}') {
      if (typestr === 'edit') {
        setTitle('编辑任务');
        setFormDisabled(false);
      } else {
        setTitle('查看任务');
        setFormDisabled(true);
      }
      setIsEdit(false);
      setFormData(data);
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue(data);
      });
    } else {
      setTitle('创建任务');
      setFormDisabled(false);
      setIsEdit(false);
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.resetFields();
      });
    }
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({
    showDrawer: (data: any, typestr: string) => {
      showDrawer(data, typestr);
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
    __electronLog.info(`showDrawer handleOk --->${values}`);
    if (!formDisabled) {
      message.success('Processing complete!');
      const jobSchedule: JobSchedule = formData;
      jobSchedule.title = values.title;
      jobSchedule.rule = values.rule;
      jobSchedule.remark = values.remark;
      jobSchedule.sourceType = values.sourceType;
      jobSchedule.filePath = values.filePath;
      jobSchedule.callbackType = values.callbackType;
      jobSchedule.ip = values.ip;
      jobSchedule.port = values.port;
      // 通过lowdb 将 form数据入库
      if (isEdit) {
        __electronLog.info('showDrawer action --->update');
        window.electron.ipcRenderer.sendMessage('lowdb-update', [jobSchedule]);
      } else {
        __electronLog.info('showDrawer action --->insert');
        window.electron.ipcRenderer.sendMessage('lowdb-insert', [jobSchedule]);
      }
    }
    onClose();
    return true;
  };

  const callbacktypeFn = (val: any) => {
    console.log(val, 'val----');
    setCallbackVal(val);
    return val;
  };

  return (
    <Drawer
      // title={isEdit ? '编辑任务' : '创建任务'}
      title={title}
      width={720}
      maskClosable
      onClose={onClose}
      closable={false}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button onClick={onReset} disabled={formDisabled}>
            重置
          </Button>
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
          title={title}
          stepProps={{
            description: '这里填入的都是基本信息',
          }}
          readonly={formDisabled}
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
          readonly={formDisabled}
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
        <StepsForm.StepForm
          name="callbackConfig"
          title="回调配置"
          readonly={formDisabled}
        >
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
              {
                value: '2',
                label: 'restfulPath',
              },
            ]}
            fieldProps={{
              onChange: (value) => {
                callbacktypeFn(value);
              },
            }}
          />
          {callbackVal === '1' ? (
            <>
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
            </>
          ) : (
            <>
              <ProFormText
                name="restfulPath"
                label="回调"
                width="md"
                tooltip=""
                placeholder="请输入网址"
                rules={[{ required: true }]}
              />
            </>
          )}
        </StepsForm.StepForm>
      </StepsForm>
    </Drawer>
  );
};

export default forwardRef(ScheduleDrawer);
