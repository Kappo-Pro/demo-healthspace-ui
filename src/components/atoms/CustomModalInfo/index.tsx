import { Modal, Typography } from 'antd';
import './style.css';

interface CustomModalProps {
  name?: string;
  description?: string;
  video?: string;
}

const showCustomModal = ({ name, video }: CustomModalProps) => {
  const modalContent = (
    <div className="video-modal-container">
      <video
        controls
        autoPlay
        className="video-modal-player"
        preload="metadata"
        src={video}
      />
      {name && (
        <div className="video-modal-title-overlay">
          <Typography.Text strong style={{ color: 'white', fontSize: 'var(--font-size-lg)' }}>
            {name}
          </Typography.Text>
        </div>
      )}
    </div>
  );

  Modal.info({
    title: null,
    content: modalContent,
    width: 'min(90vw, 1280px)',
    centered: true,
    maskClosable: true,
    icon: null,
    okButtonProps: { style: { display: 'none' } },
    closable: true,
    className: 'video-modal-16-9',
    styles: {
      content: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: 'var(--radius-xl)',
      },
      body: {
        padding: 0,
      },
    },
  });
};

export { showCustomModal };
