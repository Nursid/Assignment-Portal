// Demo data and helper functions for testing the application

export const demoCredentials = {
  teacher: {
    email: 'teacher@example.com',
    password: 'password123'
  },
  student: {
    email: 'student@example.com', 
    password: 'password123'
  }
};

export const sampleAssignments = [
  {
    title: 'Introduction to JavaScript',
    description: 'Write a comprehensive essay about JavaScript fundamentals, covering variables, functions, and basic DOM manipulation. Include code examples and explain the concepts clearly.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  },
  {
    title: 'React Component Architecture',
    description: 'Design and implement a React component hierarchy for a todo application. Explain your design choices and demonstrate proper state management.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
  },
  {
    title: 'Database Design Principles',
    description: 'Create an ER diagram for a library management system and explain normalization concepts. Include at least 5 entities with proper relationships.',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days from now
  }
];

export const sampleSubmissions = [
  {
    answer: 'JavaScript is a versatile programming language that runs in web browsers and servers. Variables in JavaScript can be declared using var, let, or const keywords. Functions are first-class objects that can be assigned to variables, passed as arguments, and returned from other functions. The Document Object Model (DOM) allows JavaScript to interact with HTML elements dynamically.',
    grade: 85,
    feedback: 'Good understanding of the basics. Could use more detailed examples and better explanation of scope differences between var, let, and const.'
  }
];

// Helper function to populate demo data (for development/testing)
export const populateDemoData = async (api) => {
  try {
    // This would typically be called after login to create sample assignments
    console.log('Demo data functions available for testing');
    return { success: true, message: 'Demo data helpers loaded' };
  } catch (error) {
    console.error('Error with demo data:', error);
    return { success: false, error: error.message };
  }
};
