"use strict"

// Simulate dragging a node from the palette to the canvas
function getHarnessData(url,callback) {

    var anHttpRequest = new XMLHttpRequest();
     anHttpRequest.onreadystatechange = function() {
         if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
             callback(anHttpRequest.responseText);
     }

     anHttpRequest.open( "GET", url, true );
     anHttpRequest.send( null );
  }

module.exports = {
    getHarnessData: getHarnessData
}
