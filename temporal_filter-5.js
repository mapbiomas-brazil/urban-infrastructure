/* 
======================================

### Temporal Filter V  ###
Origin Collection: 6

# Notes
- Remember to Change asset path in ExportImage function (assetID)
- Forms for reporting bugs and suggestions link: https://forms.gle/BJZbeZjYA5prQYACA
- The aim is to check area consistency and consolidate the classification.

=======================================
*/


var imageVisParam = {"opacity":1,"bands":["classification_1999"],"max":1,"gamma":1},
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-77.50171350239748, 6.5025740143888955],
          [-77.50171350239748, -35.664852805616775],
          [-34.08374475239747, -35.664852805616775],
          [-34.08374475239747, 6.5025740143888955]]], null, false);


//Defines the input asset and delimits the export area
var ExportImage = function(image, geometry, year){

    var imageName =  String(year) + '-gr5-' + 1;
    
    Export.image.toAsset({
        "image": image,
        "assetId":"users/edimilsonrodriguessantos/MAPBIOMAS/INFRAURBANA6-FT-v6" +'/'+ imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };

var input_asset = 'users/edimilsonrodriguessantos/MAPBIOMAS/INFRAURBANA6-FT-v6/'

//Defines the list of years considered and separates the final years
var firstYear = [1985]

var years = [
  1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
  2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,
  2015, 2016, 2017, 2018, 2019, 2020
  ]

//Apply the filter for the reference year considered to be 1986  
var img0 = ee.Image(input_asset + '1986-gr4-1').unmask().rename('classification_1986')

  ExportImage (img0, geometry, '1986')
  Map.addLayer(img0.select('classification_1986'), {gamma: 1, max: 1, opacity: 0.4}, 'classification_1986')  
  
  years.map(function(year){
  var prev = year - 1
  
  var year_prev = img0.select('classification_' + prev)
  var year_0 = ee.Image(input_asset + year + '-gr4-' + 1).unmask().select('remapped')
  
  var imgResult = year_0.where(year_prev.add(year_0).divide(2).eq(0.5), 1).rename('classification_' + year)
  img0 = img0.addBands(imgResult)
  
  ExportImage (imgResult, geometry, year)
  })

//Add the map on the screen
years.map(function(year){
  Map.addLayer(img0.select('classification_' + year), {gamma: 1, max: 1, opacity: 0.4}, 'classification_' + year)  
})


firstYear.map(function(year){
  var next = year + 1
  
  var year_next = img0.select('classification_' + next)
  var year_0 = ee.Image(input_asset + year + '-gr4-' + 1).unmask().select('remapped')
  
  var imgResult = year_0.where(year_0.eq(1).and(year_next.eq(0)),0).rename('classification_' + year)
  img0 = img0.addBands(imgResult)
  
  Map.addLayer(img0.select('classification_' + year), {gamma: 1, max: 1, opacity: 0.4}, 'classification_' + year)  
  ExportImage (imgResult, geometry, year)

})