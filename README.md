metroly
=======

Grunt Setup
=====

1. Install npm

2. Run: ```npm install```

3. Now you can run ```grunt``` to compile scripts


Grunt
======
```npm install```
```npm install grunt-cli```
```npm install grunt --save-dev```
```npm install almond -g```
```npm install karma@0.10.2```
```npm install chai```

```grunt``` <- default action


Compiling
======

To compile scripts using r.js:


- ```chmod +x build/build.sh```

- ```r.js -o build/app.build.js```

CSS
======

- in CSS folder when you want to add CSS for a new feature, just add
```@import 'my_new_file_name.css'``` instead of working in one huge file. Later we will compile it all into one big file.