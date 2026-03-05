function generateDummyInterviewReport() {
  return {
    title: "Full Stack Developer Interview Preparation",

    matchScore: 78,

    technicalQuestions: [
      {
        question: "Explain the Node.js event loop.",
        intention: "Check understanding of asynchronous architecture.",
        answer:
          "Explain how Node.js uses a single-threaded event loop and handles asynchronous tasks using callbacks, promises, and event queues."
      },
      {
        question: "How would you optimize a MongoDB query?",
        intention: "Evaluate database performance knowledge.",
        answer:
          "Use indexes, avoid full collection scans, use projections, and analyze queries with explain()."
      },
      {
        question: "What is the difference between REST and GraphQL?",
        intention: "Test API design knowledge.",
        answer:
          "REST uses multiple endpoints while GraphQL allows querying specific fields through a single endpoint."
      },
      {
        question: "How does React's virtual DOM improve performance?",
        intention: "Assess frontend performance knowledge.",
        answer:
          "React compares virtual DOM with previous state and updates only changed elements in the real DOM."
      }
    ],

    behavioralQuestions: [
      {
        question: "Tell me about a challenging project you worked on.",
        intention: "Assess ownership and problem solving.",
        answer:
          "Describe the challenge, your role, actions taken, and measurable results using the STAR method."
      },
      {
        question: "How do you handle tight deadlines?",
        intention: "Evaluate time management skills.",
        answer:
          "Prioritize tasks, break work into smaller parts, and communicate clearly with the team."
      },
      {
        question: "Describe a time you had a disagreement with a teammate.",
        intention: "Assess conflict resolution ability.",
        answer:
          "Explain the situation, how you handled the disagreement, and how the team reached a solution."
      }
    ],

    skillgaps: [
      {
        skill: "System Design",
        severity: "medium"
      },
      {
        skill: "Docker & CI/CD",
        severity: "low"
      },
      {
        skill: "Cloud Deployment",
        severity: "medium"
      }
    ],

    preparationPlan: [
      {
        day: 1,
        focus: "React Fundamentals",
        tasks: [
          "Review React hooks",
          "Build a small React component",
          "Understand component lifecycle"
        ]
      },
      {
        day: 2,
        focus: "Node.js Backend",
        tasks: [
          "Study Node.js event loop",
          "Practice async patterns",
          "Build a small Express API"
        ]
      },
      {
        day: 3,
        focus: "MongoDB & Databases",
        tasks: [
          "Study indexing",
          "Write aggregation pipelines",
          "Practice query optimization"
        ]
      },
      {
        day: 4,
        focus: "System Design Basics",
        tasks: [
          "Learn load balancing",
          "Study microservices architecture",
          "Understand caching strategies"
        ]
      },
      {
        day: 5,
        focus: "API Design",
        tasks: [
          "Design REST APIs",
          "Practice authentication with JWT",
          "Study API security practices"
        ]
      },
      {
        day: 6,
        focus: "DSA Practice",
        tasks: [
          "Solve 5 medium LeetCode problems",
          "Practice arrays and hashing",
          "Analyze time complexity"
        ]
      },
      {
        day: 7,
        focus: "Mock Interview",
        tasks: [
          "Conduct a mock technical interview",
          "Review project explanations",
          "Prepare behavioral answers"
        ]
      }
    ]
  };
}

module.exports = generateDummyInterviewReport;