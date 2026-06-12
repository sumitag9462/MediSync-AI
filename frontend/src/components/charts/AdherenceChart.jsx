import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdherenceChart = ({ data }) => (
    <div className="w-full">
        <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
            Weekly Adherence
        </h3>
        <ResponsiveContainer width="100%" height={340}>
            <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} unit="%" domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', color: '#0f172a', fontWeight: 600 }} 
                    itemStyle={{ color: '#8b5cf6', fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ color: '#475569', fontWeight: 600, paddingTop: '20px' }} />
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
                <Line 
                    type="monotone" 
                    name="Adherence %"
                    dataKey="adherence" 
                    stroke="url(#colorUv)" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 3 }} 
                    activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default AdherenceChart;
