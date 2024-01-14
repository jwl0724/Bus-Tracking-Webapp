# LAPS (link - https://comp1800-dtc15-project.firebaseapp.com/)

## 1. Project Description
State your app in a nutshell, or one-sentence pitch. Give some elaboration on what the core features are.  
This browser based web application to ... 

## 2. Names of Contributors
List team members and/or short bio's here... 
* Ealin Ran and I like dogs
* Jonathan Liu and I like video games
	
## 3. Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)
* Translink API
* Mapbox API

## 4. Complete setup/installion/usage
State what a user needs to do when they come to your project.  How do others start using your code or application?
Here are the steps ...
* Sign up for a Translink API key
* Sign up for a mapbox API key
* Sign up for firebase API key
* Replace firebaseConfig in firebaseAPI_DTC15.js with personal API key
* Create a new file called API_keys.js
* Enter the following code in the newly created file
```
var MAPBOX_API_KEY = 'MAPBOX API KEY HERE'
var FIREBASE_API_KEY = 'FIREBASE API KEY HERE'
var TRANSLINK_API_KEY = 'TRANSLINK API KEY HERE'
```

## 5. Known Bugs and Limitations
Here are some known bugs:
* Live tracking depends completely on Translink's API
* index page does not automatically logout a signed in user when deployed
* Map is unoptimized and takes up a lot of resources to run
* A bus route map is not drawn on the map


## 6. Features for Future
What we'd like to build in the future:
* Ability to draw a route on the map
* Ability to calculate optimal route for user
* Populate bus page with time table

	
## 7. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── index.html               # landing HTML file, this is what users see when you come to url
└── README.md

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for images
    /blah.jpg                # Acknowledge source
├── scripts                  # Folder for scripts
    /blah.js                 # 
├── styles                   # Folder for styles
    /blah.css                # 



```


