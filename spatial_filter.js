/* 
======================================

### Spatial Filter ###
Origin Collection: 7

# Notes
- Remember to Change asset path in ExportImage function (assetID)

=======================================
*/

var geometry = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-77.50171350239748, 6.5025740143888955],
          [-77.50171350239748, -35.664852805616775],
          [-34.08374475239747, -35.664852805616775],
          [-34.08374475239747, 6.5025740143888955]]], null, false),
    geometry2 = /* color: #d63000 */ee.Geometry.Point([-47.886922786982225, -22.010178989669573]);

//Defines the input asset and delimits the export area
var infraprob = ee.ImageCollection('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-PROB')
var cartasIBGE = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/cartas')
var assetThreshold = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7/LIMIARES/Threshold_Grid_v2-'
// var input_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FS1/'

//Defines the list of years considered and separates the initial and final years
var listYears = ee.List.sequence(1985, 1992).getInfo()//ed
// var listYears = ee.List.sequence(1993, 2000).getInfo()//julio
// var listYears = ee.List.sequence(2001, 2008).getInfo()//breno
// var listYears = ee.List.sequence(2009, 2016).getInfo()//eduardo
// var listYears = ee.List.sequence(2017, 2021).getInfo()//eduardo

// Add the IRS index to the spatial filter
var CO  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_CO');
var NO  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_NO');
var NE  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_NE');
var SE1 = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_SE1');
var SE2 = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_SE2');
var SU  = ee.FeatureCollection('users/efjustiniano/IRS2021/landuseTransport/LTB_area/LTB_area_SU');

var LTB_area = (NO.merge(NE).merge(CO).merge(SE1).merge(SE2).merge(SE2).merge(SU));

var LTBvalue = 1000;
var LTB_areaImg = LTB_area
  .reduceToImage({
    properties: ['b1'],
    reducer: ee.Reducer.first()
}).rename('b1').multiply(LTBvalue).unmask();

// Streets, avenues and roads kernell
//https://doi.org/10.1016/j.jag.2022.102791
var roads = ee.ImageCollection('users/efjustiniano/IRS2021/roads/roads_200/roads_200').max();
//Map.addLayer(irs.gte(500), {}, 'irs')

var constrBorderKernel = ee.ImageCollection('users/efjustiniano/IRS2021/landuseTransportImg/LTB200/LTBimg').sum();
  
var irs = ee.ImageCollection([roads, LTB_areaImg, constrBorderKernel]).max().reproject('EPSG:4326', null, 30);
// Map.addLayer(irs, {}, 'IRS', false)

//Get the night time light to the spatial filter
var nighttime_col = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
//Get the night time light to the spatial filter
var getNighttimeLayer = function(){
  
  var nighttime_2021 = nighttime_col.filterDate('2021-01-01', '2021-12-31').select(['avg_rad']).median();
  var nighttime_2019 = nighttime_col.filterDate('2019-01-01', '2019-12-31').select(['avg_rad']).median();
  var nighttime_2017 = nighttime_col.filterDate('2017-01-01', '2017-12-31').select(['avg_rad']).median();
  var nighttimes_max = ee.ImageCollection([nighttime_2017, nighttime_2019, nighttime_2021]).max().rename('nighttime');

  return nighttimes_max
};

//Change the nightTime images 
var nReducer = function(image, projection){

  var image = image.focalMin({
    radius: 250, 
    kernelType: 'circle', 
    units: 'meters', 
    iterations: 1
    });
  
  var kernel = ee.Kernel.circle({
    units: 'meters',
    radius: 1000
    });
  
  var rImage = image.reduceNeighborhood({
    reducer: ee.Reducer.mean(),
    kernel: kernel,
    });
  
  return rImage.reproject(projection);
};

var projection = getNighttimeLayer().projection().atScale(250)

var getNighttimeLayer = nReducer(getNighttimeLayer(), projection)
    //Map.addLayer(getNighttimeLayer, {}, 'getNighttimeLayer')

//Thresholds
var agsn2010 = ee.Image('users/pedrassoli_julio/COL7/AGSN_2010_RASTER_MASK').remap([0],[1]).unmask()
var agsn2020 = ee.Image('users/pedrassoli_julio/COL7/AGSN_2020_RASTER_MASK').remap([0],[1]).unmask()
var setCens = ee.Image('users/pedrassoli_julio/COL7/SC_2010_URB_RASTER_MASK')
var irsUrb = irs.gte(500) 
var spatialMask = ee.ImageCollection([
  agsn2010.rename('spatialMask').toByte(),
  agsn2020.rename('spatialMask').toByte(),
  setCens.rename('spatialMask').toByte(),
  // irsUrb.rename('spatialMask').toByte(),
  ])
  .multiply(irsUrb.rename('spatialMask').toByte())
  .max().gte(1).unmask();

//Function to apply the spatial filter
var applySpatialFilter = function(image){
  
    //Kernel
    var kernel = ee.Kernel.circle({radius: 1});
  
    //morphology closing
    image = image.unmask(0)
          .focal_max({iterations:1,kernel: kernel})
          .focal_min({iterations:1,kernel: kernel});
          
    //remove holes
    var nPix = 60 //baseado em um valor de área 
    var image_pixelcount_inverted = image.remap([0,1], [1,0])
                        .selfMask().connectedPixelCount(nPix,true);
    image = image.where(image_pixelcount_inverted.lt(nPix), 1).reproject({crs:'EPSG:4326', scale:30});
    // Map.addLayer(image,{},'Remove Holes', false)
  
    //morphology opening
    image = image.focal_min({iterations:1,kernel: kernel})
                 .focal_max({iterations:1,kernel: kernel});
               
    //remove noises
    var image_pixel_count = image.selfMask().connectedPixelCount();   
    image = image.where(image_pixel_count.lte(5), 0);
    // Map.addLayer(image,{},'Remove Noises', false)
   
return image;

};

//Reclass the original images
  var reclassImage = function(image_original, image_filt){
    image_original = image_original.unmask(27);
    image_filt = image_filt.remap([0,1], [0,24]);
    var image = image_filt.where(image_original.eq(27).and(image_filt.eq(0)), 0);
    return image.selfMask();
  };
  
//Applies the prob image with best threshold for each grid feature 
var bestProbImage = function (year){
    
    //Exports the results
    var ExportImage = function(image, geometry, year){
  
        var imageName =  String(year)+ '_v3';
      
        Export.image.toAsset({
          "image": image,
          "assetId":"projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-FS1/" + imageName,
          "description": imageName,
          "region": geometry,
          "scale": 30,
          "maxPixels": 1e13,
        });
      };
    
    var bestProbResult = cartasIBGE.map(function(feature){
      
        var probImage = infraprob.filter(ee.Filter.eq('year',year))
                                 .mosaic()
                                 .clip(feature)
        
        var grid = feature.get('grid_name')
        
        var bestProbThreshold = ee.Number(
                                ee.Feature(
                                ee.FeatureCollection(assetThreshold + year)
                                  .filter(ee.Filter.eq('grid', grid)).first())
                                  .get('bestProbThreshold'))//-10
        
        var bestProbImage = probImage.gte(bestProbThreshold).unmask()
        
        return bestProbImage//bestImageClassified
    })
    
    var bestImageResult = ee.ImageCollection(bestProbResult).max().set('year', year)
    
    //Get the probability images from RF classification
    var getInfraProbImage = function(year){
      
      var prob = infraprob.filter(ee.Filter.eq('year',year))
      // Map.addLayer(prob, {}, 'prob', false)
    
      //print('Prob_' + year, prob, prob.size())
      
      return prob.mosaic()
    };
    
    var getImageThreshold = bestImageResult
                            .multiply(spatialMask)
                            .multiply(getNighttimeLayer.gt(1));
    
    var nigthTime = getNighttimeLayer;
    
    //Apply the spatial filter to obtain the urban environment
        var mosaicProb = getInfraProbImage(year);
        var imagFinal = getImageThreshold//(mosaicProb, nigthTime);
        var imgSF = applySpatialFilter(imagFinal);
        var reclassIMG = reclassImage(imagFinal,imgSF).reproject({crs:'EPSG:4326', scale:30})
        
        // Map.addLayer(reclassIMG)
        // Map.addLayer(mosaicProb, {}, 'mosaicProb')
        // Map.addLayer(reclassIMG, {}, 'reclassIMG')
        ExportImage(reclassIMG.select(['remapped'],['classification']).byte(), geometry, year)

  return bestImageResult
}
