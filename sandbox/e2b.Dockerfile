# You can use most Debian-based base images
FROM e2bdev/code-interpreter:latest

# Install dependencies and customize sandbox
RUN pip install streamlit
RUN pip install openai