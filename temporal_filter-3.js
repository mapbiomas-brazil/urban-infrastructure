/* 
======================================

### Temporal Filter III  ###
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
var inputVersion = '-FE2-gr2'
var outputVersion = '-FE2-gr3'

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

//Defines the list of years considered and separates the final years
var years_mid = ee.List.sequence(1986, 2020).getInfo()
var first_year = [1985]
var last_year = [2021]

//Apply the filter for the first year, rescuing the result of the second temporal filter and exporting the result
var filter_GR3_first = first_year.map(function(year){
  var next = year + 1
  
  var year_0 = ee.Image(input_asset + year + inputVersion).unmask()
  var year_next = ee.Image(input_asset + next + inputVersion)

  //Form the classified image for the first year
  var image_result = year_0.where(year_0.eq(1).and(year_next.eq(1)), 1)
  var cond = ee.ImageCollection([year_0, image_result]).sum().gte(1)
  
  // Map.addLayer(cond,{min: 0.99, max: 1, palette: ['black','red'], opacity: 0.40}, 'result2_' + year)
  ExportImage(cond,geometry,year)
})

//Apply the filter for all years except edge years
var filter_GR3 = years_mid.map(function(year){
  var prev = year - 1
  var next = year + 1

  var year_prev = ee.Image(input_asset + prev + inputVersion)
  var year_0 = ee.Image(input_asset + year + inputVersion).unmask()
  var year_next = ee.Image(input_asset + next + inputVersion)

  var image_result = year_0.where(year_prev.eq(1).and(year_0.eq(0)).and(year_next.eq(1)), 1)
  
  /*Forms an image that includes what was already classified in the second filter and the error eliminated in this filter*/
  var cond = ee.ImageCollection([year_0,image_result]).sum().gte(1)
  
  // Map.addLayer(cond,{min: 0.99, max: 1, palette: ['black','red'], opacity: 0.40}, 'result2_' + year)
  ExportImage(cond,geometry,year)
  
})

//Apply the filter adapted for the last year and export the result
var filter_GR3_last = last_year.map(function(year){
  
  var prev = year - 1
  
  var year_prev = ee.Image(input_asset + prev + inputVersion)
  var year_0 = ee.Image(input_asset + year + inputVersion).unmask()
  
  //Forms an image that includes what has already been rated for the previous year
  var image_result = year_0.where(year_prev.eq(1), 1)
  
  //It forms the image for the last year considering the possible new urban areas and the result for the previous year
  var cond = ee.ImageCollection([year_0,image_result]).sum().gte(1)
  // Map.addLayer(cond,{min: 0.99, max: 1, palette: ['black','red'], opacity: 0.40}, 'result2_' + year)
  ExportImage(cond,geometry,year)
})
