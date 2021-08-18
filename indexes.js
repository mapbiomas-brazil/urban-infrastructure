/* 
======================================

### Indexes  ###
Origin Collection: 5

=======================================
*/

/**
 * @name
 *      getNBR
 * @description
 *     Calculates the nbr index and adds it as a band of information to the image
 * @argument
 *          @attribute collection {ee.Image}
 * @example
 *      var image = ee.Image('')
 *      image = getNBR(image)
 *  
 * @returns
 *      ee.Image
 */

exports.getNBR = function (image) {
  
  var exp = "(b('nir') - b('swir2')) / (b('nir') + b('swir2'))";
  
  var nbr = image.expression(exp).rename("nbr").float();
  
  return image.addBands(nbr);
};

/**
 * @name
 *      getEVI
 * @description
 *     Calcula o índice evi e adiciona como banda de informação
 *     à imagem
 * @argument
 *          @attribute collection {ee.Image}
 * @example
 *      var image = ee.Image('')
 *      image = getEVI(image)
 *  
 * @returns
 *      ee.Image
 */

exports.getEVI = function (image) {
  
  var exp = "2.5 * ((b('nir') - b('red')) / (b('nir') + 6 * b('red') - 7.5 * b('blue') + 1))";
  
  var evi = image.expression(exp).rename("evi").float();
  
  return image.addBands(evi);
  
};

/**
 * @name
 *      getEVI-2
 * @description
 *     Calcula o índice evi e adiciona como banda de informação
 *     à imagem
 * @argument
 *          @attribute collection {ee.Image}
 * @example
 *      var image = ee.Image('')
 *      image = getEVI(image)
 *  
 * @returns
 *      ee.Image
 */

exports.getEVI2 = function (image) {
  
  var exp = "2.5 * ((b('nir') - b('red')) / (b('nir') + 2.4* b('red')+ 1))";
  
  var evi = image.expression(exp).rename("evi2").float();
  
  // evi = evi.expression('byte(b("evi2") * 1 + 100)');
  
  return image.addBands(evi);
  
};
/**
 * @name
 *      getNDVI
 * @description
 *     Calcula o índice ndvi e adiciona como banda de informação
 *     à imagem
 * @argument
 *          @attribute collection {ee.Image}
 * @example
 *      var image = ee.Image('')
 *      image = getNDVI(image)
 *  
 * @returns
 *      ee.Image
 */  
exports.getNDVI = function (image) {
  
  var exp = "(b('nir')-b('red'))/(b('nir')+b('red'))";
  
  var ndvi = image.expression(exp).rename("ndvi").float();
  
  
  
  return image.addBands(ndvi);
};
exports.getNDWI = function (image) {
  
  var exp = "(b('nir')-b('swir1'))/(b('nir')+b('swir2'))";
  
  var ndvi = image.expression(exp).rename("ndwi").float();
  
  
  
  return image.addBands(ndvi);
};

exports.getSMA = function (image) {

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

exports.getNDFI = function (image) {

  var gvs = image.select("gvs");

  var npvSoil = image.expression('b("npv") + b("soil")');

  var ndfi = ee.Image.cat(gvs, npvSoil)
      .normalizedDifference()
      .rename('ndfi')
      .float();

  // rescale NDFI from 0 until 200
  ndfi = ndfi.expression('byte(b("ndfi") * 100 + 100)');

  return image.addBands(ndfi).copyProperties(image);
};

