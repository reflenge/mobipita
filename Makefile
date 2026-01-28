# .env* を SOPS + age で扱うためのヘルパー
#
# - 平文ファイル（.env*）は gitignore する
# - 暗号化ファイル（.env*.enc）のみをコミットする
#
# 使い方:
#   make encrypt
#   make decrypt
#   make updatekeys
#   make encrypt-one FILE=.env.production
#   make decrypt-one FILE=.env.production.enc

ifeq ($(OS),Windows_NT)
  # Prefer Git for Windows sh if available so POSIX recipes work on Windows.
  ifneq ("$(wildcard C:/PROGRA~1/Git/usr/bin/sh.exe)","")
    SHELL := C:/PROGRA~1/Git/usr/bin/sh.exe
  else ifneq ("$(wildcard C:/PROGRA~2/Git/usr/bin/sh.exe)","")
    SHELL := C:/PROGRA~2/Git/usr/bin/sh.exe
  else ifneq ("$(wildcard C:/Program\ Files/Git/usr/bin/sh.exe)","")
    SHELL := "C:/Program Files/Git/usr/bin/sh.exe"
  else ifneq ("$(wildcard C:/Program\ Files\ (x86)/Git/usr/bin/sh.exe)","")
    SHELL := "C:/Program Files (x86)/Git/usr/bin/sh.exe"
  else
    SHELL := sh
  endif
else
  SHELL := /bin/sh
endif

SOPS ?= sops
SOPS_DOTENV := $(SOPS) --input-type dotenv --output-type dotenv

# 必要に応じて増減してください
ENV_FILES ?= .env .env.local .env.development .env.development.local .env.production .env.production.local
ENC_FILES := $(addsuffix .enc,$(ENV_FILES))

.DEFAULT_GOAL := help

.PHONY: help check encrypt decrypt updatekeys encrypt-one decrypt-one clean-env

help:
	@echo "コマンド一覧:"
	@echo "  make encrypt        既存の .env* を暗号化して .env*.enc を作成"
	@echo "  make decrypt        既存の .env*.enc を復号して .env* を生成（gitignore 推奨）"
	@echo "  make updatekeys     .sops.yaml の recipients に合わせて鍵ラップを更新（追加/削除）"
	@echo "  make encrypt-one FILE=.env.production"
	@echo "  make decrypt-one FILE=.env.production.enc"
	@echo "  make check          sops/age の導入状況と SOPS_AGE_KEY_FILE を確認"
	@echo "  make clean-env      復号した .env* を削除（危険）"
	@echo ""
	@echo "注意:"
	@echo " - SOPS_AGE_KEY_FILE で age 鍵ファイルを指定してください"
	@echo " - 平文の .env* は gitignore 推奨です"
	@echo " - updatekeys は復号できる人だけが実行できます（対応する秘密鍵が必要）"
	@echo " - .env* / .env*.enc / Makefile は UTF-8 + LF で保存してください（CRLF だと SOPS が失敗します）"

check:
	@command -v $(SOPS) >/dev/null 2>&1 || { echo "ERROR: sops が見つかりません"; exit 1; }
	@command -v age-keygen >/dev/null 2>&1 || { echo "ERROR: age-keygen が見つかりません"; exit 1; }
	@echo "OK: sops=$$(command -v $(SOPS))"
	@echo "OK: age-keygen=$$(command -v age-keygen)"
	@echo "SOPS_AGE_KEY_FILE=$${SOPS_AGE_KEY_FILE:-<未設定>}"
	@echo "ENV_FILES=$(ENV_FILES)"

encrypt:
	@set -eu; \
	for f in $(ENV_FILES); do \
		if [ -f "$$f" ]; then \
			echo "[暗号化] $$f -> $$f.enc"; \
			$(SOPS_DOTENV) --encrypt "$$f" > "$$f.enc"; \
		else \
			echo "[スキップ] $$f（見つかりません）"; \
		fi; \
	done

decrypt:
	@set -eu; \
	for f in $(ENC_FILES); do \
		if [ -f "$$f" ]; then \
			out=$${f%.enc}; \
			echo "[復号] $$f -> $$out"; \
			$(SOPS_DOTENV) --decrypt "$$f" > "$$out"; \
		else \
			echo "[スキップ] $$f（見つかりません）"; \
		fi; \
	done

# 重要:
# - updatekeys は「そのファイルを復号できる人」だけが実行できます（対応する秘密鍵が必要）
# - 平文の内容は変えずに、.sops.yaml の recipients に合わせて鍵ラップだけ更新します
updatekeys:
	@set -eu; \
	for f in $(ENC_FILES); do \
		if [ -f "$$f" ]; then \
			echo "[鍵更新] $$f"; \
			$(SOPS) updatekeys --input-type dotenv -y "$$f"; \
		else \
			echo "[スキップ] $$f（見つかりません）"; \
		fi; \
	done

encrypt-one:
	@test -n "$(FILE)" || { echo "使い方: make encrypt-one FILE=.env.production"; exit 2; }
	@test -f "$(FILE)" || { echo "見つかりません: $(FILE)"; exit 2; }
	@echo "[暗号化] $(FILE) -> $(FILE).enc"
	@$(SOPS_DOTENV) --encrypt "$(FILE)" > "$(FILE).enc"

decrypt-one:
	@test -n "$(FILE)" || { echo "使い方: make decrypt-one FILE=.env.production.enc"; exit 2; }
	@test -f "$(FILE)" || { echo "見つかりません: $(FILE)"; exit 2; }
	@out=$${FILE%.enc}; \
	echo "[復号] $$FILE -> $$out"; \
	$(SOPS_DOTENV) --decrypt "$$FILE" > "$$out"

clean-env:
	@set -eu; \
	for f in $(ENV_FILES); do \
		if [ -f "$$f" ]; then \
			echo "[削除] $$f"; \
			rm -f "$$f"; \
		fi; \
	done
