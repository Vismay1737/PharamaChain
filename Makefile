# PharmaChain Control Makefile

.PHONY: install ganache mosquitto backend iot frontend all deploy-contract clean

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install
	cd contracts && npm install

ganache:
	npx ganache --port 7545 --deterministic --accounts 10 --database.dbPath ./ganache_db

mosquitto:
	mosquitto -c mosquitto/mosquitto.conf

backend:
	cd backend && python run.py

iot:
	cd iot_simulator && python sensor_publisher.py

frontend:
	cd frontend && npm run dev -- --port 5173

deploy-contract:
	cd contracts && npx hardhat run scripts/deploy.js --network ganache

clean:
	rm -rf ganache_db
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "node_modules" -exec rm -rf {} +

all:
	@echo "Starting all services (requires GNU Parallel)..."
	parallel --tag --nonall -j 5 \
		"make ganache" \
		"make mosquitto" \
		"make backend" \
		"make frontend" \
		"make iot"
