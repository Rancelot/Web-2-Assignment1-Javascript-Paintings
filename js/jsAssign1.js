/*global fetch*/
/*global info*/
/*global google*/
/*global localStorage*/
/*global speechSynthesis*/
/*global SpeechSynthesisUtterance*/

window.addEventListener('load', function () {
    const mainLink = "https://www.randyconnolly.com/funwebdev/services/art/galleries.php";
    
    if(localStorage.getItem("galleryInfo") == undefined) {
        console.log('localstorage does not contain galleryInfo');
        fetch(mainLink)
        .then( response => response.json() )
        .then( data => {
            updateStorage('galleryInfo', data);
            generateGalleries(data);
        })
        .catch( error => console.log(error) );
    }
    else {
        console.log('localStorage contains galleryInfo');
        generateGalleries(retrieveStorage('galleryInfo'));
    }
    
    let displayMap = document.querySelector(".d").style.display = "none";
    
    document.querySelector("#closeButton").addEventListener('click', function() {
        closeSingleView();
    });
    
    document.querySelector("#titleSpeakButton").addEventListener('click', function() {
        let titleContent = document.querySelector("#singleTitle").textContent;
        generateSpeech(titleContent);
    });
    
    document.querySelector("#descSpeakButton").addEventListener('click', function() {
        let descriptionContent = document.querySelector("#singleDesc").textContent;
        generateSpeech(descriptionContent);
    });
    
});

/**
 * Local Storage Functions
 * 
 * retrieveStorage
 * @param key - the name associated with the json data
 * 
 * updateStorage
 * @param label - the name associated with the json data
 * @param data - the json data itself
 */
function retrieveStorage(key) {
    console.log("Retrieving " + key);
    return JSON.parse(localStorage.getItem(key));
}
function updateStorage(label, data) {
    localStorage.setItem(label, JSON.stringify(data));
}

/**
 * Generates the list of galleries in the api
 * 
 * @param galleries - the json galleries data
 */
function generateGalleries(galleries) {
    let bList = document.querySelector("#galleryList");
    let alphabGalleries = sortGalleries(galleries);
    //loop below generates the list of galleries from fetched data
    for( let info of alphabGalleries ) {
        let name = document.createElement('li');
        let content = document.createTextNode(info.GalleryName);
        name.appendChild(content);
        bList.appendChild(name);
    }
    let itemsLi = document.querySelectorAll("#galleryList li");
    //loop below that creates a click event for all galleries
    itemsLi.forEach(function (item) {
        item.addEventListener('click', function (e) {
            galleryMapDetails(e, alphabGalleries);
        });
    });
}

/**
 * Sorts the galleries based on their GalleryName property
 * 
 * @param sortGalleries - the json gallery data
 */
function sortGalleries(sortGalleries) {
    sortGalleries.sort(function(a,b) {
        if (a.GalleryName < b.GalleryName){return -1;}
        else if (a.GalleryName > b.GalleryName){return 1;}
        else {return 0;}
    });
    return sortGalleries;
}

/**
 * Generates information about selected gallery
 * 
 * @param e - the selected gallery name
 * @param galleries - the json data of all the galleries
 */
function galleryMapDetails(e, galleries) {
    const aBlock = document.querySelector("div.a section").style.display = "grid";
    const cBlock = document.querySelector("div.c section").style.display = "block";
    
    //selecting elements in the HTML page that will contain gallery information
    let label = document.querySelector("#galleryName");
    let nativeName = document.querySelector("#galleryNative");
    let city = document.querySelector("#galleryCity");
    let address = document.querySelector("#galleryAddress");
    let country = document.querySelector("#galleryCountry");
    let home = document.querySelector("#galleryHome");
    
    //Loop that searches through the api for the right gallery 
    //Applies the information of the selected gallery onto the elements above
    for (let info of galleries) {
        if (e.target.textContent == info.GalleryName){
            label.textContent = info.GalleryName;
            nativeName.textContent = info.GalleryNativeName;
            city.textContent = info.GalleryCity;
            address.textContent = info.GalleryAddress;
            country.textContent = info.GalleryCountry;
            home.textContent = info.GalleryWebSite;
            //initMap(info.Latitude, info.Longitude);
            fetch("https://www.randyconnolly.com/funwebdev/services/art/paintings.php?gallery=" + info.GalleryID)
                .then( response => response.json() )
                .then( data => {
                    generatePaintings(data);
                }).catch( error => console.log(error) );
        }
    }
}

/**
 * Generates painting data within the selected gallery
 * 
 * @param paintings - the json file containing the data of paintings associated with the selected gallery
 */
function generatePaintings(paintings) {
    
    let sortedData = paintings;
    const paintingBlock = document.querySelector("#paintingList");
    
    document.querySelector("#artist").addEventListener('click', function() {
        console.log("artist sort event");
        sortedData = sortArtist(sortedData, paintingBlock);
    });
    
    document.querySelector("#title").addEventListener('click', function() {
        console.log("title sort event");
        sortedData = sortTitle(sortedData, paintingBlock);
        
    });
    
    document.querySelector("#year").addEventListener('click', function() {
        console.log("year sort event");
        sortedData = sortYearOfWork(sortedData, paintingBlock);
        
    });
    
    //Default sort intially displayed based on artist last name
    sortedData = paintings.sort( function(a,b) {
        if (a.LastName.toLowerCase() < b.LastName.toLowerCase()){return -1;}
        else if (a.LastName.toLowerCase() > b.LastName.toLowerCase()){return 1;}
        else {return 0;}
    });
    
    paintingGenerator(sortedData, paintingBlock);
}

/**
 * Various sorting functions based on artist last name,
 * painting title, and year of painting.
 * 
 * @param paintings - the list of painting objects to be sorted
 * @param block - the section element where the paintings will be inserted into
 */ 
function sortArtist(paintings, block) {
    paintings.sort( function(a,b) {
        if (a.LastName.toLowerCase() < b.LastName.toLowerCase()){return -1;}
        else if (a.LastName.toLowerCase() > b.LastName.toLowerCase()){return 1;}
        else {return 0;}
    });
    paintingGenerator(paintings, block);
    return paintings;
}
function sortTitle(paintings, block) {
    paintings.sort( function(a,b) {
        if (a.Title < b.Title){return -1;}
        else if (a.Title > b.Title){return 1;}
        else {return 0;}
    });
    paintingGenerator(paintings, block);
    return paintings;
}
function sortYearOfWork(paintings, block) {
    paintings.sort( function(a,b) {
        if (a.YearOfWork < b.YearOfWork){return -1;}
        else if (a.YearOfWork > b.YearOfWork){return 1;}
        else {return 0;}
    });
    paintingGenerator(paintings, block);
    return paintings;
}

/**
 * This function is an extension of the generatePaintings function which
 * generates the variety of painting information associated with
 * the selected gallery
 * 
 * @param sorted - the sorted list of paintings
 * @param block - the section element that will contain the paintings
 */
function paintingGenerator(sorted, block) {
    let paintRows = document.getElementsByClassName("row");
    classClearer(paintRows);
    //loop below generates new sorted painting data
    for (let paint of sorted) {
            let lName = document.createTextNode(paint.LastName);
            let title = document.createTextNode(paint.Title);
            let year = document.createTextNode(paint.YearOfWork);
            
            let paintElement = document.createElement("ul");
            let thumbnail = document.createElement("li");
            let lastName = document.createElement("li");
            let paintTitle = document.createElement("li");
            let yearOfWork = document.createElement("li");
            
            let imgElement = document.createElement("img");
            imgElement.setAttribute("src", "images/square-small/" + paint.ImageFileName + ".jpg"); 
            imgElement.setAttribute("class", "image");
            
            let titleLink = document.createElement("a");
            titleLink.setAttribute("href","#" + paint.Title);
            titleLink.appendChild(title);
            
            thumbnail.appendChild(imgElement);
            lastName.appendChild(lName);
            paintTitle.appendChild(titleLink);
            yearOfWork.appendChild(year);
            
            //the "row" class below is made in order to delete all painting
            //elements when re-sorting the list
            paintElement.setAttribute("class", "row"); 
    
            paintElement.appendChild(thumbnail);
            paintElement.appendChild(lastName);
            paintElement.appendChild(paintTitle);
            paintElement.appendChild(yearOfWork);
            
            //each link in the painting gallery have an event listener 
            //in order to display the single painting view
            titleLink.addEventListener('click', function(e) {
                generateSingleView(e, sorted);
            });
            
            block.appendChild(paintElement);
    }
}

/**
 * Transforms the webpage into the Single painting view
 * with the selected painting's details
 * 
 * @param e - the selected link element
 * @param gPaintList - the selected gallery's painting list
 */
function generateSingleView(e, gPaintList) {
    document.querySelector(".a").style.display = "none";
    document.querySelector(".b").style.display = "none";
    document.querySelector(".c").style.display = "none";
    document.querySelector(".d").style.display = "none";
    document.querySelector(".single").style.display = "block";
    console.log("single view displayed");
    
    let museumWikiLinks = document.getElementsByClassName("links");
    classClearer(museumWikiLinks);
    
    gPaintList.forEach(function(s){
        if(e.target.textContent == s.Title) {
            generateSingleDetails(s);
        }
    });
    
}

/**
 * This function generates the data of the painting clicked onto its proper elements.
 * 
 * @param s - the selected object/painting to be displayed
 */
function generateSingleDetails(s) {
    let image = document.querySelector("#singlePaint");
    image.setAttribute("src", "images/medium/" + s.ImageFileName + ".jpg");
    
    document.querySelector("#singleTitle").textContent = s.Title;
    
    let first = nameChecker(s.FirstName);
    let last = nameChecker(s.LastName);
    
    document.querySelector("#singleArtist").textContent = first + " " + last;
    let text = s.YearOfWork + ", " + s.Medium + ", " + s.Height + "x" + s.Width + ", " + s.CopyrightText;
    document.querySelector("#singleYMSC").textContent = text;
    
    
    let linkBlock = document.querySelector("#singlePaintLinks");
    
    let liMuseum = document.createElement("li");
    let aMuseum = document.createElement("a");
    aMuseum.setAttribute("href", s.MuseumLink);
    aMuseum.appendChild(document.createTextNode("Museum Link to " + s.Title));
    liMuseum.appendChild(aMuseum);
    
    let liWiki = document.createElement("li");
    let aWiki = document.createElement("a");
    aWiki.setAttribute("href", s.WikiLink);
    aWiki.appendChild(document.createTextNode("Wiki Link to " + s.Title));
    liWiki.appendChild(aWiki);
    
    liMuseum.setAttribute("class", "links");
    liWiki.setAttribute("class", "links");
    
    linkContentChecker(s.MuseumLink, liMuseum);
    linkContentChecker(s.WikiLink, liWiki);
    
    linkBlock.appendChild(liMuseum);
    linkBlock.appendChild(liWiki);
    
    document.querySelector("#singleDesc").textContent = s.Description;
}

/**
 * Checks if the content of the first and last names are empty or not
 * 
 * @param the variable being checked if there is any data inside it
 */
function nameChecker(name) {
    if (name != null && name != "" && name != undefined) {
        return name;
    }
    else
    {
        return "";
    }
}

/**
 * Checks if the selected painting has the links it needs 
 * and hides it if the link data is empty
 * 
 * @para link - the link of the painting
 * @para element - targeted element to hide which contains the link
 */
function linkContentChecker(link, element) {
    if (link != null && link != "") {
        console.log("link exists");
    }
    else {
        element.style.display = "none";
    }
}

/**
 * In the Single painting view, when the close button is 
 * clicked, this function will be invoked.
 */
function closeSingleView() {
    document.querySelector(".a").style.display = "grid";
    document.querySelector(".b").style.display = "block";
    document.querySelector(".c").style.display = "block";
    document.querySelector(".d").style.display = "block";
    document.querySelector(".single").style.display = "none";
}

/**
 * In the Single painting view, this function is used to 
 * voice out the title name and description of the selected painting.
 * 
 * @param sentence - the text to be spoken by the speechSynthesis command
 */
function generateSpeech(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    speechSynthesis.speak(utterance);
}


/**
 * Removes the elements containing the class name.
 * 
 * @param elementsByClass - the array which contains the elements with the className to be deleted 
 */
function classClearer(elementsByClass) {
    for (let i = (elementsByClass.length - 1); i >= 0; i--) {
        elementsByClass[i].remove();
    }
}

/**
 * Generates map of selected gallery
 * 
 * @param latitude - the latitude value of the selected gallery's location
 * @param longitude - the longitude value of the selected gallery's location
 */ 
// function initMap(latitude, longitude) {
//     let divMap = document.querySelector(".map");
//     let divMapContainer = document.querySelector(".d");
//     divMapContainer.style.display = "block";
//     map = new google.maps.Map(document.querySelector(".d"), {
//                     center: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
//                     mapTypeId: 'satellite',
//                     zoom: 18
//             });
// }
