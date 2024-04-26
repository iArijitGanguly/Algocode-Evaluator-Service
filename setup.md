# SetUp brand new Typescript Experess project

1. npm init -y
-----------------

2. npm install -D typescript
   npm install concurrently
---------------------------------

3. npx tsc --init
---------------------------------

4. uncomment this optins in tscomfig.json file
    - "outDir": "./dist",
    - "noImplicitAny": true,
    - "strictNullChecks": true,                            
    - "strictFunctionTypes": true,
    - "noUnusedLocals": true,
    - "noUnusedParameters": true, 

    And add this two options 
        - "exclude": ["node_modules"],
        - "include": ["src/**/*.ts"]
        
    You can add more config changes accordong to your project
------------------------------------------------------------------------

5. Add the following scripts in packege.json
{
    "build": "npx tsc",
    "watch": "npx tsc -w",
    "prestart": "npm run build",
    "start": "npx nodemon dist/index.js",
    "dev": "npx concurrently --kill-others \"npm run watch\" \"npm start\""
}
------------------------------------------------------------------------------

6. npm run dev
----------------------