import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2'; // For displaying the chart
import 'chart.js/auto'; // Necessary for Chart.js 3.x

const reportsController = {
    async get_product_usage(startDate, endDate) {
        console.log(`Fetching usage from ${startDate} to ${endDate}...`);
        return new Promise((resolve) =>
            setTimeout(() => {
                resolve({
                    data: {
                        ingredients: ['Sugar', 'Flour', 'Butter', 'Eggs'],
                        usage: [50, 75, 30, 45],
                    },
                });
            }, 1000)
        );
    },
    loadXReport: () => console.log('X-report loaded'),
    loadZReport: () => console.log('Z-report loaded'),
};

const ReportsView = (/*{ reportsController }*/) => {
    const [loadXDisabled, setLoadXDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [startDate, setStartDate] = useState(''); // Start date
    const [endDate, setEndDate] = useState(''); // End date
    const [chartData, setChartData] = useState(null); // Data for the chart

    const handleLoadProductUsageReport = () => {
        setIsModalOpen(true); // Open the modal
    };




    const handleSubmitDates = async () => {
        try {
            const response = await fetch(
                `/api/usage?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch product usage');
            }

            const data = await response.json(); // JSON object with ingredient-usage pairs

            // Extract ingredients and usage values from the response
            const ingredients = Object.keys(data);
            const usage = Object.values(data);

            // Update the chart with the new data
            setChartData({
                labels: ingredients, // Ingredients on Y-axis
                datasets: [
                    {
                        label: 'Usage',
                        data: usage, // Usage on X-axis
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            setIsModalOpen(false); // Close the modal
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handleCloseModal = () => {
        setIsModalOpen(false); // Close the modal
    };

    return (
        <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-red-600 mb-5">Reports</h1>
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={handleLoadProductUsageReport}
                    className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                >
                    Product Usage
                </button>
                <button
                    onClick={() => {
                        reportsController.loadXReport();
                        setLoadXDisabled(true);
                    }}
                    className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                    disabled={loadXDisabled}
                >
                    X-report
                </button>
                <button
                    onClick={() => {
                        reportsController.loadZReport();
                        setLoadXDisabled(true);
                    }}
                    className="bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                >
                    Z-report
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Enter Date Range</h2>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border p-2 mb-4 w-full"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleSubmitDates}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Enter
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full bg-white border border-gray-300 rounded-lg shadow-md p-4 mt-6">
                {chartData ? (
                    <Bar
                        data={chartData}
                        options={{
                            indexAxis: 'y', // Swap the axes for horizontal bars
                            responsive: true,
                            maintainAspectRatio: false
                        }}
                    />
                ) : (
                    <p className="text-gray-500">Select a report to see the data.</p>
                )}
            </div>
        </div>
    );
};

export default ReportsView;
