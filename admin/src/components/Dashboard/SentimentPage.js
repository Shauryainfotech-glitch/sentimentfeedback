import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector } from 'recharts';
import '../../styles/AnalyticsPage.css';
import { useLanguage } from '../../context/LanguageContext';

// Mock data for sentiment analysis
const sentimentData = {
  sentimentAnalysis: {
    positive: 65,
    neutral: 25,
    negative: 10
  },
  sentimentByCategory: [
    { name: 'Service', positive: 70, neutral: 20, negative: 10 },
    { name: 'Traffic', positive: 40, neutral: 35, negative: 25 },
    { name: 'Security', positive: 75, neutral: 15, negative: 10 },
    { name: 'Other', positive: 60, neutral: 30, negative: 10 }
  ],
  sentimentTrend: [
    { month: 'Jan', positive: 60, neutral: 30, negative: 10 },
    { month: 'Feb', positive: 65, neutral: 25, negative: 10 },
    { month: 'Mar', positive: 55, neutral: 30, negative: 15 },
    { month: 'Apr', positive: 60, neutral: 25, negative: 15 },
    { month: 'May', positive: 70, neutral: 20, negative: 10 },
    { month: 'Jun', positive: 65, neutral: 25, negative: 10 }
  ]
};

const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

const SentimentPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage(); // Use language context
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when language changes
    setLoading(true);
    
    // Simulate API fetch with a delay
    setTimeout(() => {
      // Create translated data with category names
      const translatedData = {
        ...sentimentData,
        sentimentByCategory: sentimentData.sentimentByCategory.map(item => ({
          ...item,
          name: t(item.name.toLowerCase())
        }))
      };
      setSentiment(translatedData);
      setLoading(false);
    }, 800);
  }, [t, currentLanguage]); // Use currentLanguage instead of i18n.language

  // Custom pie chart rendering function
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {`${payload.name}: ${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const renderSentimentDistribution = () => {
    const data = [
      { name: t('positive'), value: sentiment?.sentimentAnalysis.positive },
      { name: t('neutral'), value: sentiment?.sentimentAnalysis.neutral },
      { name: t('negative'), value: sentiment?.sentimentAnalysis.negative }
    ];

    return (
      <div className="dashboard-card sentiment-distribution">
        <h3>{t('overallSentimentDistribution')}</h3>

        <div style={{ width: '100%', height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <PieChart width={500} height={300}>
            <Pie
              data={data}
              cx={250}
              cy={150}
              labelLine={false}
              label
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#4CAF50', marginRight: 8 }}></div>
            <span>{t('positive')}: {sentiment?.sentimentAnalysis.positive}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#FFC107', marginRight: 8 }}></div>
            <span>{t('neutral')}: {sentiment?.sentimentAnalysis.neutral}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#F44336', marginRight: 8 }}></div>
            <span>{t('negative')}: {sentiment?.sentimentAnalysis.negative}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSentimentTrends = () => (
    <div className="dashboard-card sentiment-trends">
      <h3>{t('sentimentTrendsOverTime')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sentiment?.sentimentTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="positive" name={t('positive')} stroke="#4CAF50" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="neutral" name={t('neutral')} stroke="#FFC107" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="negative" name={t('negative')} stroke="#F44336" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCategorySentiment = () => (
    <div className="dashboard-card category-sentiment">
      <h3>{t('sentimentAnalysisByCategory')}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={sentiment?.sentimentByCategory}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Line type="monotone" dataKey="positive" name={t('positive')} stroke="#4CAF50" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="neutral" name={t('neutral')} stroke="#FFC107" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="negative" name={t('negative')} stroke="#F44336" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="analytics-page">
      <h1>{t('sentimentAnalysis')}</h1>

      <div className="analytics-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('loadingSentimentData')}</p>
          </div>
        ) : (
          <div className="sentiment-dashboard-cards">
            {renderSentimentDistribution()}
            {renderSentimentTrends()}
            {renderCategorySentiment()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentPage;
