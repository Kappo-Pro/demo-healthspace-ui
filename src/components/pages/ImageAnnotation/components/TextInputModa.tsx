import React, { useRef } from 'react';
import { Modal, Input, Form } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

interface TextInputModalProps {
  visible: boolean;
  defaultValue?: string;
  onOk: (text: string) => void;
  onCancel: () => void;
}

const TextInputModal: React.FC<TextInputModalProps> = ({
  visible,
  defaultValue,
  onOk,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState(defaultValue || '');
  const inputRef = useRef<TextAreaRef>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setText(defaultValue || '');
    setError(false);
  }, [defaultValue, visible]);

  React.useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleOk = () => {
    if (!text.trim()) {
      setError(true);
      return;
    }
    onOk(text);
    setText('');
  };

  return (
    <Modal
      title={t('Admin.data.imageAnnotation.enterText')}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t('Admin.data.imageAnnotation.ok')}
      cancelText={t('Admin.data.imageAnnotation.cancel')}
      closable={false}
      centered
      okButtonProps={{ disabled: !text.trim() }}
    >
      <Form.Item
        validateStatus={error ? 'error' : ''}
        help={error ? t('Admin.data.imageAnnotation.requiredField') : ''}
      >
        <TextArea
          ref={inputRef}
          placeholder={t('Admin.data.imageAnnotation.textPlaceholder')}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) setError(false);
          }}
          autoSize={{ minRows: 3 }}
        />
      </Form.Item>
    </Modal>
  );
};

export default TextInputModal;
