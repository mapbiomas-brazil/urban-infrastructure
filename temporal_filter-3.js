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
var input_asset = 'users/breno_malheiros/mapbiomas/INFRAURBANA6-FE-v6'
var ExportImage = function(image, geometry, year){

    var imageName =  String(year) + '-gr3-' + 1;
    
    Export.image.toAsset({
        "image": image,
        "assetId":"users/edimilsonrodriguessantos/MAPBIOMAS/INFRAURBANA6-FT-v6" +'/'+ imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };

//Defines the list of years considered and separates the final years
var years_mid = [1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
                 2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,
                 2015,2016,2017,2018,2019]
var first_year = [1985]
var last_year = [2020]

//Apply the filter for all years except edge years
var filter_GR3 = years_mid.map(function(year){
  var prev = year - 1
  var next = year + 1

  var year_prev = ee.Image(input_asset +'/' + prev + '-gr2-' + 1)
  var year_0 = ee.Image(input_asset + '/' + year + '-gr2-' + 1)
  var year_next = ee.Image(input_asset + '/' + next + '-gr2-' + 1)

  var image_result = year_0.where(year_prev.eq(1).and(year_0.eq(0)).and(year_next.eq(1)), 1)
  
  /*Forms an image that includes what was already sorted in the second filter and the error eliminated in this filter */
  var cond = ee.ImageCollection([year_0,image_result]).sum().gte(1)
  ExportImage(cond,geometry,year)
  
})

//Apply the filter for the first year, rescuing the result of the second temporal filter and exporting the result
var filter_GR3_first = first_year.map(function(year){
  
  var year_0 = ee.Image(input_asset + '/' + year + '-gr2-' + 1)

  /*Form the classified image for the first year*/
  var cond = ee.ImageCollection([year_0]).sum().gte(1)
  
  ExportImage(cond,geometry,year)

})

//Apply the filter adapted for the last year and export the result
var filter_GR3_last = last_year.map(function(year){
  
  var prev = year - 1
  
  var year_prev = ee.Image(input_asset +'/' + prev + '-gr2-' + 1)
  var year_0 = ee.Image(input_asset + '/' + year + '-gr2-' + 1)
  
  /*Forms an image that includes what has already been rated for the previous year*/
  var image_result = year_0.where(year_prev.eq(1), 1)
  
  /*It forms the image for the last year considering the possible new urban areas and the result for the previous year*/
  var cond = ee.ImageCollection([year_0,image_result]).sum().gte(1)
  ExportImage(cond,geometry,year)
  
})
