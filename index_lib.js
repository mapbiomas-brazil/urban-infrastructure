/* 
======================================

### Index Library  ###
Origin Collection: 5

=======================================
*/

var getNDVI = function(image){

  var out = image.expression(
  '(nir - red) / (nir + red )', {
    'nir': image.select('nir'), 
    'red': image.select('red')});

    
  return out.rename('ndvi');
  
};

var getNDWI = function(image){

  var out = image.expression(
  '(nir - green) / (nir + green )', {
    'nir': image.select('nir'), 
    'green': image.select('green')});

    
  return out.rename('ndwi');
  
};


var getEVI = function(image){
  
  var out = image.expression(
    '2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))', {
      'nir': image.select('nir'), 
      'red': image.select('red'), 
      'blue': image.select('blue')
});

  return out.rename('evi');
};


var getNDBI = function(image){

  var out = image.expression(
  '(swir1 - nir) / (swir1 + nir)', {
    'swir1': image.select('swir1'), 
    'nir': image.select('nir')});

    
  return out.rename('ndbi');
  
};


var getBU = function(image){

  var out = image.expression(
  'ndbi - ndvi', {
    'ndbi': image.select('ndbi'), 
    'ndvi': image.select('ndvi')});

    
  return out.rename('bu');
  
};


var getUI = function(image){
  var out = image.expression(
  '(swir2 - nir) / (swir2 + nir)', {
    'swir2': image.select('swir2'), 
    'nir': image.select('nir')});
  return out.rename('ui');
  
};



var getMNDWI = function(image){

  var out = image.expression(
  '(green - swir1) / (green + swir1)', {
    'swir1': image.select('swir1'), 
    'green': image.select('green')});

    
  return out.rename('mndwi');
  
};


var getNDVI_FocalMin = function(image, radius, iterations){
  /**/
  radius = (typeof radius !== 'undefined') ? radius : 2;
  iterations = (typeof iterations !== 'undefined') ? iterations : 1;
  /**/
  
  var out = getNDVI(image);
  
  return out.focal_min({'kernelType':'circle', 'radius':radius, 'iterations':iterations}).rename('ndvi');
  
};

var getNDVI_FocalMinThreshold = function(image, radius, iterations, threshold){
  /**/
  threshold = (typeof threshold !== 'undefined') ? threshold : 0.5;
  /**/
  
  var out = getNDVI_FocalMin(image, radius, iterations).gt(threshold);
  
  return out;
  
};

var getSMA = function (image) {

  var endmembers = [
      [119.0, 475.0, 169.0, 6250.0, 2399.0, 675.0], /*gv*/
      [1514.0, 1597.0, 1421.0, 3053.0, 7707.0, 1975.0], /*npv*/
      [1799.0, 2479.0, 3158.0, 5437.0, 7707.0, 6646.0], /*soil*/
      [4031.0, 8714.0, 7900.0, 8989.0, 7002.0, 6607.0] /*cloud*/
  ];

  var bandNames = ['blue', 'green', 'red', 'nir', 'swir1', 'swir2'];
  var outBandNames = ['gv', 'npv', 'soil', 'cloud'];

  // uminxing data
  var fractions = ee.Image(image)
      .select(bandNames)
      .unmix(endmembers)
      .max(0)
      .multiply(100)
      .byte();

  image = image.addBands(fractions.rename(outBandNames));
  
  

  // get shade and gvs
  var summed = image.expression('b("gv") + b("npv") + b("soil")');

  var shd = summed.subtract(100).abs().byte();
  var gvs = image.select("gv")
      .divide(summed)
      .multiply(100)
      .byte();
      
  

  image = image.addBands(gvs.rename("gvs"));
  image = image.addBands(shd.rename("shade"));
  

  return image.copyProperties(image);
};

var getNDFI = function (image) {

  var gvs = image.select("gvs");

  var npvSoil = image.expression('b("npv") + b("soil")');

  var ndfi = ee.Image.cat(gvs, npvSoil)
      .normalizedDifference()
      .rename('ndfi').float();

  // rescale NDFI from 0 until 200
  /*ndfi = ndfi.expression('byte(b("ndfi") * 100 + 100)');*/

  return image.addBands(ndfi).copyProperties(image);
};

////////////////////////////////////////////////////////////
exports.getUI = getUI;
exports.getBU = getBU;
exports.getMNDWI = getMNDWI;
exports.getNDBI = getNDBI;
exports.getNDVI = getNDVI;
exports.getSMA = getSMA;
exports.getNDFI = getNDFI;
exports.getNDWI = getNDWI;
exports.getEVI = getEVI;
exports.getNDVI_FocalMin = getNDVI_FocalMin;
exports.getNDVI_FocalMinThreshold = getNDVI_FocalMinThreshold;