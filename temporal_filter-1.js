/* 
======================================

### Temporal Filter I  ###
Origin Collection: 6

# Notes
- Remember to Change asset path in ExportImage function (assetID)
- Forms for reporting bugs and suggestions link: https://forms.gle/BJZbeZjYA5prQYACA

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



//Defines the input asset and delimits the export area
var input_asset = 'users/breno_malheiros/mapbiomas/INFRAURBANA6-FE-v6'
var ExportImage = function(image, geometry, year){

    var imageName =  String(year) + '-gr1-1';
    Export.image.toAsset({
        "image": image,
        "assetId":"users/edimilsonrodriguessantos/MAPBIOMAS/INFRAURBANA6-FT-v6/" + imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };

//Defines the list of years considered and separates the initial and final years
var years_mid = [
    1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
    2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,
    2013,2014,2015,2016,2017,2018]
var first_years = [1985,1986]
var last_years = [2019,2020]

//It applies the filter for the first years considering itself and the following three years and exports the result
var filter_FY = first_years.map(function(year){
  
  var next = year + 1
  var next2  = year + 2
  var next3  = year + 3
  
  var year_0 = ee.Image(input_asset + '/' + year).eq(24)
  var year_next = ee.Image(input_asset +'/' + next).eq(24)
  var year_next2 = ee.Image(input_asset +'/' + next2).eq(24)
  var year_next3 = ee.Image(input_asset +'/' + next3).eq(24)

  var cond_sum = ee.ImageCollection([year_0,year_next,year_next2]).sum().gte(2).multiply(year_0)
  
  ExportImage(cond_sum,geometry,year)
})

//It applies the filter to the years in the average list considering (i) itself, (ii) the following two years and (iii) the two previous years and exports the result
var filter_GR = years_mid.map(function(year){
  var prev2 = year - 2
  var prev = year - 1
  var next = year + 1
  var next2  = year + 2
  
  var year_prev2 = ee.Image(input_asset + '/' + prev2).eq(24)
  var year_prev = ee.Image(input_asset +'/' + prev).eq(24)
  var year_0 = ee.Image(input_asset +'/' + year).eq(24)
  var year_next = ee.Image(input_asset +'/' + next).eq(24)
  var year_next2 = ee.Image(input_asset +'/' + next2).eq(24)

  var cond_sum = ee.ImageCollection([year_prev2,year_prev,year_0,year_next,year_next2]).sum().gte(3).multiply(year_0)
  
  ExportImage(cond_sum,geometry,year)
}) 

//It applies the filter for the final years considering itself and the three previous years and exports the result
var filter_LY = last_years.map(function(year){
  
  var prev3 = year - 3
  var prev2 = year - 2
  var prev = year - 1
  
  var year_prev3 = ee.Image(input_asset + '/' + prev3).eq(24)
  var year_prev2 = ee.Image(input_asset + '/' + prev2).eq(24)
  var year_prev = ee.Image(input_asset +'/' + prev).eq(24)
  var year_0 = ee.Image(input_asset +'/' + year).eq(24)
  
  var cond_sum = ee.ImageCollection([year_prev2,year_prev,year_0]).sum().gte(2).multiply(year_0)
  
  ExportImage(cond_sum,geometry,year)
})