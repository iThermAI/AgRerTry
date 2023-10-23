FROM python:3.11.5-bullseye

WORKDIR /app/flask_backend
COPY . .

RUN pip install --no-cache-dir torch torchvision torchaudio  --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir  opencv-python-headless
RUN pip install --no-cache-dir Pillow

RUN pip install --no-cache-dir -r requirements.txt


CMD ["python", "app3.py"]