encrypt:
	@echo "Encrypting .env file..."
	sops --input-type dotenv --output-type dotenv --encrypt .env > .env.enc
	@echo "Encrypting .env.development files..."
	sops --input-type dotenv --output-type dotenv --encrypt .env.development > .env.development.enc
	@echo "Encrypting .env.development.local files..."
	sops --input-type dotenv --output-type dotenv --encrypt .env.development.local > .env.development.local.enc
	@echo "Encrypting .env.local files..."
	sops --input-type dotenv --output-type dotenv --encrypt .env.local > .env.local.enc
	@echo "Encrypting .env.production files..."
	sops --input-type dotenv --output-type dotenv --encrypt .env.production > .env.production.enc
	@echo "Encrypting .env.production.local files..."
	sops --input-type dotenv --output-type dotenv --encrypt .env.production.local > .env.production.local.enc

decrypt:
	@echo "Decrypting .env file..."
	sops--input-type dotenv --output-type dotenv --decrypt .env.enc > .env
	@echo "Decrypting .env.development files..."
	sops--input-type dotenv --output-type dotenv --decrypt .env.development.enc > .env.development
	@echo "Decrypting .env.development.local files..."
	sops--input-type dotenv --output-type dotenv --decrypt .env.development.local.enc > .env.development.local
	@echo "Decrypting .env.local files..."
	sops--input-type dotenv --output-type dotenv --decrypt .env.local.enc > .env.local
	@echo "Decrypting .env.production files..."
	sops--input-type dotenv --output-type dotenv --decrypt .env.production.enc > .env.production
	@echo "Decrypting .env.production.local files..."
	sops--input-type dotenv --output-type dotenv --decrypt .env.production.local.enc > .env.production.local
