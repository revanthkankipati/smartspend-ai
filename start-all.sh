#!/bin/bash
echo "Starting SmartSpend AI Background Services..."

# Start Backend
echo "Starting Backend..."
(cd backend && npm start) &

# Start Frontend
echo "Starting Frontend..."
(cd frontend && npm run dev) &

echo "All services started! Press Ctrl+C to stop all."
wait

