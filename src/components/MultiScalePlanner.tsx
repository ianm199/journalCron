"use client";

import React, { useState } from 'react';

export const MultiScalePlanner = () => {
  // We'll integrate this with the backend later
  const [plans, setPlans] = useState({
    yearly: null,
    quarterly: null,
    weekly: null,
    daily: null
  });

  const [activeTab, setActiveTab] = useState('yearly');

  const formatTimeRange = (planType) => {
    const now = new Date();
    switch (planType) {
      case 'yearly':
        return now.getFullYear().toString();
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter} ${now.getFullYear()}`;
      case 'weekly':
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}`;
      case 'daily':
        return now.toLocaleDateString();
      default:
        return '';
    }
  };

  const PlanCard = ({ type, title, description }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-black">{title}</h3>
        <p className="text-sm text-gray-600">
          {plans[type]
            ? `Plan as of ${formatTimeRange(type)}`
            : `No current ${type} plan`}
        </p>
      </div>
      {plans[type] ? (
        <div className="space-y-4">
          <p className="text-gray-600">Plan content will be displayed here</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No plan created yet. Click below to start planning.
          </p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => console.log(`Create ${type} plan`)}
          >
            Create {title}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black mb-4">Multi-Scale Planning</h1>
        <p className="text-lg text-gray-600">
          Plan your goals and tasks across different time scales
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {['yearly', 'quarterly', 'weekly', 'daily'].map((tab) => (
            <button
              key={tab}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'yearly' && (
          <PlanCard
            type="yearly"
            title="Yearly Plan"
            description="Set your big picture goals for the year"
          />
        )}
        {activeTab === 'quarterly' && (
          <PlanCard
            type="quarterly"
            title="Quarterly Plan"
            description="Break down your yearly goals into quarterly objectives"
          />
        )}
        {activeTab === 'weekly' && (
          <PlanCard
            type="weekly"
            title="Weekly Plan"
            description="Plan your week based on quarterly objectives"
          />
        )}
        {activeTab === 'daily' && (
          <PlanCard
            type="daily"
            title="Daily Plan"
            description="Organize your day based on weekly priorities"
          />
        )}
      </div>
    </div>
  );
};

export default MultiScalePlanner;