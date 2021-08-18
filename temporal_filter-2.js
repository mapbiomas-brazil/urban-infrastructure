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
var input_asset = 'users/edimilsonrodriguessantos/MAPBIOMAS/INFRAURBANA6-FT-v6'
var ExportImage = function(image, geometry, year){

    var imageName =  String(year)+ '-gr2-' + 1;
    
    Export.image.toAsset({
        "image": image,
        "assetId":"users/edimilsonrodriguessantos/MAPBIOMAS/INFRAURBANA6-FT-v6" + '/' + imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };

//Defines the list of years considered and separates the final years
var years_mid = [1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
                 2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,
                 2015,2016,2017
                 ]
var last_years = [2018, 2019]
var last_year = [2020]

//Apply the filter for all years except the last three and export the results
var filter_GR2 = years_mid.map(function(year){
  var next = year + 1
  var next2 = year + 2
  var next3 = year + 3
  
  var year_0 = ee.Image(input_asset + '/' + year + '-gr1-' + 1)
  var year_next = ee.Image(input_asset + '/' + next + '-gr1-' + 1)
  var year_next2 = ee.Image(input_asset + '/' + next2 + '-gr1-' + 1)
  var year_next3 = ee.Image(input_asset + '/' + next3 + '-gr1-' + 1)
  
  var cond = ee.ImageCollection([year_0,year_next,year_next2,year_next3]).sum().gte(2).multiply(year_0)
  ExportImage(cond,geometry,year)
})


//Apply the filter to the list of final years except the last one and export the results
var filter_GR2_lasts = last_years.map(function(year){
  
  var prev2 = year - 2
  var prev = year - 1
  var next = year + 1
  
  var year_prev2 = ee.Image(input_asset + '/' + prev2 + '-gr1-' + 1)
  var year_prev = ee.Image(input_asset +'/' + prev + '-gr1-' + 1)
  var year_0 = ee.Image(input_asset + '/' + year + '-gr1-' + 1)
  var year_next = ee.Image(input_asset + '/' + next + '-gr1-' + 1)
  
  var cond = ee.ImageCollection([year_prev2 ,year_prev, year_0,year_next]).sum().gte(2).multiply(year_0)
  ExportImage(cond,geometry,year)
})

//Apply the filter adapted for the last year and export the result
var filter_GR2_last = last_year.map(function(year){
  
  var prev2 = year - 2
  var prev = year - 1
  
  var year_prev2 = ee.Image(input_asset + '/' + prev2 + '-gr1-' + 1)
  var year_prev = ee.Image(input_asset +'/' + prev + '-gr1-' + 1)
  var year_0 = ee.Image(input_asset + '/' + year + '-gr1-' + 1)
  
  var cond = ee.ImageCollection([year_prev2 ,year_prev, year_0]).sum().gte(1)
  //Map.addLayer(cond,{bands: "classification", min: 0, max: 1, palette: ['black','red'], opacity: 0.40}, 'result2_' + year)
  ExportImage(cond,geometry,year)
})
