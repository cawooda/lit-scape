const QUOTABLE_URL = "https://api.quotable.io";
const QUOTABLE_TAGS_ENDPOINT = "/tags";
const QUOTES_ENDPOINT = "/quotes";
const OPEN_LIBRARY_BIO_URL = "https://openlibrary.org/authors"

const OPEN_LIBRARY_AUTHOR_URL = "https://openlibrary.org/subjects"

const quoteList = [];
const LIMIT = 150;
const testing = true;

//this sets the jquery item for the search bar
const $searchBar = $('#search-bs-class');
const $searchButton = $('#search-btn');

//this creates a jquery reference to the tagList below the search bar.
const $tagList = $('#tag-list');
const $twitterClick = $('#twitter-click');
//this produces 5 random tags from the genre list under the search bar.


startup(testing);

// as a developer, when I call a fetch function for fetchTags it returns a list of 
// tags that are available at the QUOTES_URL.



//this sets up the available genres to use based on the quoteable site. 

async function startup(testing) {
    if (!testing) {
        genres = await fetchTags(); //fetches all tages from quoteable site
    }
    console.log(genres);
    await populateTagList(return5RandomGenres(genres));
}

async function update() {
    console.log("update genres: ", genres);
    console.log("update return 5: ", return5RandomGenres(genres));
    populateTagList(return5RandomGenres(genres));
}

startup();




//this function gets a 5 long random list from the whole genres list and appends a button for each of the 5 into the 
//$tagList jquery div.

//event handler that sets a function to handle the button clicks bubling up to the div taglist.
$tagList.on('click', function (e) {
    
    const genre = $(e.target).data('genre');
    //set the search bar value
    $searchBar.val(genre);
    //trigger a search
    handleSearch($searchBar.val());
    $authors.append(`<h2 class = "text text-4xl">searching for greatness...</h2>`);
    //delete the button just pressed
    $(e.target).remove();
    //repolulate the taglist.
    update();
});

$searchButton.on('click', function (e) {
    e.preventDefault();
    handleSearch($searchBar.val());
    $authors.append(`<h2 class = "text text-4xl">searching for greatness...</h2>`);
    update();
});

$searchButton.on('submit', function (e) {
    e.preventDefault();
    handleSearch($searchBar.val());
    $authors.append(`<h2 class = "text text-4xl">searching for greatness...</h2>`);
    update();
});



function populateTagList(genres) {

    //console.log("taglist: ", $tagList);
    $tagList.empty();
    $tagList.append(`<div><h3 class="text-white font-bold text-3xl">Some Ideas...</h3></div>`);
    for (buttonName of genres) {
        $tagList.append(`<button data-genre="${buttonName}"class="flex-2 mx-5 my-auto p-2 rounded-3xl w-auto leading-7  bg-sky-100 hover:bg-sky-600 font-bold text-xl4 capitalize text-center focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 border sm:mb-4 xs:mb-4 shadow-sm">${buttonName}</button>`)
    }

}
//returns 5 random itesm from an array
function return5RandomGenres(genres) {
    console.log("genres to return 5: ", genres);
    let arr = []
    for (let x = 0; x < 5; x++) {
        arr.push(genres[Math.floor(Math.random() * genres.length) + 1]);
    }
    console.log("arr in return: ", arr);
    return arr;
}





// https://openlibrary.org/authors/OL24529A.json
//console.log('fetch bio', fetchBiography("OL24529A"));


//run first to setup auto complete for search bar. can use const tags = fetchTags()
//fetchTags now fetches once and stores in local storage so that it doesent have 
//to keep making calls.
async function fetchTags() {
    let localTags = JSON.parse(localStorage.getItem('tagList'));
    if (localTags) return localTags ;

    params = "?limit=50"; //option to add parameters
    fetchUrl = `${QUOTABLE_URL}${QUOTABLE_TAGS_ENDPOINT}${params}`;
    let tagList = [];
    let headers = new Headers();

    /*     headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Origin', 'http://localhost:3000');
 */


        const response = await fetch(fetchUrl);
        const data = await response.json();    
            for (dataPoint of data) {
                tagList.push(dataPoint.slug);
                }

    localStorage.setItem('tagList',JSON.stringify(tagList));
        //console.log("tagList found in localstorage:");
    return tagList;
    //taglist is a result of the type array, containing an array of objects which 
    //can act like a genre search in relation to books from https://api.quotable.io"

}


//https://openlibrary.org/subjects/love.json
//authors funciton, it returns an array of authors in a particular genre
//authorlist is a result of the type array, containing an array of objects which 
//represent a book per opbject in the .results object of the data returned. https://api.quotable.io"
///search/authors?query=Einstein


async function fetchAuthors(tag) {

    let authors = localStorage.getItem(`author-tag-${tag}`)

    if (authors) return authors;
    
    const limit = 150;
    params = `${tag}.json`; //option to add parameters
    fetchUrl = `${OPEN_LIBRARY_AUTHOR_URL}/${params}`

    let authorList = [];
    const response = await fetch(fetchUrl);
    const data = await response.json();
    //console.log("data.works: ", data.works);      
    for (dataPoint of data.works) {
        //console.log("author Object: ", dataPoint.authors[0]);
        let name = dataPoint.authors[0].name.toLowerCase();
        let id = dataPoint.authors[0].key.replace("/authors/","");
        authorList.push({name:name,id:id});
    }
    console.log("author List ", authorList);

    localStorage.setItem(`tag-${tag}`, JSON.stringify(authorList));
    return authorList;
};

//similar to test code funciton below.    
async function handleSearch() {
    const term = $searchBar.val();
    //console.log("term:", term)
    const authorList = await fetchAuthors(term);
    const list = await (fetchQuotesToAuthor(authorList));
    renderAuthorList(list);
}

/* async function test() {
    let tag = 'science';
    let nameScience = await fetchAuthors(tag);
    //console.log("name science: ",nameScience);
    //console.log("full list called: ", await fullList(nameScience));
    renderAuthorList(await fullList(nameScience));
} */

//test();



//Helper
function nameToSlug(name) {
    let newName = name.replace(" ", "-");
    newName = newName.replace(",", "");
    return newName.replace(".", "");
}
//
// full list takes arra of names. outputs a 2 dimentional array of {name:name,quotes:[quotes]}

async function fetchQuotesToAuthor(list) {
    let returnArray = [];
    //console.log("full li: ", list);

    for (item of list) {
            item.imageUrl = `https://covers.openlibrary.org/a/olid/${item.id}-S.jpg`,
            item.quotes = await fetchQuotes(nameToSlug(nameToSlug(item.name)))
    }
        //console.log("fetchQuotesToAuthor gives: ", list);

    

    return list;
}





//console.log("fetchAuthors run on  science",fetchAuthors("science"));
//console.log("fetchAuthors run on love",fetchAuthors("love"));
//console.log("fetchAuthors run on peace",fetchAuthors("peace"));
//console.log("fetchAuthors run on phoilosophy",fetchAuthors("philosophy"));



//console.log("console fetch bio: ",fetchBiography('OL25342A'));



async function fetchQuotes(author) {
    let params = `/quotes?`
    params = `${params}author=${nameToSlug(author)}`;
    
    fetchUrl = `${QUOTABLE_URL}${params}`;
    console.log(fetchUrl);
    let fetchQuotesList = [];
    //console.log("fetch quotes url", fetchUrl);
    const response = await fetch(fetchUrl)
    const data = await response.json();

    for (dataPoint of data.results) {
        //console.log(dataPoint.content);
        fetchQuotesList.push(dataPoint.content);
    }
    localStorage.setItem(`quotesList-${author}`, JSON.stringify(data))
    return fetchQuotesList;

}

//console.log('fetch quotes', fetchQuotes('ben elton'));
//console.log('fetch quotes', fetchQuotes('aldous huxley'));
//console.log('fetch quotes', fetchQuotes('william shakespeare'));


//fetch all tags from QUOTES_URL
//console.log(fetchTags()); 



$authors = $("#author-container").addClass('container');

function renderAuthorList(authorList) {
    //console.log("renderAuthourList called",authorList);
    $authors.empty();
    for (author of authorList) {
        $authors.append(createAuthorCard(author, $authors));
    }
}



//console.log("calling getAuthorsFromWorks(fetchAuthors('science')): ", getAuthorsFromWorks(fetchAuthors('science')));
//console.log("calling renderAuthorList(getAuthorsFromWorks(fetchAuthors('science'))) ", renderAuthorList(getAuthorsFromWorks(fetchAuthors('science'))));
function escape (string) {
    
}


function renderQuotesList(quotesArray, author) {
    //console.log("quotes Array", quotesArray);
    //console.log("quotes Array author", author);
    $returnElement = $(`<div id="quotes-by-${nameToSlug(author)}"></div>`);
    for (let x = 0; x < quotesArray.length; x++) {
        const $quoteContainer = $(`<div class="container mx-auto columns-1 mt-2"></div>`);
        const $quote = $(`<p id="quote-${author}-${x}" class="quote text-xl4 mb-4 gap-y-3 leading-loose italic text-coolGray-900 ">${quotesArray[x]}</p>`);
        const $quoteCopy = $(`<button id="quote-copy-${x} class="class="col-span-2 text-blue-900 bg-yellow-300 hover:bg-yellow-200 rounded-lg w-full sm:w-auto py-1 px-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 items-center inline-flex justify-center">copy</button>`); 
        $quoteCopy.on('click',(e) =>{
            navigator.clipboard.writeText(`${quotesArray[x]}`);
            let quote = quotesArray[x].replace(" ","%20");
            $twitterClick.attr('href',`https://twitter.com/intent/tweet?text=I%20got%20lit%20%23Litscape%20${quote} -${author}`) 
            let secondsRemaining = 1;
                $quoteCopy.text(`copied`);
                $quote.addClass('copied bold');
            const interval = setInterval(() => {
                // just for presentation
                $quoteCopy.text(`copied`);
                $quote.addClass('copied bold');

        // time is up
            if (secondsRemaining === 0) {
                clearInterval(interval);
                $quoteCopy.text(`copy`);
                $quote.removeClass('copied')
            }

            secondsRemaining--;
            }, 200);
            
            
        })
        $quoteContainer.append($quote);
        $quoteContainer.append($quoteCopy);
        $returnElement.append($quoteContainer);
        //console.log($returnElement);
    }



    //console.log("return element: ", $returnElement);
    return $returnElement;
}

async function createAuthorCard(author, $appendTo) {
    //this needs developing, by taking the code out from getAuthourWorks function and putting it in 
    //here we get an authorcard we can append to the authorcontainer div
    // The author object should be name, biography, quotes list, place of birth, weather in place of birth, etc.

    const blankAuthor = {
        name: "",
        imageUrl: "",
        quotes: []
    }
    const list = await renderQuotesList(author.quotes, author.name);

    // only display author cards with quotes
    if (author.quotes.length === 0) {
        return;
    }

    let $authorCard = $(`<div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-4 mb-10"></div>`);
    let $authorInnerContainer = $(`<div class="max-w-xs mx-auto md:ml-0"></div>`);
    let $authorImage = $(`<img class="w-24 h-24 mb-6 rounded-full" src="${author.imageUrl}" alt="">`);
    let $authorName = $(`<h3 class="mb-1 text-lg text-coolGray-800 font-semibold">${author.name}</h3>`);
    let $authorQuotesTitle = $(`<span class="inline-block mb-4 text-lg font-medium text-green-500">Quotes</span>`)
    let $authorQuotesText = $(`<div id="${nameToSlug(author.name)}"></div>`)
    for (let x = 0; x < list.length; x++) {
        $authorQuotesText.append(list[x])
    }

    $authorInnerContainer.append($authorImage);
    $authorInnerContainer.append($authorName);
    $authorInnerContainer.append($authorQuotesTitle);
    $authorInnerContainer.append($authorQuotesText);
    $authorCard.append($authorInnerContainer);
    $appendTo.append($authorCard);



}

/*  */









//console.log(getAuthorsFromWorks(fetchAuthors('science'))); 
//console.log(getAuthorsFromWorks(fetchAuthors('comedy'))); 



function fetchBiography(key) {
    params = ""; //option to add parameters
    fetchUrl = `https://openlibrary.org/${key}.json?${params}`;
    bioReturn = "";

    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin', 'http://localhost:3000');


    fetch(fetchUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            //console.log("fetchbiography: data ", data);
            //console.log("name is", data.name);
            //console.log("type of bio", typeof(data.bio));
            if (typeof (data.bio) == String) {
                //console.log("bio.value not there");
                bioReturn = data.bio;
            } else {
                //console.log("bio.value there",data.bio.value);
                bioReturn = data.bio.value;
            }
            //console.log("bio return", bioReturn);

        });
    return bioReturn;
}


//modal



const $settingsButton = $('#settings-btn');
console.log($settingsButton);

const $settingsModal = $('#settings-modal');
const $settingsEmailInput = $('#email-input-settings');
const $numberOfResults = $('#number-of-results-input-settings');
const $yesToEmails = $('#get-emails-input-yes');
console.log($yesToEmails.prop('checked'));

const $saveSettingsBtn = $('#submit-settings-btn');

$settingsButton.on('click',(e)=>{
    console.log("settings clicked");
    toggleSettings();
    e.preventDefault();
});

function toggleSettings () {
    console.log("settings clicked");
    $settingsModal.toggleClass('pointer-events-none')
    $settingsModal.toggleClass('opacity-0')
    $settingsEmailInput.val(localStorage.getItem('submitted-email'));
}

$saveSettingsBtn.on('click',(e)=>{
    e.preventDefault();
    handleSettings();
    toggleSettings();
    
});

function handleSettings() {
    localStorage.setItem('submitted-email',$settingsEmailInput.val());
    localStorage.setItem('number-of-results',$numberOfResults.val()||10);
    console.log($yesToEmails.prop('checked'));
    localStorage.setItem('yes-to-emails',$yesToEmails.prop('checked'));
}

$modalForm = $('#modalForm');
$modalSubmitBtn = $('#modalSubmit');
$modalSubmitBtn.on('click',handleModalSubmit);

function handleModalSubmit() {

    $items = $modalForm.children();
    //console.log($items[1].value);
    console.log($($items[1]).val());
    
    const email = $items[1].value;
    if (!email) return false;
    localStorage.setItem('submitted-email',email);
    toggleModal();
}

const overlay = document.querySelector('.modal-overlay')
overlay.addEventListener('click', toggleModal)
  
var closemodal = document.querySelectorAll('.modal-close')
for (var i = 0; i < closemodal.length; i++) {
    closemodal[i].addEventListener('click', toggleModal)
}
  

  function toggleModal () {
    const body = document.querySelector('body')
    const modal = document.querySelector('.modal')
    modal.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal-active')
  }

  //! added for development
  if (!localStorage.getItem('submitted-email')) {
    
    toggleModal();
  }


