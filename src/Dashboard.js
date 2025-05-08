import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Papa from 'papaparse';
import './Dashboard.css'; // Make sure to create this file with the CSS above

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFilter, setExpandedFilter] = useState(null);
  
  // Color palette
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  const INTENT_COLORS = {
    'problem_solving': '#0088FE',
    'knowledge_seeking': '#00C49F', 
    'decision_making': '#FFBB28',
    'greeting': '#FF8042',
    'clarification': '#8884d8',
    'crisis_management': '#82ca9d',
    'validation': '#ffc658',
    'off_topic': '#8dd1e1'
  };
  
  // Filter placeholders with single option
  const filters = [
    { 
      name: 'Age',
      tooltip: 'pending feature',
      options: ['incoming feature']
    },
    { 
      name: 'Gender',
      tooltip: 'pending feature',
      options: ['incoming feature']
    },
    { 
      name: 'Region',
      tooltip: 'pending feature',
      options: ['incoming feature']
    },
    { 
      name: 'Role',
      tooltip: 'pending feature',
      options: ['incoming feature']
    }
  ];

  const handleFilterClick = (filterName) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // For local file in public/data folder
        const response = await fetch('/data/question_tagging.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (result) => {
            // Clean up data - trim strings and handle nulls
            const cleanedData = result.data.map(item => ({
              ...item,
              question_complexity: item.question_complexity ? item.question_complexity.trim() : 'unknown',
              learning_path: item.learning_path ? item.learning_path.trim() : 'none',
              user_intent: item.user_intent || 'unknown'
            }));
            
            setData(cleanedData);
            setLoading(false);
          },
          error: (error) => {
            setError(error.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Failed to load data: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div className="loading-screen">Loading data...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  
  // ---- Data Processing Functions ----
  
  // 1. Session Analysis
  const processSessionData = () => {
    const sessionQuestions = {};
    data.forEach(item => {
      if (!sessionQuestions[item.session_id]) {
        sessionQuestions[item.session_id] = [];
      }
      sessionQuestions[item.session_id].push(item);
    });
    
    const questionsPerSession = Object.keys(sessionQuestions).map(sessionId => {
      return {
        id: sessionId,
        count: sessionQuestions[sessionId].length
      };
    });
    
    const distribution = {};
    questionsPerSession.forEach(session => {
      const count = session.count;
      distribution[count] = (distribution[count] || 0) + 1;
    });
    
    const distributionData = Object.keys(distribution).map(count => ({
      questions: parseInt(count),
      sessions: distribution[count]
    })).sort((a, b) => a.questions - b.questions);

    // Calculate median questions per session
    const sortedCounts = questionsPerSession.map(s => s.count).sort((a, b) => a - b);
    const middle = Math.floor(sortedCounts.length / 2);
    const medianQuestionsPerSession = sortedCounts.length % 2 === 0
      ? ((sortedCounts[middle - 1] + sortedCounts[middle]) / 2).toFixed(2)
      : sortedCounts[middle].toFixed(2);
    
    return {
      sessionsCount: Object.keys(sessionQuestions).length,
      questionsPerSession: questionsPerSession,
      distributionData: distributionData,
      medianQuestionsPerSession: medianQuestionsPerSession
    };
  };
  
  // 2. Intent Analysis
  const processIntentData = () => {
    const counts = {};
    data.forEach(item => {
      const intent = item.user_intent || 'unknown';
      counts[intent] = (counts[intent] || 0) + 1;
    });
    
    return Object.keys(counts).map(key => {
      const value = counts[key];
      const percentage = ((value / data.length) * 100).toFixed(1);
      return {
        name: key,
        value: value,
        percentage: percentage
      };
    }).sort((a, b) => b.value - a.value);
  };
  
  // 3. Business Maturity Analysis
  const processMaturityData = () => {
    const counts = {};
    data.forEach(item => {
      const complexity = item.question_complexity || 'unknown';
      counts[complexity] = (counts[complexity] || 0) + 1;
    });
    
    return Object.keys(counts).map(key => {
      const value = counts[key];
      const percentage = ((value / data.length) * 100).toFixed(1);
      return {
        name: key,
        value: value,
        percentage: percentage
      };
    }).sort((a, b) => b.value - a.value);
  };
  
  // 4. Learning Path Analysis
  const processLearningPathData = () => {
    const counts = {};
    data.forEach(item => {
      const path = item.learning_path || 'none';
      if (path !== 'none' && path !== 'null') {
        counts[path] = (counts[path] || 0) + 1;
      }
    });
    
    const totalNonNull = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return Object.keys(counts).map(key => {
      const value = counts[key];
      const percentage = ((value / totalNonNull) * 100).toFixed(1);
      return {
        name: key,
        value: value,
        percentage: percentage
      };
    }).sort((a, b) => b.value - a.value);
  };
  
  // 5. Learning Path vs Intent Data
  const processPathIntentData = () => {
    const pathIntents = {};
    const validPaths = new Set();
    
    // Count questions for each learning path by intent
    data.forEach(item => {
      const path = item.learning_path ? item.learning_path.trim() : 'none';
      const intent = item.user_intent || 'unknown';
      
      if (path !== 'none' && path !== 'null') {
        validPaths.add(path);
        
        if (!pathIntents[path]) {
          pathIntents[path] = {};
        }
        
        pathIntents[path][intent] = (pathIntents[path][intent] || 0) + 1;
      }
    });
    
    // Create data for visualization
    const pathIntentData = [];
    
    validPaths.forEach(path => {
      const intentCounts = pathIntents[path];
      const totalForPath = Object.values(intentCounts).reduce((sum, count) => sum + count, 0);
      
      // Get the dominant intent for this path
      const dominantIntent = Object.keys(intentCounts).reduce((a, b) => 
        intentCounts[a] > intentCounts[b] ? a : b
      );
      
      pathIntentData.push({
        path,
        total: totalForPath,
        dominantIntent,
        dominantIntentCount: intentCounts[dominantIntent],
        dominantIntentPercentage: ((intentCounts[dominantIntent] / totalForPath) * 100).toFixed(1)
      });
    });
    
    return pathIntentData.sort((a, b) => b.total - a.total);
  };
  
  // 6. Follow-up Questions Analysis
  const processFollowUpData = () => {
    const counts = { 'With Follow-ups': 0, 'Without Follow-ups': 0 };
    
    data.forEach(item => {
      if (item.has_follow_up_questions === true || item.has_follow_up_questions === 'True') {
        counts['With Follow-ups']++;
      } else {
        counts['Without Follow-ups']++;
      }
    });
    
    return [
      { name: 'With Follow-ups', value: counts['With Follow-ups'] },
      { name: 'Without Follow-ups', value: counts['Without Follow-ups'] }
    ];
  };
  
  // 7. Difficulty Analysis
  const processDifficultyData = () => {
    const typeCounts = {};
    
    data.forEach(item => {
      if (item.difficulty_type) {
        typeCounts[item.difficulty_type] = (typeCounts[item.difficulty_type] || 0) + 1;
      }
    });
    
    // Calculate sessions with difficulties
    const sessionQuestions = {};
    data.forEach(item => {
      if (!sessionQuestions[item.session_id]) {
        sessionQuestions[item.session_id] = [];
      }
      sessionQuestions[item.session_id].push(item);
    });
    
    const sessionsWithDifficulties = new Set();
    data.forEach(item => {
      if (item.has_difficulty === true || item.has_difficulty === 'True') {
        sessionsWithDifficulties.add(item.session_id);
      }
    });
    
    const difficultyRate = (sessionsWithDifficulties.size / Object.keys(sessionQuestions).length) * 100;
    
    return {
      typeCounts: Object.keys(typeCounts).map(key => ({
        name: key,
        value: typeCounts[key]
      })).sort((a, b) => b.value - a.value),
      sessionsWithDifficulties: sessionsWithDifficulties.size,
      totalSessions: Object.keys(sessionQuestions).length,
      difficultyRate: difficultyRate.toFixed(1)
    };
  };
  
  // 8. Example Questions by Intent and Maturity
  const getExampleQuestions = () => {
    const examples = {
      intents: {},
      complexity: {}
    };
    
    // Get intent examples
    const intents = ['problem_solving', 'knowledge_seeking', 'decision_making'];
    intents.forEach(intent => {
      const intentQuestions = data.filter(item => item.user_intent === intent);
      if (intentQuestions.length > 0) {
        // Get a question with content (avoid greetings)
        const validQuestions = intentQuestions.filter(q => q.question && q.question.length > 10);
        const randomIndex = Math.floor(Math.random() * Math.min(validQuestions.length, 5));
        examples.intents[intent] = validQuestions[randomIndex]?.question || 'No example available';
      }
    });
    
    // Get complexity examples
    const complexityLevels = ['beginner', 'intermediate', 'advanced'];
    complexityLevels.forEach(level => {
      const complexityQuestions = data.filter(item => item.question_complexity === level);
      if (complexityQuestions.length > 0) {
        // Get a question with content
        const validQuestions = complexityQuestions.filter(q => q.question && q.question.length > 10);
        const randomIndex = Math.floor(Math.random() * Math.min(validQuestions.length, 5));
        examples.complexity[level] = validQuestions[randomIndex]?.question || 'No example available';
      }
    });
    
    return examples;
  };
  
  // Process all data sets
  const sessionData = processSessionData();
  const intentData = processIntentData();
  const maturityData = processMaturityData();
  const learningPathData = processLearningPathData();
  const pathIntentData = processPathIntentData();
  const followUpData = processFollowUpData();
  const difficultyData = processDifficultyData();
  const exampleQuestions = getExampleQuestions();
  
  return (
    <div className="dashboard-container">
      <h1 className="title">Conversation Insight Dashboard</h1>
      <div className="filters-container">
        {filters.map((filter, index) => (
          <div key={index} className="filter-wrapper">
            <div 
              className={`filter-item ${expandedFilter === filter.name ? 'expanded' : ''}`}
              onClick={() => handleFilterClick(filter.name)}
              title={filter.tooltip}
            >
              {filter.name}
              <span className="filter-arrow">▼</span>
            </div>
            {expandedFilter === filter.name && (
              <div className="filter-options">
                {filter.options.map((option, optIndex) => (
                  <div 
                    key={optIndex} 
                    className="filter-option"
                    title="pending feature"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Section 1: Session Activity Analysis */}
      <div className="section">
        <h2 className="section-title">1. Session Activity Analysis</h2>
        
        <div className="grid grid-4-col">
          {/* KPI Cards */}
          <div className="card">
            <h3 className="card-title">Total Sessions</h3>
            <p className="card-value">{sessionData.sessionsCount}</p>
            <p className="card-subtitle">A session represents a continuous conversation between a user and the chatbot</p>
          </div>
          
          <div className="card">
            <h3 className="card-title">Total Questions</h3>
            <p className="card-value">{data.length}</p>
          </div>
          
          <div className="card">
            <h3 className="card-title">Median Questions/Session</h3>
            <p className="card-value">{sessionData.medianQuestionsPerSession}</p>
          </div>
          
          <div className="card">
            <h3 className="card-title">Follow-up Rate</h3>
            <p className="card-value">
              {((followUpData[0].value / (followUpData[0].value + followUpData[1].value)) * 100).toFixed(1)}%
            </p>
            <p className="card-subtitle">Percentage of questions that led to follow-ups</p>
          </div>
        </div>
        
        {/* Questions Per Session Distribution */}
        <div className="card" style={{ marginTop: '16px' }}>
          <h3 className="card-title">Questions Per Session Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData.distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="questions" label={{ value: 'Number of Questions', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Number of Sessions', angle: -90, position: 'center' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#8884d8" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Section 2: Question Analysis */}
      <div className="section">
        <h2 className="section-title">2. Question Type Analysis</h2>
        
        <div className="grid grid-2-col">
          {/* User Intent */}
          <div className="card">
            <h3 className="card-title">User Intent Distribution</h3>
            <div className="grid grid-2-col">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={intentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percentage}) => `${name}: ${percentage}%`}
                    >
                      {intentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={INTENT_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="example-container">
                <h4 className="example-title">Example Questions by Intent:</h4>
                <div>
                  <p className="example-label problem">Problem Solving:</p>
                  <p className="example-text">{exampleQuestions.intents.problem_solving}</p>
                </div>
                <div>
                  <p className="example-label knowledge">Knowledge Seeking:</p>
                  <p className="example-text">{exampleQuestions.intents.knowledge_seeking}</p>
                </div>
                <div>
                  <p className="example-label decision">Decision Making:</p>
                  <p className="example-text">{exampleQuestions.intents.decision_making}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Business Maturity */}
          <div className="card">
            <h3 className="card-title">Question Complexity Distribution</h3>
            <div className="grid grid-2-col">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={maturityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percentage}) => `${name}: ${percentage}%`}
                    >
                      {maturityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="example-container">
                <h4 className="example-title">Example Questions by Complexity:</h4>
                <div>
                  <p className="example-label problem">Beginner:</p>
                  <p className="example-text">{exampleQuestions.complexity.beginner}</p>
                </div>
                <div>
                  <p className="example-label knowledge">Intermediate:</p>
                  <p className="example-text">{exampleQuestions.complexity.intermediate}</p>
                </div>
                <div>
                  <p className="example-label decision">Advanced:</p>
                  <p className="example-text">{exampleQuestions.complexity.advanced}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Learning Paths */}
        <div className="card" style={{ marginTop: '16px' }}>
          <h3 className="card-title">Learning Path Analysis</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Learning Path</th>
                  <th style={{ textAlign: 'center' }}>Questions</th>
                  <th style={{ textAlign: 'center' }}>Percentage</th>
                  <th>Dominant Intent</th>
                  <th style={{ textAlign: 'center' }}>Intent %</th>
                </tr>
              </thead>
              <tbody>
                {pathIntentData.map((path, index) => (
                  <tr key={index}>
                    <td>{path.path}</td>
                    <td style={{ textAlign: 'center' }}>{path.total}</td>
                    <td style={{ textAlign: 'center' }}>
                      {learningPathData.find(p => p.name === path.path)?.percentage || '0'}%
                    </td>
                    <td>{path.dominantIntent}</td>
                    <td style={{ textAlign: 'center' }}>{path.dominantIntentPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Section 3: User Satisfaction */}
      <div className="section">
        <h2 className="section-title">3. User Satisfaction Analysis</h2>
        
        <div className="grid grid-2-col">
          {/* Session Difficulty Rate */}
          <div className="card">
            <h3 className="card-title">Session Difficulty Rate</h3>
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <p className="satisfaction-value">{difficultyData.difficultyRate}%</p>
                <p className="satisfaction-label">of sessions encountered difficulties</p>
                
                <div className="stats-container">
                  <div>
                    <p className="stats-value">{difficultyData.sessionsWithDifficulties}</p>
                    <p className="stats-label">Sessions with issues</p>
                  </div>
                  <div>
                    <p className="stats-value">{difficultyData.totalSessions}</p>
                    <p className="stats-label">Total sessions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Types of Difficulties */}
          <div className="card">
            <h3 className="card-title">Types of Difficulties</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData.typeCounts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#FF8042" name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;