#!/bin/sh

# Start Ollama server in bg
ollama serve &

# Wait a few seconds
sleep 5

#condition to pull mistral if not
if ! ollama list | grep -q "mistral"; then
    echo "Pulling Mistral model..."
    ollama pull mistral
fi

wait
