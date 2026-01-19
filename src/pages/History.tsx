import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteRecord, type PrayerRecord } from '../utils/storage';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// 삭제 확인 다이얼로그 컴포넌트
interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function DeleteDialog({ isOpen, onClose, onConfirm }: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <p className="dialog-title">기록을 삭제하시겠습니까?</p>
                <div className="dialog-buttons">
                    <button className="dialog-btn-cancel" onClick={onClose}>
                        닫기
                    </button>
                    <button className="dialog-btn-confirm" onClick={onConfirm}>
                        삭제하기
                    </button>
                </div>
            </div>
        </div>
    );
}

// 스와이프 가능한 히스토리 아이템 컴포넌트
interface SwipeableItemProps {
    item: PrayerRecord;
    onDelete: (id: string) => void;
    onClick: () => void;
}

function SwipeableItem({ item, onDelete, onClick }: SwipeableItemProps) {
    const [swipeX, setSwipeX] = useState(0);
    const [isSwipedOpen, setIsSwipedOpen] = useState(false);
    const startXRef = useRef(0);
    const currentXRef = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        startXRef.current = e.touches[0].clientX;
        currentXRef.current = swipeX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const diff = e.touches[0].clientX - startXRef.current;
        const newX = Math.max(-80, Math.min(0, currentXRef.current + diff));
        setSwipeX(newX);
    };

    const handleTouchEnd = () => {
        if (swipeX < -40) {
            setSwipeX(-80);
            setIsSwipedOpen(true);
        } else {
            setSwipeX(0);
            setIsSwipedOpen(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(item.id);
    };

    const handleItemClick = () => {
        if (isSwipedOpen) {
            setSwipeX(0);
            setIsSwipedOpen(false);
        } else {
            onClick();
        }
    };

    return (
        <div className="swipeable-container">
            {/* 삭제 버튼 (뒤에 위치) */}
            <div className="swipe-delete-btn" onClick={handleDeleteClick}>
                삭제
            </div>

            {/* 스와이프 가능한 콘텐츠 */}
            <div
                className="swipeable-content"
                style={{ transform: `translateX(${swipeX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleItemClick}
            >
                <div className="history-item-content">
                    <div className="history-item-title">{item.prayer}</div>
                    <div className="history-item-meta">
                        {format(new Date(item.date), 'yyyy.MM.dd')} • {item.response.book} {item.response.chapter}장
                    </div>
                </div>
                <span className="history-item-arrow">›</span>
            </div>
        </div>
    );
}

export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState<PrayerRecord[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const openDeleteDialog = (id: string) => {
        setDeleteTargetId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            deleteRecord(deleteTargetId);
            setHistory(getHistory());
        }
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    return (
        <div className="page-container">
            {/* 삭제 확인 다이얼로그 */}
            <DeleteDialog
                isOpen={deleteDialogOpen}
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
            />

            {/* Top Section */}
            <div className="top-section">
                <h1 className="top-title">나의 기도 기록</h1>
                <p className="top-subtitle">그동안 하늘에 전했던 마음들이에요.</p>
            </div>

            {/* Content */}
            <div className="content-section">
                {history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⚠️</div>
                        <p className="empty-text">
                            아직 기록된 기도가 없어요.<br />첫 기도를 시작해보세요.
                        </p>
                        <span
                            className="empty-link"
                            onClick={() => navigate('/')}
                        >
                            처음으로 돌아가기
                        </span>
                    </div>
                ) : (
                    <div className="history-list">
                        <AnimatePresence>
                            {history.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -100 }}
                                >
                                    <SwipeableItem
                                        item={item}
                                        onDelete={openDeleteDialog}
                                        onClick={() => navigate('/result', { state: { record: item } })}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Fixed Bottom CTA */}
            <div className="fixed-bottom-cta">
                <button
                    className="btn-primary"
                    onClick={() => {
                        if (history.length === 0) {
                            navigate('/write');
                        } else {
                            navigate('/');
                        }
                    }}
                >
                    {history.length === 0 ? '기도 시작하기' : '처음으로 돌아가기'}
                </button>
            </div>
        </div>
    );
}
