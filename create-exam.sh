#!/bin/bash

# Check if the required arguments are provided
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <admin_email> <admin_password>"
  echo "Example: $0 admin@example.com password123"
  exit 1
fi

ADMIN_EMAIL="$1"
ADMIN_PASSWORD="$2"

echo "Using credentials: $ADMIN_EMAIL / [password hidden]"

# First, let's login to get a token
echo "Logging in to get authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}" \
  https://testly-server.vercel.app/testly/v1/auth/signIn)

echo "Login response received"

# Extract the token properly using grep and sed
TOKEN=$(echo $LOGIN_RESPONSE | sed 's/.*"token":"\([^"]*\)".*/\1/')

echo "Token extracted: ${TOKEN:0:15}... (truncated)"

if [ -z "$TOKEN" ]; then
  echo "Failed to get authentication token. Please check your credentials."
  echo "Full response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Authentication successful!"

# Now create an exam
echo "Creating a new exam..."
EXAM_DATA='{
  "title": "Data Structures & Algorithms",
  "description": "Test your knowledge of fundamental data structures, algorithms, and computational complexity",
  "duration": 60,
  "passingScore": 70,
  "questions": [
    {
      "text": "What is the time complexity of binary search?",
      "options": ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
      "correctAnswer": 1,
      "points": 2
    },
    {
      "text": "Which data structure operates on a LIFO (Last In, First Out) principle?",
      "options": ["Queue", "Stack", "Linked List", "Binary Tree"],
      "correctAnswer": 1,
      "points": 1
    },
    {
      "text": "What is the worst-case time complexity of quicksort?",
      "options": ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
      "correctAnswer": 3,
      "points": 2
    },
    {
      "text": "Which of the following is not a linear data structure?",
      "options": ["Array", "Linked List", "Queue", "Tree"],
      "correctAnswer": 3,
      "points": 1
    },
    {
      "text": "What algorithm is typically used to find the shortest path in a weighted graph?",
      "options": ["Depth-First Search", "Breadth-First Search", "Dijkstra\u0027s Algorithm", "Binary Search"],
      "correctAnswer": 2,
      "points": 3
    },
    {
      "text": "What is the space complexity of a recursive fibonacci implementation?",
      "options": ["O(1)", "O(log n)", "O(n)", "O(2n)"],
      "correctAnswer": 2,
      "points": 2
    },
    {
      "text": "Which sorting algorithm is guaranteed to have O(n log n) time complexity in all cases?",
      "options": ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
      "correctAnswer": 2,
      "points": 2
    },
    {
      "text": "What is the primary advantage of a hash table?",
      "options": ["Ordered data", "O(1) average case for search and insert", "Memory efficiency", "Simplicity"],
      "correctAnswer": 1,
      "points": 2
    }
  ]
}'

echo "Sending request with Authorization: N0de__$TOKEN"

CREATE_RESPONSE=$(curl -v -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: N0de__$TOKEN" \
  -d "$EXAM_DATA" \
  https://testly-server.vercel.app/testly/v1/admin/exams)

echo "Response from server:"
echo $CREATE_RESPONSE | python3 -m json.tool 2>/dev/null || echo $CREATE_RESPONSE 