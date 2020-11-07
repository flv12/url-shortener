![URL Shortener](src\scissors_yellow.png "URL Shortener")

# URL Shortener

<img src="https://cdn.pixabay.com/photo/2012/04/11/15/19/france-28463_1280.png" width="30"/>

**URL Shortener** est un projet fullstack de raccourcisseur de liens HTTP.

Le traitement des données utilise le langage Node.js et son framework Express.js. Les données sont stockées dans une base de données SQLite3. Du javascript vanilla pour le front-end, la gestion des événements, et les requêtes HTTP.

Le tout empaqueté à l'aide de Parcel.

<br>

<img src="https://cdn.pixabay.com/photo/2015/11/06/13/29/union-jack-1027898_1280.jpg" width="30"/>

**URL Shortener** is a fullstack HTTP link shortener project.

It uses the Node.js language and its Express.js framework. The data is stored in a SQLite3 database. Vanilla javascript for the front end, event management, and HTTP requests.

All of this packaged with Parcel bundler.

# Security Notes

- Added node-forge >= 0.10.0 to deal with CVE-2020-7720, vulnerable with util.setPath function :
  - https://nvd.nist.gov/vuln/detail/CVE-2020-7720
  - https://github.com/digitalbazaar/forge/blob/master/CHANGELOG.md#0100---2020-09-01
  - https://snyk.io/vuln/SNYK-JAVA-ORGWEBJARSNPM-609293

# How to use

Go to [url-shortener4.glitch.me](https://url-shortener4.glitch.me/), hosted on glitch.me
