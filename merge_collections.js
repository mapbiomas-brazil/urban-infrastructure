/* 
======================================

### Merge Collections ###
Origin Collection: 6

# Notes
- Remember to Change asset path in ExportImage function (assetID)

=======================================
*/


var geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-76.30506861133325, 7.085011849648235],
          [-76.30506861133325, -34.46541371522163],
          [-25.24061548633326, -34.46541371522163],
          [-25.24061548633326, 7.085011849648235]]], null, false);



var listYears = [1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
                 2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,
                 2015,2016,2017,2018,2019,2020]

var ExportImage = function(image, geometry, year){

    var imageName =  String(year);
    
    Export.image.toAsset({
        "image": image,
        "assetId":"users/breno_malheiros/mapbiomas/INFRAURBANA6-FE-v6" + '/' + imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };
  
  
var merge = listYears.map(function(year){
  //Images of first spatial filter 
  var img1 = ee.Image('users/breno_malheiros/mapbiomas/INFRAURBANA6-FE-v3'+ '/' + year).eq(24) 
  //Images of second spatial filter 
  var img2 = ee.Image('users/breno_malheiros/mapbiomas/INFRAURBANA6-FE-v4'+ '/' + year).eq(24)
  
  var result = ee.ImageCollection([img1,img2]).sum().gte(1)
  result = result.remap([1],[24])  
  //Map.addLayer(result)
  
  ExportImage(result,geometry,year)
})



