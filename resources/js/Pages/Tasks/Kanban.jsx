import { Head } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function TasksKanban({ auth }) {
    const [tasks, setTasks] = useState({
        todo: [
            { id: 1, title: 'Review kontrak karyawan baru', assignee: 'Siti Rahayu', priority: 'high', dueDate: '2024-01-25' },
            { id: 2, title: 'Update data BPJS Q1', assignee: 'Dewi Lestari', priority: 'medium', dueDate: '2024-01-30' },
        ],
        inProgress: [
            { id: 3, title: 'Proses reimburse pending', assignee: 'Ahmad Fauzi', priority: 'high', dueDate: '2024-01-22' },
            { id: 4, title: 'Onboarding karyawan baru', assignee: 'Siti Rahayu', priority: 'medium', dueDate: '2024-01-24' },
        ],
        done: [
            { id: 5, title: 'Payroll Januari 2024', assignee: 'Dewi Lestari', priority: 'high', dueDate: '2024-01-20' },
        ],
    });

    const [showModal, setShowModal] = useState(false);

    const priorityColors = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-amber-100 text-amber-700',
        low: 'bg-green-100 text-green-700',
    };

    const columns = [
        { key: 'todo', title: 'To Do', color: 'border-gray-300' },
        { key: 'inProgress', title: 'In Progress', color: 'border-blue-400' },
        { key: 'done', title: 'Done', color: 'border-green-400' },
    ];

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Task Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                        <p className="text-sm text-gray-500">Kelola tugas HR dengan Kanban board</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Task
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="grid md:grid-cols-3 gap-6">
                    {columns.map((column) => (
                        <div key={column.key} className="space-y-3">
                            <div className={`flex items-center gap-2 pb-2 border-b-2 ${column.color}`}>
                                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                    {tasks[column.key].length}
                                </span>
                            </div>
                            <div className="space-y-3 min-h-[400px]">
                                {tasks[column.key].map((task) => (
                                    <div
                                        key={task.id}
                                        className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium">
                                                    {task.assignee.charAt(0)}
                                                </div>
                                                <span className="text-xs text-gray-500">{task.assignee}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{task.dueDate}</span>
                                        </div>
                                    </div>
                                ))}
                                {tasks[column.key].length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Task</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="label">Judul Task</label>
                                <input type="text" className="input" placeholder="Deskripsi task..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Assignee</label>
                                    <select className="input">
                                        <option>Siti Rahayu</option>
                                        <option>Ahmad Fauzi</option>
                                        <option>Dewi Lestari</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Priority</label>
                                    <select className="input">
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label">Due Date</label>
                                <input type="date" className="input" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                                <button type="submit" className="btn-primary flex-1">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}
