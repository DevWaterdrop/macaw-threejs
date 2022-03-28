main:
	npm run format && npm run lint && npm run build
local:
	make main && npm link