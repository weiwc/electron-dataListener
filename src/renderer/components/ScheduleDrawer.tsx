import {
  Drawer,
  Space,
  Button,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Form,
} from 'antd';
import { useState, forwardRef, useImperativeHandle, Ref } from 'react';

const ScheduleDrawer = (props: any, ref: Ref<unknown> | undefined) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({
    showDrawer: () => {
      showDrawer();
    },
  }));

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Drawer
      title="Create a new account"
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} type="primary">
            Submit
          </Button>
        </Space>
      }
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter user name' }]}
            >
              <Input placeholder="Please enter user name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="url"
              label="Url"
              rules={[{ required: true, message: 'Please enter url' }]}
            >
              <Input
                style={{ width: '100%' }}
                addonBefore="http://"
                addonAfter=".com"
                placeholder="Please enter url"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="owner"
              label="Owner"
              rules={[{ required: true, message: 'Please select an owner' }]}
            >
              <Select
                placeholder="Please select an owner"
                options={[
                  { value: 'xiao', label: 'Xiaoxiao Fu' },
                  { value: 'mao', label: 'Maomao Zhou' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please choose the type' }]}
            >
              <Select
                placeholder="Please choose the type"
                options={[
                  { value: 'private', label: 'Private' },
                  { value: 'public', label: 'Public' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="approver"
              label="Approver"
              rules={[
                { required: true, message: 'Please choose the approver' },
              ]}
            >
              <Select
                placeholder="Please choose the approver"
                options={[
                  { value: 'jack', label: 'Jack Ma' },
                  { value: 'tom', label: 'Tom Liu' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateTime"
              label="DateTime"
              rules={[
                { required: true, message: 'Please choose the dateTime' },
              ]}
            >
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: 'please enter url description',
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="please enter url description"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default forwardRef(ScheduleDrawer);
