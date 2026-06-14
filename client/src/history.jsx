import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HistorySection = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Fetch history from your Express backend
        const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
        };
        fetchHistory();
    }, []);

    return (
        <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Past Analyses</h2>
        <div className="grid gap-4">
            {history.length > 0 ? history.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center">
                <div>
                <h3 className="font-semibold text-lg">{item.jobTitle || "General Role"}</h3>
                <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                <span className={`text-xl font-bold ${item.matchPercentage > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                    {item.matchPercentage}%
                </span>
                <p className="text-xs text-gray-400">Match Score</p>
                </div>
            </div>
            )) : (
            <p className="text-gray-500">No history found. Start by analyzing a resume!</p>
            )}
        </div>
        </div>
    );
    };

export default HistorySection;