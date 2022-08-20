/* 
======================================

### Temporal Filter IV  ###
Origin Collection: 6

# Notes
- Remember to Change asset path in ExportImage function (assetID)
- Forms for reporting bugs and suggestions link: https://forms.gle/BJZbeZjYA5prQYACA
- The aim is to check area consistency and consolidate the classification.

=======================================


var geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-77.50171350239748, 6.5025740143888955],
          [-77.50171350239748, -35.664852805616775],
          [-34.08374475239747, -35.664852805616775],
          [-34.08374475239747, 6.5025740143888955]]], null, false);


Results: (0 and masked) = Non-urban, 1 = urban
*/
 

//Defines the input asset and delimits the export area to the most of years
var input_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FT/'
var outputAsset = input_asset
var outputVersion = '-FE1-v3-gr4-1'//versão de saída
var version = '-FE1-v3-gr3'//versão de entrada
var scale = 30

//Export an image
var ExportImage = function(image, imageName){
    
    var year = image.get('year').getInfo()
    
    var imageRenamed = image.rename('classification_' + year)
    
    Export.image.toAsset({
        // "image": image,
        "image": imageRenamed,
        "assetId": outputAsset + imageName,
        "description": imageName,
        "region": geometry,
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
    
    var imageName = 'classifcation_' + obj + outputVersion
    
    ExportImage (img, imageName)
}}

//Assets and variables
var infraprob = ee.ImageCollection('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-PROB')

// Add the IRS index to the spatial filter
var CO  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_CO');
var NO  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_NO');
var NE  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_NE');
var SE1 = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_SE1');
var SE2 = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_SE2');
var SU  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_SU');

var LTB_area = (NO.merge(NE).merge(CO).merge(SE1).merge(SE2).merge(SE2).merge(SU));

var LTBvalue = 1000;
var LTB_areaImg = LTB_area
  .reduceToImage({
    properties: ['b1'],
    reducer: ee.Reducer.first()
}).rename('b1').multiply(LTBvalue).unmask();

// Streets, avenues and roads kernell
//https://doi.org/10.1016/j.jag.2022.102791
var roads = ee.ImageCollection('users/efjustiniano/IRS2021/roads/roads_200/roads_200').max();
//Map.addLayer(irs.gte(500), {}, 'irs')

var constrBorderKernel = ee.ImageCollection('users/efjustiniano/IRS2021/landuseTransportImg/LTB200/LTBimg').sum();
  
var irsUrb = ee.ImageCollection([roads, LTB_areaImg, constrBorderKernel]).max().reproject('EPSG:4326', null, 30).gte(500);

//AGSN
var agsn2010 = ee.Image('users/pedrassoli_julio/COL7/AGSN_2010_RASTER_MASK').remap([0],[1]).unmask()
var agsn2020 = ee.Image('users/pedrassoli_julio/COL7/AGSN_2020_RASTER_MASK').remap([0],[1]).unmask()
var spatialMask = ee.ImageCollection([
  agsn2010.rename('spatialMask').toByte(),
  agsn2020.rename('spatialMask').toByte(),
  // setCens.rename('spatialMask').toByte(),
  irsUrb.rename('spatialMask').toByte(),
  ]).max().gte(1).unmask()
    // .multiply(irsUrb.rename('spatialMask')).toByte();

//Apply a consolidation process considering the most of the years
var years = ee.List.sequence(1986, 2020).getInfo()

// - Obtain an image Collection of interest
var validatedCollection = ee.ImageCollection(
  years.map(
  
  function(year){
  
  var imgResult = ee.Image(input_asset + year + version).unmask().multiply(spatialMask)
  
  return imgResult.set('year', year)
  }))

// - Accumulate the urban areas across the years
var consolidatedCollection = ee.ImageCollection(
  years.map(
  
  function(year){
    
    var imgResult = validatedCollection.filter(ee.Filter.lte('year', year)).max()
    
    return imgResult.set('year', year)
  }))

//- Export the results
downloadToAsset(consolidatedCollection)

//Apply a validation filter to the first year
var firstYear = [1985] 

firstYear.map(function(year){
  var next = year + 1
  
  var year_next =  ee.Image(input_asset + next + version).unmask()//img0//.select('classification_' + next)
  var year_0 = ee.Image(input_asset + year + version).unmask()//.select('remapped')
                 .multiply(spatialMask)
  
  var imgResult = year_0.where(year_0.eq(1).and(year_next.eq(0)),0)
                        .unmask()
                        .set('year', year)

  var imageName = 'classifcation_' + year + outputVersion
  
  ExportImage (imgResult, imageName)
  
  return imgResult
})

//Apply a validation filter to the last year adding the new urbanized areas from best thresholds
var SFresults = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FS1/'
var resultsVersion = '_v3'

var lastYear = [2021]
var lastYearResults = ee.ImageCollection(
  lastYear.map(
  
  function(year){
    
    var imgYear = validatedCollection.filter(ee.Filter.lte('year', year)).max()
    
    var imgSF = ee.Image(SFresults + year + resultsVersion)
    
    var imgResult = ee.ImageCollection([imgYear, imgSF]).max().set('year', year)
                      .multiply(spatialMask)
                      .unmask()
                      .set('year', year)
    
    var imageName = 'classifcation_' + year + outputVersion
  
    ExportImage (imgResult, imageName)
    
  return imgResult
  }))
