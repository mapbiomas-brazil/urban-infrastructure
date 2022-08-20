/* 
======================================

### Temporal Filter II  ###
Origin Collection: 6

# Notes
- Remember to Change asset path in ExportImage function (assetID)
- Forms for reporting bugs and suggestions link: https://forms.gle/BJZbeZjYA5prQYACA

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


//Defines the input asset and delimits the export area
var input_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FT/'
var outputAsset = input_asset
var version = '-FE2-gr1'
var nextVersion = '-FE2-gr2'//'-FE1-gr2' 

var ExportImage = function(image, geometry, year){

    var imageName =  String(year) + nextVersion;
    Export.image.toAsset({
        "image": image,
        "assetId": outputAsset + imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };

//Defines the list of years considered and separates the final years
var years_mid = ee.List.sequence(1985, 2018).getInfo()
var last_years = [2019, 2020]
var last_year = [2021]

//Apply the filter for all years except the last three and export the results
var filter_GR2 = years_mid.map(function(year){
  var next = year + 1
  var next2 = year + 2
  var next3 = year + 3
  
  var year_0 = ee.Image(input_asset + year + version)
  var year_next = ee.Image(input_asset + next + version)
  var year_next2 = ee.Image(input_asset + next2 + version)
  var year_next3 = ee.Image(input_asset + next3 + version)
  
  var cond = ee.ImageCollection([year_0,year_next,year_next2,year_next3])
               .sum().gte(2).multiply(year_0)
               .unmask()

  ExportImage(cond,geometry,year)
})


//Apply the filter to the list of final years except the last one and export the results
var filter_GR2_lasts = last_years.map(function(year){
  
  var prev2 = year - 2
  var prev = year - 1
  var next = year + 1
  
  var year_prev2 = ee.Image(input_asset + prev2 + version)
  var year_prev = ee.Image(input_asset + prev + version)
  var year_0 = ee.Image(input_asset + year + version)
  var year_next = ee.Image(input_asset + next + version)
  
  var cond = ee.ImageCollection([year_prev2 ,year_prev, year_0,year_next])
               .sum().gte(2).multiply(year_0)
               .unmask()

  ExportImage(cond,geometry,year)
})

//Apply the filter adapted for the last year and export the result
var filter_GR2_last = last_year.map(function(year){
  
  var prev2 = year - 2
  var prev = year - 1
  
  var year_prev2 = ee.Image(input_asset + prev2 + version)
  var year_prev = ee.Image(input_asset + prev + version)
  var year_0 = ee.Image(input_asset + year + version)
  
  var cond = ee.ImageCollection([year_prev2 ,year_prev, year_0])
               .sum().gte(1).multiply(year_0)
               .unmask()

  //Map.addLayer(cond,{bands: "classification", min: 0, max: 1, palette: ['black','red'], opacity: 0.40}, 'result2_' + year)
  ExportImage(cond,geometry,year)
})
