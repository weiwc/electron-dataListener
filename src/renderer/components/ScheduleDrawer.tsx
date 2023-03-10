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

  const formMapRef = useRef<
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([]);

  const showDrawer = (data: any) => {
    __electronLog.info(`showDrawer data --->${data}`);
    if (data && JSON.stringify(data) !== '{}') {
      setIsEdit(true);
      setFormData(data);
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue(data);
      });
    } else {
      setIsEdit(false);
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.resetFields();
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
    __electronLog.info(`showDrawer handleOk --->${values}`);
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
    // ??????lowdb ??? form????????????
    if (isEdit) {
      __electronLog.info('showDrawer action --->update');
      window.electron.ipcRenderer.sendMessage('lowdb-update', [jobSchedule]);
    } else {
      __electronLog.info('showDrawer action --->insert');
      window.electron.ipcRenderer.sendMessage('lowdb-insert', [jobSchedule]);
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
      title={isEdit ? '????????????' : '????????????'}
      width={720}
      maskClosable
      onClose={onClose}
      closable={false}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>??????</Button>
          <Button onClick={onReset}>??????</Button>
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
            required: '??????????????????',
          },
        }}
      >
        <StepsForm.StepForm<{
          name: string;
        }>
          name="base"
          title="????????????"
          stepProps={{
            description: '?????????????????????????????????',
          }}
        >
          <ProFormText
            name="title"
            label="????????????"
            width="md"
            tooltip="????????? 24 ??????????????????????????? id"
            placeholder="???????????????"
            rules={[{ required: true }]}
          />
          <ProFormDatePicker name="rule" label="????????????????????????" />
          <ProFormTextArea
            name="remark"
            label="??????"
            width="lg"
            placeholder="???????????????"
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="sourceConfig"
          title="???????????????"
          stepProps={{
            description: '????????????????????????',
          }}
        >
          <ProFormSelect
            label="???????????????"
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
            label="????????????"
            name="filePath"
            rules={[{ required: true, message: '???????????????!' }]}
          >
            <Input disabled addonAfter={genFile} />
          </ProFormText>
        </StepsForm.StepForm>
        <StepsForm.StepForm name="callbackConfig" title="????????????">
          <ProFormSelect
            label="????????????"
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
                label="??????ip"
                width="md"
                tooltip="socket?????????ip??????"
                placeholder="?????????ip"
                rules={[{ required: true }]}
              />
              <ProFormText
                name="port"
                label="??????"
                width="md"
                tooltip="socket???????????????"
                placeholder="?????????port"
                rules={[{ required: true }]}
              />
            </>
          ) : (
            <>
              <ProFormText
                name="restfulPath"
                label="??????"
                width="md"
                tooltip=""
                placeholder="???????????????"
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
