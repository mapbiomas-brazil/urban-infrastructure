/* 
======================================

### Temporal Filter I  ###
Origin Collection: 6

# Notes
- Remember to Change asset path in ExportImage function (assetID)

=======================================
*/

var geometry = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-77.50171350239748, 6.5025740143888955],
          [-77.50171350239748, -35.664852805616775],
          [-34.08374475239747, -35.664852805616775],
          [-34.08374475239747, 6.5025740143888955]]], null, false);

var geometry = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-77.50171350239748, 6.5025740143888955],
          [-77.50171350239748, -35.664852805616775],
          [-34.08374475239747, -35.664852805616775],
          [-34.08374475239747, 6.5025740143888955]]], null, false);

//Defines the input asset and delimits the export area
// var input_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FS1/'//primeiro filtro espacial
var input_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FS2/'//segundo filtro espacial
var outputAsset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FT/'
var n = 24
var outputVersion = '-FE2-gr1'//'-FE1-gr1' 
var ExportImage = function(image, geometry, year){

    var imageName =  String(year) + outputVersion;
    Export.image.toAsset({
        "image": image,
        "assetId": outputAsset + imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };

//Defines the list of years considered and separates the initial and final years
var years_mid = ee.List.sequence(1987, 2019).getInfo()
var first_years = [1985,1986]
var last_years = [2020,2021]

//It applies the filter for the first years considering itself and the following three years and exports the result
var filter_FY = first_years.map(function(year){
  
  var next = year + 1
  var next2  = year + 2
  var next3  = year + 3
  
  var year_0 = ee.Image(input_asset + year).eq(n).unmask()
  var year_next = ee.Image(input_asset + next).eq(n).unmask()
  var year_next2 = ee.Image(input_asset + next2).eq(n).unmask()
  var year_next3 = ee.Image(input_asset + next3).eq(n).unmask()

  var cond_sum = ee.ImageCollection([year_0,year_next,year_next2])
                   .map(function(img){return img.rename('classification')})
                   .sum().gte(2).multiply(year_0)
                   .unmask().toInt8()
                   .set('year', year)
  
  ExportImage(cond_sum,geometry,year)
})

//It applies the filter to the years in the average list considering (i) itself, (ii) the following two years and (iii) the two previous years and exports the result
var filter_GR = years_mid.map(function(year){
  var prev2 = year - 2
  var prev = year - 1
  var next = year + 1
  var next2  = year + 2
  
  var year_prev2 = ee.Image(input_asset + prev2).eq(n).unmask()
  var year_prev = ee.Image(input_asset + prev).eq(n).unmask()
  var year_0 = ee.Image(input_asset + year).eq(n).unmask()
  var year_next = ee.Image(input_asset + next).eq(n).unmask()
  var year_next2 = ee.Image(input_asset + next2).eq(n).unmask()

  var cond_sum = ee.ImageCollection([year_prev2,year_prev,year_0,year_next,year_next2])
                   .map(function(img){return img.rename('classification')})
                   .sum().gte(3).multiply(year_0)
                   .unmask().toInt8()
                   .set('year', year)

  ExportImage(cond_sum,geometry,year)
}) 

//It applies the filter for the final years considering itself and the three previous years and exports the result
var filter_LY = last_years.map(function(year){
  
  var prev3 = year - 3
  var prev2 = year - 2
  var prev = year - 1
  
  var year_prev3 = ee.Image(input_asset + prev3).eq(n).unmask()
  var year_prev2 = ee.Image(input_asset + prev2).eq(n).unmask()
  var year_prev = ee.Image(input_asset + prev).eq(n).unmask()
  var year_0 = ee.Image(input_asset + year).eq(n).unmask()
  
  var cond_sum = ee.ImageCollection([year_prev2,year_prev,year_0])
                   .map(function(img){return img.rename('classification')})
                   .sum().gte(2).multiply(year_0)
                   .unmask().toInt8()
                   .set('year', year)
  
  ExportImage(cond_sum,geometry,year)
})
