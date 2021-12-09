include docker.mk

.PHONY: yarn watch

yarn:
	docker exec -ti -e COLUMNS=$(shell tput cols) -e LINES=$(shell tput lines) $(shell docker ps --filter name='$(PROJECT_NAME)_node' --format "{{ .ID }}") yarn $(filter-out $@,$(MAKECMDGOALS))

watch:
	docker exec -ti -e COLUMNS=$(shell tput cols) -e LINES=$(shell tput lines) $(shell docker ps --filter name='$(PROJECT_NAME)_node' --format "{{ .ID }}") yarn run watch

