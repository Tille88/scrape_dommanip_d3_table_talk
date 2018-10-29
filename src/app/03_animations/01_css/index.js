import main from './main';

// From https://plainjs.com/javascript/events/running-code-when-the-document-is-ready-15/
// in case the document is already rendered
if (document.readyState!='loading') main();
// modern browsers
else if (document.addEventListener) document.addEventListener('DOMContentLoaded', main);
// IE <= 8
else document.attachEvent('onreadystatechange', function(){
    if (document.readyState=='complete') main();
});