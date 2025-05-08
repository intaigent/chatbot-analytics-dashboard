# QA Dashboard

A React-based dashboard for visualizing and analyzing user interactions with the Business Learning Framework (BLF) chatbot. This dashboard provides insights into user behavior, question patterns, and learning outcomes.

## Features

### 1. Session Activity Analysis
- Total number of sessions and questions
- Median questions per session
- Follow-up question rate
- Distribution of questions per session

### 2. Question Type Analysis
- User intent distribution (problem-solving, knowledge-seeking, decision-making, etc.)
- Question complexity levels (beginner, intermediate, advanced)
- Learning path analysis
- Example questions for each category

### 3. User Satisfaction Analysis
- Session difficulty rate
- Types of difficulties encountered
- Evidence of user challenges

## Data Source

The dashboard uses data from Amplitude analytics, processed and stored in `public/data/question_tagging.csv`. The data includes:
- User interactions
- Question types
- Learning paths
- Session information
- User intent and complexity levels

## Technical Stack

- React 18.2.0
- Recharts for data visualization
- PapaParse for CSV parsing
- React Scripts for development and building

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd qa_dashboard_2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The dashboard will be available at `http://localhost:3000`

## Building for Production

To create a production build:
```bash
npm run build
```

## Project Structure

```
qa_dashboard_2/
├── public/
│   ├── data/
│   │   └── question_tagging.csv    # Processed analytics data
│   └── index.html
├── src/
│   ├── Dashboard.js               # Main dashboard component
│   └── Dashboard.css              # Dashboard styles
├── package.json
└── README.md
```

## Data Processing

The dashboard processes the following key metrics:
- User intent categorization
- Question complexity levels
- Learning path distribution
- Session analysis
- Follow-up question patterns
- User satisfaction indicators

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Contact

For questions or support, please contact the development team. 
