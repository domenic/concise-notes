install:
	npm install;
	git clone https://github.com/FortAwesome/Font-Awesome.git tmp;

copy:
	mkdir -p source/font/roboto;
	cp tmp/fonts/* source/font/;
	cp node_modules/materialize-css/dist/font/roboto/* source/font/roboto/;
	mkdir -p source/css/materialize;
	cp node_modules/materialize-css/dist/css/materialize.css source/css/materialize/;

build:
	make clean;
	make install;
	make copy;

clean:
	rm -rf ./tmp;
	rm -rf ./source/font;
	rm -rf ./source/css/materialize;
