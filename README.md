# IGEV Project - Covid Cases in Europe

This Repo is for my **Project** in the class *Graphical User Interfaces and Virtual Environments*. To see it live in your browser, follow this link: [https://jschiefner.github.io/](https://jschiefner.github.io/). Because this project is for a spanish class, the interface is also spanish 🇪🇸.

<center>
    <a href="https://jschiefner.github.io/" target="_blank">
        <img src="https://github.com/jschiefner/proyecto-covid-threejs-igev/blob/main/screencast.gif?raw=true">
    </a>
</center>

## Project Structure

There are two parts in the repo, a `frontend` folder containing all the code for the visualization and the single page vue app. The `preprocessing` folder contains scripts which preprocess the data from the data sources mentioned below and makes it ready for the frontend to be used.

Use `npm install` in both folders to install dependencies. For the `frontend` you can then use `npm run dev` in the `frontend` folder to run the application on a local development server. In the `preprocessing` folder you can run `npm run update` to update the database with the latest covid data. This needs to be pulled from the data source below first. You also need a postgres database that will hold the covid data. Once imported into the database, it can be written to a json file with `npm run create-covid-file`, this needs to be copied into the `frontend/public/` folder and be required in the frontend code.

## Data

 - [https://www.ecdc.europa.eu/en/publications-data/weekly-subnational-14-day-notification-rate-covid-19](https://www.ecdc.europa.eu/en/publications-data/weekly-subnational-14-day-notification-rate-covid-19) to download covid data
 - [https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts](https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts) to download territorial data which makes it possible to draw the borders on the map.

Data samples up to a certain point are already included in this repository.
