This project is a demo for Payfone's (now Prove) APIs and for several European telecoms including Vodafone and SFR, created in the summer of 2019.

The original repository was migrated to this one to avoid issues with API keys. Running this project in its current state won't work since the necessary API keys are not included.

## React
This project's view is written in ReactJs. These files can be found under the `src` directory. The functional components are in `src/components/` and the utilities are in `src/utils/`. Asset components are in `src/assets/` and various constant global variables are in `src/session-variables.js`.

## Server
The server for this project was written in NodeJs. These files can be found in the `api-server/` directory. This server runs on an arbitrary port as defined in a `.env` file. The main server file is in `api-server/web/server.js`. The server here uses various utilities located in`api-server/api/payfone/token.js` and in `api-server/utils/`. Essentially, the server generates API tokens to access various telecoms to validate a phone number.

## Running
Running this project right now would not work! Several important API keys, urls, and environment files are missing that are essential for the project and user flow to function. But, for now, you can peruse through the files and examine how they work. The most important functions are in `api-server/web/server.js` and `src/components/`. These files use various utilities located throughout the file structure as well which are included in various `utils/` directories.
