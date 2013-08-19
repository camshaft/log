
build: components index.js
	@component build --standalone log

components: component.json
	@component install

clean:
	rm -fr build components

.PHONY: clean
