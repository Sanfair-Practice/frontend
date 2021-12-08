include docker.mk

.PHONY: npm

npm:
	cd ../app && npm $(filter-out $@,$(MAKECMDGOALS))

