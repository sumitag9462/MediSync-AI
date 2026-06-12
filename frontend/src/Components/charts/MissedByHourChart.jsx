import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MissedByHourChart = ({ data }) => {
    // Beautiful vibrant light theme colors
    const COLORS = ['#8b5cf6', '#0ea5e9', '#f43f5e', '#f59e0b'];
    return (
        <div className="w-full">
            <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                Missed Doses by Time
            </h3>
            <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="missed"
                        nameKey="hour"
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', color: '#0f172a', fontWeight: 600 }} 
                        itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ color: '#475569', fontWeight: 600, paddingTop: '20px' }} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MissedByHourChart;
