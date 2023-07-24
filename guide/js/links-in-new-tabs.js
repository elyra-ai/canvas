// This takes any external links and adds _blank to make sure they open in a new tab. Links to other
// pages within the documentation will remain in the same tab
// Source: https://stackoverflow.com/questions/4425198/can-i-create-links-with-target-blank-in-markdown#answer-4425214

var links = document.links;
for (var i = 0, linksLength = links.length; i < linksLength; i++) {
   if (links[i].hostname != window.location.hostname) {
       links[i].target = '_blank';
   }
}
