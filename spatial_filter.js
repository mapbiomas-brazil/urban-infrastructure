var infraprob = ee.ImageCollection('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA5/INFRAURBANA5-PROB-V6');
var worldpop = ee.ImageCollection('WorldPop/POP');
var nighttime_col = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG');
    
var listYears = [1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
    2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,
    2013,2014,2015,2016,2017,2018,2019];

var geometry =  ee.Geometry.Polygon(
    [[[-77.50171350239748, 6.5025740143888955],
      [-77.50171350239748, -35.664852805616775],
      [-34.08374475239747, -35.664852805616775],
      [-34.08374475239747, 6.5025740143888955]]], null, false);

var getNighttimeLayer = function(){
  
  var nighttime_2018 = nighttime_col.filterDate('2018-01-01', '2018-12-31').select(['avg_rad']).median();
  var nighttime_2017 = nighttime_col.filterDate('2017-01-01', '2017-12-31').select(['avg_rad']).median();
  var nighttime_2016 = nighttime_col.filterDate('2016-01-01', '2016-12-31').select(['avg_rad']).median();
  
  return ee.ImageCollection([nighttime_2017, nighttime_2018, nighttime_2016]).max().rename('nighttime');
};

var getInfraProbImage = function(year){

  return infraprob.filterMetadata('year', 'equals', year).mosaic();
};

var getImageThreshold = function(image, worldpop, nighttime){
  var low_nightlight = nighttime.gt(2);
  var medium_nightlight = nighttime.gt(10);
  var high_nightlight = nighttime.gt(40);
  var pop_high = worldpop.gt(50);
  
  var image_threshold1 = image.gt(95).multiply(low_nightlight);
  var image_threshold2 = image.gt(70).multiply(medium_nightlight);
  var image_threshold3 = image.gt(50).multiply(high_nightlight).multiply(pop_high);
  
  var result = ee.ImageCollection([image_threshold1, image_threshold2, image_threshold3]).max();
  
  return result;
  
};

var getWorlpopLayer = function(){
  return worldpop.filterMetadata('UNadj', 'equals', 'yes')
                    .filterDate('2019-01-01','2020-12-31').mosaic();
};


var ExportImage = function(image, geometry, year){

    var imageName =  String(year);
    
    Export.image.toAsset({
        "image": image,
        "assetId":"projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA5/INFRAURBANA5-PC-V6/" + imageName,
        "description": imageName,
        "region": geometry,
        "scale": 30,
        "maxPixels": 1e13,
    });
  };
var nigthTime = getNighttimeLayer();
var worldThreshold = getWorlpopLayer();


var applySpatialFilter = function(image){
  var kernel = ee.Kernel.circle({radius: 1});
  
  //morphology closing
  image = image.unmask(0)
          .focal_max({iterations:1,kernel: kernel})
          .focal_min({iterations:1,kernel: kernel});
          
  //remove holes
  var image_pixelcount_inverted = image.remap([0,1], [1,0])
                        .selfMask().connectedPixelCount();
  image = image.where(image_pixelcount_inverted.lte(30), 1);
  
  //morphology opening
  image = image.focal_min({iterations:1,kernel: kernel})
               .focal_max({iterations:1,kernel: kernel});
               
  //remove noises
  var image_pixel_count = image.selfMask().connectedPixelCount();   
  image = image.where(image_pixel_count.lte(20), 0);
  
  
  return image;
          
                           
};


var reclassImage = function(image_original, image_filt){
  image_original = image_original.unmask(27);
  image_filt = image_filt.remap([0,1], [0,24]);
  var image = image_filt.where(image_original.eq(27).and(image_filt.eq(0)), 27);
  
  return image;
  
};
listYears.forEach(function(year){

    var mosaicProb = getInfraProbImage(year);
    var imagFinal = getImageThreshold(mosaicProb,worldThreshold,nigthTime);
    var imgSF = applySpatialFilter(imagFinal);
    var reclassIMG = reclassImage(imagFinal,imgSF).reproject({crs:'EPSG:4326', scale:30});
    ExportImage(reclassIMG.select(['remapped'],['classification']).byte(), geometry, year)

});

