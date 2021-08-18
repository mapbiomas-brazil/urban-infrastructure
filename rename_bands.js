/* 
======================================

### Rename Bands ###
Origin Collection: 5

=======================================
*/


/**
 * @name
 *      rename
 * @description
 *     Standardizes landsat 5.7, and sentinel 2 image band names
 * @argument
 *      Object containing the attribute
 *          @attribute key {String}
 * @example
 *      var bands_l7 = rename('l7');
 * @returns
 *      Dictionary
 */
var bandNames = {
 
 'l5': {
      'bandNames': ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'pixel_qa', 'B6'],
      'newNames': ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'pixel_qa', 'temp']
  },
   'l5_7': {
      'bandNames':['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'sr_atmos_opacity', 'pixel_qa'],
      'newNames':  ['blue', 'green', 'red', 'nir', 'swir1', 'thermal', 'swir2', 'sr_atmos_opacity', 'pixel_qa']
  },
  
 'l7': {
      'bandNames': ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'pixel_qa', 'B6'],
      'newNames': ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'pixel_qa', 'temp']
  },

  'l8' : {
      'bandNames': ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'pixel_qa', 'B11'],
      'newNames': ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'thermal', 'pixel_qa', 'temp']
  },
  
  'l5toa': {
      'bandNames': ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'BQA', 'B6'],
      'newNames': ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'BQA', 'temp']
  },
  
 'l7toa': {
      'bandNames': ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'BQA', 'B6_VCID_1'],
      'newNames': ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'BQA', 'temp']
  },

  'l8toa' : {
      'bandNames': ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'BQA', 'B11'],
      'newNames': ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'thermal', 'BQA', 'temp']
  },
  
  'sentinel2' : {
      'bandNames': ['B2','B3','B4','B8','B10','B11','B12','QA60'],
      'newNames': ['blue','green','red','nir','cirrus','swir1','swir2','BQA']
    },
  'sentinel2_2' : {
    'bandNames': ['blue','green','red','nir','cirrus','swir1','swir2','QA60'],
    'newNames': ['blue','green','red','nir','cirrus','swir1','swir2','BQA']
  },
   'sentinel2_SR' : {
    'bandNames': ['B2','B3','B4','B8','B11','B12','QA60'],
    'newNames': ['blue','green','red','nir','swir1','swir2','pixel_qa']
  }
};

exports.rename = function (key) {

    return bandNames[key];
};