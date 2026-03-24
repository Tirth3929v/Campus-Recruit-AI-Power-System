import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createAvatar } from '@dicebear/core';
import { lorelei, avataaars, micah, bottts, funEmoji } from '@dicebear/collection';
import { RefreshCw, Check, Edit2, X, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const avatarStyles = [
    { id: 'lorelei', name: 'Lorelei (Cute)', collection: lorelei },
    { id: 'avataaars', name: 'Avataaars (People)', collection: avataaars },
    { id: 'micah', name: 'Micah (Stylish)', collection: micah },
    { id: 'bottts', name: 'Bottts (Robots)', collection: bottts },
    { id: 'funEmoji', name: 'Emojis (Fun)', collection: funEmoji }
];

const AvatarBuilderModal = ({ isOpen, onClose, currentAvatarConfig, onSave }) => {
    const [seed, setSeed] = useState(currentAvatarConfig?.seed || 'Felix');
    const [styleId, setStyleId] = useState(currentAvatarConfig?.styleId || 'lorelei');
    const [previewSvg, setPreviewSvg] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (currentAvatarConfig) {
                setSeed(currentAvatarConfig.seed || 'Felix');
                setStyleId(currentAvatarConfig.styleId || 'lorelei');
            } else {
                generateRandomSeed();
            }
        }
    }, [isOpen, currentAvatarConfig]);

    useEffect(() => {
        if (isOpen) {
            const activeStyle = avatarStyles.find(s => s.id === styleId) || avatarStyles[0];
            const avatar = createAvatar(activeStyle.collection, {
                seed: seed,
                size: 160,
                backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
            });
            setPreviewSvg(avatar.toString());
        }
    }, [seed, styleId, isOpen]);

    const generateRandomSeed = () => {
        setSeed(Math.random().toString(36).substring(7));
    };

    const handleSave = () => {
        onSave({ seed, styleId });
        onClose();
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Create Avatar</h2>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-800 rounded-full shrink-0">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="flex flex-col items-center mb-8 relative">
                            <div
                                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gray-50 dark:bg-gray-800 shadow-inner flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shrink-0"
                                dangerouslySetInnerHTML={{ __html: previewSvg }}
                            />
                            <motion.button
                                whileHover={{ rotate: 180, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={generateRandomSeed}
                                className="absolute -bottom-4 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
                            >
                                <RefreshCw size={20} />
                            </motion.button>
                        </div>

                        <div className="space-y-6">
                            {/* Style Selector */}
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    Style
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {avatarStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setStyleId(style.id)}
                                            className={`py-2 px-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${styleId === style.id
                                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border-2 border-teal-500/50'
                                                : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-xl font-bold opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 text-sm md:text-base"
                                >
                                    <Check size={18} /> Save Avatar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export const ProfileAvatar = ({ userConfig, onUpdate, size = "lg", editable = true }) => {
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();

    // Try to load from local storage if no config passed and user exists
    const [config, setConfig] = useState(userConfig || null);

    useEffect(() => {
        if (!userConfig && user?.id) {
            const savedConfig = localStorage.getItem(`avatar_${user.id}`);
            if (savedConfig) {
                setConfig(JSON.parse(savedConfig));
            }
        } else if (userConfig) {
            setConfig(userConfig);
        }
    }, [userConfig, user?.id]);

    const activeStyle = avatarStyles.find(s => s.id === (config?.styleId || 'lorelei')) || avatarStyles[0];
    const avatarSvg = createAvatar(activeStyle.collection, {
        seed: config?.seed || user?.name || 'Felix',
        size: 160,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
    }).toString();

    const handleSave = (newConfig) => {
        setConfig(newConfig);
        const userId = user?.id || user?._id || 'default';
        localStorage.setItem(`avatar_${userId}`, JSON.stringify(newConfig));
        if (onUpdate) onUpdate(newConfig);
    };

    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-16 h-16 rounded-2xl",
        lg: "w-32 h-32 md:w-40 md:h-40 rounded-3xl",
    };

    return (
        <>
            <div className="relative group inline-block">
                <div
                    className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl transition-transform duration-300 ${editable ? 'group-hover:scale-105 cursor-pointer' : ''}`}
                    dangerouslySetInnerHTML={{ __html: avatarSvg }}
                    onClick={() => editable && setShowModal(true)}
                />

                {editable && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-2 lg:p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 transition-transform hover:scale-110 z-10"
                        title="Edit Avatar"
                    >
                        <Edit2 size={size === 'lg' ? 18 : 14} />
                    </button>
                )}
            </div>

            <AvatarBuilderModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                currentAvatarConfig={config}
                onSave={handleSave}
            />
        </>
    );
};

export default ProfileAvatar;
