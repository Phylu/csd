# Cyber Security Dashboard

Cyber Security Dashboard for my Master's Thesis at TUM

## Installation

To compile the data needed for the dashboard, you will need a npm environment:
https://docs.npmjs.com/getting-started/what-is-npm

Run:

`npm install`

`node_modules/browserify/bin/cmd.js -t browserify-css js/dashboard.js > js/bundle.js`

This should download and install all the needed files.

## Run Dashboard

Start the node.js webserver (or use any other webserver of your choice) to make sure that the ajax requests work:

`node_modules/http-server/bin/http-server`

Open http://127.0.0.1:8080/ in your browser

## Data Input

Beware that you will need to get your data from somewhere if you want to have a useful dashboard.
The data is provided by two .csv files: advisories.csv and incidents.csv.

THE .CSV FILES IN THIS REPOSITORY ARE RANDOMLY GENERATED DATA. DO NOT USE THESE FILES FOR PRODUCTIVE USE.

Use the sampler python script to create different random data for testing if needed:

`python sampler/sampler.py`