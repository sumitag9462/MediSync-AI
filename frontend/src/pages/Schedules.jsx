import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { medicineApi } from '../api/medicineApi';
import { dateUtils } from '../utils/dateUtils';
import { Plus, Pill, Edit, Trash2 } from 'lucide-react';
import { googleCalendarApi } from '../services/googleCalendarApi';

const ScheduleForm = ({ onSave, onCancel, existingSchedule }) => {
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        times: ['09:00'],
        startDate: new Date().toISOString().split('T')[0],
        duration: '1 Week',
        weeklyDays: [],
    });

    useEffect(() => {
        if (existingSchedule) {
            setFormData({
                name: existingSchedule.name,
                dosage: existingSchedule.dosage,
                times: existingSchedule.times,
                startDate: new Date(existingSchedule.startDate).toISOString().split('T')[0],
                duration: existingSchedule.duration || '1 Week',
                weeklyDays: existingSchedule.weeklyDays || [],
            });
        }
    }, [existingSchedule]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData(prev => ({ ...prev, times: newTimes.sort() }));
    };

    const addTime = () => {
        setFormData(prev => ({ ...prev, times: [...prev.times, '17:00'].sort() }));
    };

    const removeTime = (index) => {
        const newTimes = formData.times.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const handleWeekdayChange = (day) => {
        setFormData(prev => {
            const days = prev.weeklyDays.includes(day)
                ? prev.weeklyDays.filter(d => d !== day)
                : [...prev.weeklyDays, day];
            return { ...prev, weeklyDays: days };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Medicine Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner" placeholder="e.g., Ibuprofen" />
            </div>

            <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Dosage</label>
                <input type="text" name="dosage" value={formData.dosage} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner" placeholder="e.g., 200mg" />
            </div>

            <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Dose Times</label>
                <div className="space-y-2">
                    {formData.times.map((time, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner" />
                            {formData.times.length > 1 && (
                                <button type="button" onClick={() => removeTime(index)} className="text-red-500 hover:text-red-600 bg-red-50 p-2.5 rounded-xl hover:bg-red-100 transition-all"><Trash2 size={18} /></button>
                            )}
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addTime} className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center gap-1">
                    <Plus size={14} /> Add another time
                </button>
            </div>

            <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner" />
            </div>

            <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Duration</label>
                <select name="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner">
                    <option>1 Day</option>
                    <option>1 Week</option>
                    <option>2 Weeks</option>
                    <option>Fortnight</option>
                    <option>1 Month</option>
                </select>
            </div>

            {(formData.duration === '1 Week' || formData.duration === '2 Weeks' || formData.duration === 'Fortnight') && (
                <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Select Days of the Week</label>
                    <div className="flex flex-wrap gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => handleWeekdayChange(day)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${formData.weeklyDays.includes(day) ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700'}`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
                <button type="button" onClick={onCancel} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:-translate-y-0.5 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md">Save</button>
            </div>
        </form>
    );
};

const calculateEndDate = (startDate, duration) => {
    const start = new Date(startDate);
    let end = new Date(start);

    switch (duration) {
        case '1 Day':
            end.setDate(start.getDate() + 1);
            break;
        case '1 Week':
            end.setDate(start.getDate() + 7);
            break;
        case '2 Weeks':
        case 'Fortnight':
            end.setDate(start.getDate() + 14);
            break;
        case '1 Month':
            end.setMonth(start.getMonth() + 1);
            break;
        default:
            end = null;
    }
    return end;
};

const SchedulesPage = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        medicineApi.getSchedules().then(data => {
            setSchedules(data);
            setLoading(false);
        }).catch(error => {
            console.error("Failed to fetch schedules:", error);
            setLoading(false);
        });
    }, []);

    useEffect(fetchData, [fetchData]);

    const handleSave = async (formData) => {
        setIsModalOpen(false);
        const endDate = calculateEndDate(formData.startDate, formData.duration);

        if (editingSchedule && editingSchedule.googleEventIds) {
            await googleCalendarApi.deleteScheduleFromCalendar(editingSchedule.googleEventIds);
        }

        const scheduleData = { ...formData, endDate };
        const savedSchedule = editingSchedule
            ? await medicineApi.updateSchedule(editingSchedule._id, scheduleData)
            : await medicineApi.addSchedule(scheduleData);

        const newEventIds = await googleCalendarApi.addScheduleToCalendar(savedSchedule);
        if (newEventIds && newEventIds.length > 0) {
            await medicineApi.updateSchedule(savedSchedule._id, { ...savedSchedule, googleEventIds: newEventIds });
        }

        setEditingSchedule(null);
        fetchData();
    };

    const confirmDelete = async () => {
        if (showDeleteConfirm) {
            const scheduleToDelete = schedules.find(s => s._id === showDeleteConfirm);
            if (scheduleToDelete && scheduleToDelete.googleEventIds) {
                await googleCalendarApi.deleteScheduleFromCalendar(scheduleToDelete.googleEventIds);
            }
            await medicineApi.deleteSchedule(showDeleteConfirm);
            setShowDeleteConfirm(null);
            fetchData();
        }
    };

    const handleDelete = (scheduleId) => setShowDeleteConfirm(scheduleId);
    const handleOpenEditModal = (schedule) => { setEditingSchedule(schedule); setIsModalOpen(true); };
    const handleOpenNewModal = () => { setEditingSchedule(null); setIsModalOpen(true); };
    const handleCancel = () => { setIsModalOpen(false); setEditingSchedule(null); };

    return (
        <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden font-sans selection:bg-purple-500/20">
            {/* Animated Background System - Light Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
            </div>

            <div className="flex-1 flex flex-col z-10 relative w-full max-w-7xl mx-auto px-4 md:px-8 py-12 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            My Medication <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Schedules</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Manage and track all your prescriptions.</p>
                    </div>
                    <button onClick={handleOpenNewModal} className="bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 text-white font-bold py-3.5 px-6 rounded-xl flex items-center shadow-lg transition-all text-base shrink-0">
                        <Plus size={20} className="mr-2" /> Add Medicine
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Loading your schedules...</p>
                    </div>
                ) : schedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                        {schedules.map(schedule => {
                            const computedEndDate = schedule.endDate
                                ? new Date(schedule.endDate)
                                : calculateEndDate(schedule.startDate, schedule.duration);

                            return (
                                <motion.div
                                    key={schedule._id}
                                    layout
                                    className="bg-white/80 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl rounded-[2rem] hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] hover:border-purple-200 hover:-translate-y-1 transition-all overflow-hidden flex flex-col group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                                    
                                    <div className="p-8 pb-6 flex-1 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner mb-5">
                                            <Pill size={24} />
                                        </div>
                                        <h2 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">{schedule.name}</h2>
                                        <p className="text-purple-600 font-bold text-lg mb-4">{schedule.dosage}</p>
                                        
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5">
                                            <p className="text-slate-600 text-sm font-medium mb-1">
                                                <span className="text-slate-400 font-normal">Duration:</span> {schedule.duration}
                                            </p>
                                            <p className="text-slate-600 text-sm font-medium">
                                                <span className="text-slate-400 font-normal">Ends:</span> {computedEndDate ? dateUtils.formatDate(computedEndDate) : 'N/A'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {schedule.times.map((time, index) => (
                                                <span key={index} className="bg-white border border-purple-100 shadow-sm px-4 py-2 rounded-xl text-sm font-bold text-purple-700 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                    {dateUtils.formatTime(time)}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        {schedule.weeklyDays && schedule.weeklyDays.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {schedule.weeklyDays.map(day => (
                                                    <span key={day} className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600">
                                                        {day.slice(0, 3)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-auto px-8 py-5 border-t border-slate-100 bg-white/40 backdrop-blur-md flex justify-between items-center relative z-10">
                                        <p className="text-slate-500 font-medium text-sm">
                                            <span className="text-slate-400 font-normal">Start:</span> {dateUtils.formatDate(schedule.startDate)}
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenEditModal(schedule)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors tooltip-trigger" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(schedule._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors tooltip-trigger" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-16 md:p-24 rounded-[3rem] bg-white/60 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl w-full max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-purple-50 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Pill size={48} />
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">No Schedules Found</h3>
                        <p className="text-slate-500 mt-4 text-lg font-medium max-w-md mx-auto">Get started by adding your first medication to your schedule. We'll remind you when it's time.</p>
                        <button onClick={handleOpenNewModal} className="mt-10 bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:-translate-y-1 text-white font-bold py-4 px-8 rounded-2xl flex items-center mx-auto shadow-lg transition-all text-lg">
                            <Plus size={24} className="mr-2" /> Create First Schedule
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }} className="bg-white/90 border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.12)] backdrop-blur-2xl p-8 w-full max-w-lg rounded-[2rem]">
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                    {editingSchedule ? <Edit size={20} /> : <Plus size={20} />}
                                </span>
                                {editingSchedule ? 'Edit Medicine' : 'Add Medicine'}
                            </h2>
                            <ScheduleForm onSave={handleSave} onCancel={handleCancel} existingSchedule={editingSchedule} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }} className="bg-white/90 border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.12)] backdrop-blur-2xl p-10 w-full max-w-md text-center rounded-[2.5rem]">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Are you sure?</h3>
                            <p className="text-slate-500 my-4 text-base font-medium">This action will permanently delete the schedule. This cannot be undone.</p>
                            <div className="flex justify-center gap-4 mt-8">
                                <button onClick={() => setShowDeleteConfirm(null)} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl text-base transition-all flex-1">Cancel</button>
                                <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5 font-bold py-3 px-8 rounded-xl text-base transition-all flex-1">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SchedulesPage;
