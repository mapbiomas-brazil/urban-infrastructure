/* 
======================================
### Temporal Filter IV  ###
Origin Collection: 6
# Notes
- Remember to Change asset path in ExportImage function (assetID)
- Forms for reporting bugs and suggestions link: https://forms.gle/BJZbeZjYA5prQYACA
- The aim is to check area consistency and consolidate the classification.
=======================================
*/
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-77.50171350239748, 6.5025740143888955],
          [-77.50171350239748, -35.664852805616775],
          [-34.08374475239747, -35.664852805616775],
          [-34.08374475239747, 6.5025740143888955]]], null, false);

var cartasIBGE = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/cartas')

/*
Results: (0 and masked) = Non-urban, 1 = urban
*/

//Defines the input asset and delimits the export area to the most of years
var input_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8_3-FT/'
var outputAsset = input_asset

var versionNumber = '4'
var version = '-FT3-' + versionNumber//versão de entrada
var outputVersion = '-FT4-' + versionNumber//versão de saída
var scale = 30

// ex: 'classification_2021-FT4-3'

//Export an image
var ExportImage = function(image, imageName){
    
    var year = image.get('year').getInfo()
    
    var imageRenamed = image.rename('classification_' + year)
    
    Export.image.toAsset({
        // "image": image,
        "image": imageRenamed.toByte(),
        "assetId": outputAsset + imageName,
        "description": imageName,
        // "region": geometry,
        "region": cartasIBGE.geometry(),
        "scale": scale,
        "maxPixels": 1e13,
    });
  };

//Export an imageCollection
var downloadToAsset = function (collection){
  
  var n = collection.size().getInfo()
  
  var colList = collection.toList(n)
  
  for (var i = 0; i < n; i++) {
    
    var element = colList.get(i)
    
    var img = ee.Image(element)
    
    var obj = img.get('year').getInfo()
    
    var imageName = 'classification_' + obj + outputVersion
    
    ExportImage (img, imageName)
}}

//Apply a consolidation process considering the most of the years
var years = ee.List.sequence(1986, 2022).getInfo()

// - Obtain an image Collection of interest
var validatedCollection = ee.ImageCollection(
  years.map(
  
  function(year){
  
      var imgResult = ee.Image(input_asset + year + version).unmask()
  
  return imgResult.set('year', year)
  }))

// - Accumulate the urban areas across the years
var consolidatedCollection = ee.ImageCollection(
  years.map(
  
  function(year){
    
        var imgResult = validatedCollection.filter(ee.Filter.lte('year', year)).max()
    
    return imgResult.set('year', year)
  }))

// Map.addLayer(consolidatedCollection, {}, 'consolidatedCollection')
//- Export the results
downloadToAsset(consolidatedCollection)

//Apply a validation filter to the first year
var firstYear = [1985] 

firstYear.map(function(year){
  var next = year + 1
  
  var year_next =  ee.Image(input_asset + next + version).unmask()
  var year_0 = ee.Image(input_asset + year + version).unmask()
  
  var imgResult = year_0.where(year_0.eq(1).and(year_next.eq(0)),0)
                        .unmask()
                        .set('year', year)

  var imageName = 'classification_' + year + outputVersion
  
  ExportImage (imgResult, imageName)
  
  return imgResult
})
