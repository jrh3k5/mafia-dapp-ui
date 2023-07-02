build-local:
	rm -rf dist/*
	docker compose up

build-dapp-site:
	cp src/html dist
	cp src/js dist/js