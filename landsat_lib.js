/* 
======================================

### Landsat Library  ###
Origin Collection: 5

=======================================
*/


var class_lib = require('users/breno_malheiros/terras:classification_lib.js');
var indexes = require('users/breno_malheiros/terras:indexes.js');

var renameBandsL57 = function(image){
  image = image.select(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'sr_atmos_opacity', 'pixel_qa'],
                       ['blue', 'green', 'red', 'nir', 'swir1', 'thermal', 'swir2', 'sr_atmos_opacity', 'pixel_qa']
  );
  var out = image.select(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']).multiply(0.0001);
  out = out.addBands(image.select(['sr_atmos_opacity','thermal', 'pixel_qa']));
  out = out.copyProperties(image).copyProperties(image,['system:time_start']);
  return out;
};



var renameBandsL8 = function(image){
  image = image.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B10', 'B7',  'pixel_qa'],
                       ['blue', 'green', 'red', 'nir', 'swir1', 'thermal', 'swir2','pixel_qa']
  
  );
  var out = image.select(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']).multiply(0.0001);
  out = out.addBands(image.select(['thermal', 'pixel_qa']));
  out = out.copyProperties(image).copyProperties(image,['system:time_start']);
  return out;
};


var cloudMaskL57 = function(image) {
  var qa = image.select('pixel_qa');
  var atmos = image.select('sr_atmos_opacity');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
          .and(qa.bitwiseAnd(1 << 7))
          .or(qa.bitwiseAnd(1 << 3));
          
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  
  var mask3 = qa.bitwiseAnd(1 << 5);
  
  var mask4 = atmos.gt(200);
  
  return image.updateMask(cloud.not()).updateMask(mask2).updateMask(mask3.not()).updateMask(mask4.not());

};


function cloudMaskL8(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = 1 << 3;
  var cloudsBitMask = 1 << 5;

  // Get the pixel QA band.
  var qa = image.select('pixel_qa');

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));

  // Return the masked image, scaled to TOA reflectance, without the QA bands.
  return image.updateMask(mask)
      .copyProperties(image, ["system:time_start"]);
}


var getGrid = function(grid_name, buffer){

  var cartas = ee.FeatureCollection("projects/mapbiomas-workspace/AUXILIAR/cartas");
  
  return ee.Feature(cartas.filterMetadata('grid_name',"equals", grid_name).first()).geometry();
  
};

var getLandsat5 = function(geometry, date_start, date_end, cloud_cover, tier){

  
  var col = ee.ImageCollection('LANDSAT/LT05/C01/' + tier + '_SR')
            .filterDate(date_start, date_end)
            .filterBounds(geometry)
            .filterMetadata("CLOUD_COVER_LAND", "less_than", cloud_cover);
                  
  col = col.map(renameBandsL57).map(cloudMaskL57).map(function(image){return image.clip(geometry)});
  
  return ee.ImageCollection(col);
  
};

var getLandsat7 = function(geometry, date_start, date_end, cloud_cover, tier){

  var col = ee.ImageCollection('LANDSAT/LE07/C01/' + tier + '_SR')
            .filterDate(date_start, date_end)
            .filterBounds(geometry)
            .filterMetadata("CLOUD_COVER_LAND", "less_than", cloud_cover);
                  
  col = col.map(renameBandsL57).map(cloudMaskL57).map(function(image){return image.clip(geometry)});
  
  return ee.ImageCollection(col);
  
};



var getLandsat57 = function(geometry, date_start, date_end, cloud_cover, tier){
  
  var col5 = getLandsat5(geometry, date_start, date_end, cloud_cover, tier);
  
  var col7 = getLandsat7(geometry, date_start, date_end, cloud_cover, tier);
  
  var col = col5.merge(col7);
  
  return ee.ImageCollection(col);
  
};

var getLandsat8 = function(geometry, date_start, date_end, cloud_cover, tier){

  
  var col = ee.ImageCollection('LANDSAT/LC08/C01/' + tier + '_SR')
            .filterDate(date_start, date_end)
            .filterBounds(geometry)
            .filterMetadata("CLOUD_COVER_LAND", "less_than", cloud_cover);
                  
  col = col.map(renameBandsL8).map(cloudMaskL8).map(function(image){return image.clip(geometry)});
  
  return ee.ImageCollection(col);
  
};

var getLandsat = function(grid_name, date_start, date_end, sensor, cloud_cover){
  /**/
  cloud_cover = (typeof cloud_cover !== 'undefined') ? cloud_cover : 50;
  /**/
  
  var geometry = getGrid(grid_name);
  
  var col = null;
  
  if (sensor === 'L5'){
    col = getLandsat5(geometry, date_start, date_end, cloud_cover);
  } else if (sensor === 'L7') {
    col = getLandsat7(geometry, date_start, date_end, cloud_cover);
  } else if (sensor === 'L8') {
    col = getLandsat8(geometry, date_start, date_end, cloud_cover);
  } else if (sensor === 'LX') {
    col = getLandsat57(geometry, date_start, date_end, cloud_cover);
  }
  
  return col;
  
};


var getLandsatGeom = function(geometry, date_start, date_end, sensor, cloud_cover, tier){
  /**/
  cloud_cover = (typeof cloud_cover !== 'undefined') ? cloud_cover : 50;
  tier = (typeof tier !== 'undefined') ? tier : 'T1';
  /**/
  
  var col = null;
  
  if (sensor === 'L5'){
    col = getLandsat5(geometry, date_start, date_end, cloud_cover, tier);
  } else if (sensor === 'L7') {
    col = getLandsat7(geometry, date_start, date_end, cloud_cover, tier);
  } else if (sensor === 'L8') {
    col = getLandsat8(geometry, date_start, date_end, cloud_cover, tier);
  } else if (sensor === 'LX') {
    col = getLandsat57(geometry, date_start, date_end, cloud_cover, tier);
  }
  
  return col;
  

};

var getLandsatMedian = function(geometry, date_start, date_end, sensor, cloud_cover){
  var col = getLandsatGeom(geometry, date_start, date_end, sensor, cloud_cover)
  
  print('col',col);
                    
  return col.median().clip(geometry);
  
};


var getLandsatYear = function(geometry, year){
    var date_start = year + '-01-01';
    var date_end = (year + 1) + '-01-01';
    var sensor = null;
    
    if (year >= 2013){
        sensor = 'L8';
    } else if (year > 1999 && year < 2013){
        sensor = 'LX';
    } else if (year < 2000){
        sensor = 'L5';
    }
    
    var landsat = getLandsatMedian(geometry, date_start, date_end, sensor, 60);
    
    print('landsat pre mosaic',landsat);

    landsat = class_lib.landsatAddIndex(landsat);

    return landsat;
};
////////////////////////////////////////////////////////////
exports.getLandsatYear = getLandsatYear;
exports.getLandsat = getLandsat;
exports.getLandsatGeom = getLandsatGeom;
exports.getLandsatMedian = getLandsatMedian;