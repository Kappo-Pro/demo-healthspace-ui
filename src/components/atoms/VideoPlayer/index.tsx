import { useState, useRef, useEffect } from 'react';
import { Button, Flex } from 'antd';
import { ModalContentSkeleton } from '@atoms/Skeletons';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

const VideoPlayer = ({ src }: { src: string }) => {
	const { t } = useTypedTranslation();
    const [status, setStatus] = useState('loading'); // 'loading', 'playing', 'error'
    const [retryCount, setRetryCount] = useState(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setStatus('loading');
        setRetryCount(0);
    }, [src]);

    useEffect(() => {
        const videoElement = videoRef.current;
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            // Stop video playback on unmount
            if (videoElement) {
                videoElement.pause();
                videoElement.src = '';
                videoElement.load();
            }
        };
    }, []);

    const handleCanPlay = () => {
        setStatus('playing');
        setRetryCount(0);
    };

    const handleError = () => {
        if (retryCount < 5) {
            setRetryCount(prev => prev + 1);
            retryTimeoutRef.current = setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.load();
                }
            }, 2000);
        } else {
            setStatus('error');
        }
    };

    const handleRetry = () => {
        setStatus('loading');
        setRetryCount(0);
        if (videoRef.current) {
            videoRef.current.load();
        }
    };

    if (!src) {
        return (
            <Flex justify="center" align="center" className="w-75 h-40">
                {t('common.videoPlayer.noVideoAvailable')}
            </Flex>
        );
    }

    return (
        <div className="w-75 h-40">
            {status !== 'playing' && (
                <Flex vertical justify="center" align="center" className="w-full h-full">
                    {status === 'loading' && <ModalContentSkeleton />}
                    {status === 'error' && (
                        <Flex vertical align="center" gap={10}>
                            <div>{t('common.videoPlayer.failedToLoad')}</div>
                            <Button onClick={handleRetry}>{t('common.videoPlayer.tryAgain')}</Button>
                        </Flex>
                    )}
                </Flex>
            )}
            <video
                ref={videoRef}
                controls
                className="video video-player w-full h-full"
                preload="auto"
                src={src}
                onCanPlay={handleCanPlay}
                onError={handleError}
                style={{ display: status === 'playing' ? 'block' : 'none' }}
            />
        </div>
    );
};

export default VideoPlayer;
