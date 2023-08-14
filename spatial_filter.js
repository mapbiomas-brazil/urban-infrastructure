/* 
======================================
### Spatial Filter ###
Origin Collection: 8

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
var infraprob = ee.ImageCollection('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8_1-Prob')
var hexag = ee.FeatureCollection('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA5/cartas_hex_col')
var cartasIBGE = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/cartas').filterBounds(hexag)
                   .filter(ee.Filter.inList('grid_name', cartsasToReprocess))

//batch
var batch = require('users/edimilsonrodriguessantos/mapbiomas:Col8/batch.js') 
var keys = batch.keysList()
var values = batch.valuesList()
var extraGrid = ee.Dictionary.fromLists(keys, values).getInfo()
var extraVersion = '7'

//Defines the list of years considered and separates the initial and final years
//var listYears = ee.List.sequence(1985, 1994).getInfo()//Breno
// var listYears = ee.List.sequence(1985, 2022).getInfo()//Julio
//var listYears = ee.List.sequence(2004, 2014).getInfo()//Ed
//var listYears = ee.List.sequence(2015, 2021).getInfo()//Eduardo
var listYears = [2020] //teste
// var listYears = ee.List.sequence(1985, 2022).getInfo()

//================================================================================================
//>>>>>>>>>>LEMBRE-SE DE VERIFICAR AS VERSÕES DE ENTRADA, SAÍDA, LIMIARES E DESCRIÇÃO<<<<<<<<<<<
//================================================================================================
var prob_version = '7'
var threshold_version = '3'
var description = 'Spatial_Filter_rev4-1.js; prob v7; limiares de prob v3-col8; IRS2022-v5; LowNL- 67 municipios; inclusao de Santa Isabel do Rio Negro (AM)'
var output_version = '4'
var NL_threshold = 1
var lowNL_threshold = 0.5
var irs_threshold = 500

// municipios com baixa luz noturna
var mun_lowNL = [
 '1200328', '1200435', '1301951', '1600550', '2907400', '2106359', '2109759', '2110237', '3145406', '3147501', '3157278',
 '3157377', '3159506', '3163508', '3164803', '1506401', '2200954', '2201988', '2202075', '2202539', '2202653', '2203420',
 '2205151', '2205276', '2205516', '2205532', '2205573', '2206696', '2207108', '2207850', '2207934', '2208874', '2209559',
 '2210391', '2210623', '2409605', '1703826', '5204201', '5209291', '5209457', '5212600', '3122801', '5107578', '1100908',
 '1706258', '1711951', '1718501', '4202099', '4215604', '4300001', '4304853', '4306353', '4306429', '4310652', '4311239',
 '4311734', '4312377', '4312674', '4313334', '4313391', '4314175', '4314555', '4317954', '4320321', 

 // Municípios inseridos no reprocessamento 
 '1303601', // Santa Isabel do Rio Negro (AM)
 '5107776', // Santa Terezinha (MT)
 '1502509', // Chaves (PA)
  ]

// asset adress
var assetThreshold = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8/LIMIARES/Threshold_Grid-v' + threshold_version + '_'
var output_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8_2-FS/'

// add the IRS index to the spatial filter
var irs = ee.ImageCollection('users/efjustiniano/IRS2022/IRS2022_v5_30').sum()

//Map.addLayer(irs, {}, 'IRS', false)

// get the night time light to the spatial filter
var nighttime_col = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')

var getNighttimeLayer = function(){
  
  var nighttime_2022 = nighttime_col.filterDate('2022-01-01', '2022-12-31').select(['avg_rad']).median();
  var nighttime_2021 = nighttime_col.filterDate('2021-01-01', '2021-12-31').select(['avg_rad']).median();
  var nighttime_2020 = nighttime_col.filterDate('2020-01-01', '2020-12-31').select(['avg_rad']).median();
  var nighttime_2019 = nighttime_col.filterDate('2019-01-01', '2019-12-31').select(['avg_rad']).median();
  var nighttime_2018 = nighttime_col.filterDate('2018-01-01', '2018-12-31').select(['avg_rad']).median();
  var nighttime_2017 = nighttime_col.filterDate('2017-01-01', '2017-12-31').select(['avg_rad']).median();
  var nighttime_2016 = nighttime_col.filterDate('2016-01-01', '2016-12-31').select(['avg_rad']).median();
  var nighttime_2015 = nighttime_col.filterDate('2015-01-01', '2015-12-31').select(['avg_rad']).median();
  var nighttime_2014 = nighttime_col.filterDate('2014-01-01', '2014-12-31').select(['avg_rad']).median();
  
  var nighttimes_max = ee.ImageCollection([nighttime_2014, nighttime_2015, nighttime_2016, nighttime_2017, 
                                           nighttime_2018, nighttime_2019, nighttime_2020, nighttime_2021,
                                           nighttime_2022])
                                          .max().rename('nighttime');

  return nighttimes_max
};

// get the probability images from RF classification
var getInfraProbImage = function(year){
  
  var prob = infraprob.filter(ee.Filter.eq('year',year))
                      .filter(ee.Filter.eq('version',prob_version))
                      .sort('version')
  // Map.addLayer(prob, {}, 'prob', false)

  //print('Prob_' + year, prob, prob.size())
  
  return prob.max()
};

// adjusting the night time images 
var nReducer = function(image, projection){

  var image = image.focalMin({
    radius: 250, 
    kernelType: 'circle', 
    units: 'meters', 
    iterations: 1
    });
  
  var kernel = ee.Kernel.circle({
    units: 'meters',
    radius: 500 
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

var lowNL = mun_lowNL.map(function(code){
  var ft_mun = ee.FeatureCollection('projects/ee-bmm-mapbiomas/assets/ibge/BR_Municipios_2021')
  .filter(ee.Filter.eq('CD_MUN', code))
  .first()
  
  //print(ft_mun)
  var result = getNighttimeLayer.gte(lowNL_threshold)
                                .clip(ft_mun)
  return ee.Image(result)
})


var all_light = ee.ImageCollection(lowNL).merge(getNighttimeLayer.gte(NL_threshold)).max()

// thresholds
var agsn2010 = ee.Image('users/pedrassoli_julio/COL7/AGSN_2010_RASTER_MASK').remap([0],[1]).unmask()
var agsn2020 = ee.Image('users/pedrassoli_julio/COL7/AGSN_2020_RASTER_MASK').remap([0],[1]).unmask()
var setCens = ee.Image('users/pedrassoli_julio/COL7/SC_2010_URB_RASTER_MASK')
var ibge_urbanareas2019 = ee.Image('users/pedrassoli_julio/MB-URB-COLLECTION-8/IBGE-URBAN-AREAS-2019/IBGE-URBAN-AREA-2019-FILLED-raster').byte()
var irsUrb = irs.gte(irs_threshold) 

var spatialMask = ee.ImageCollection([
  agsn2010.rename('spatialMask').toByte(),
  agsn2020.rename('spatialMask').toByte(),
  setCens.rename('spatialMask').toByte(),
  ibge_urbanareas2019.rename('spatialMask').toByte(),
  irsUrb.rename('spatialMask').toByte()
  ]).max()
  .multiply(irsUrb.rename('spatialMask').toByte())
  .gte(1).unmask();

// function to apply the spatial filter
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
    image = image.where(image_pixel_count.lte(5), 0).reproject({crs:'EPSG:4326', scale:30});
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
        
        image = image.set('version',output_version)
                     .set('description',description)
                     .set('territory','BRAZIL')
                     .set('source','GT URBANO')
                     .set('theme','Urban Area')
                     .set('collection_id','8')
                     .set('input_version',prob_version)
                     
        var imageName =  String(year)+ '-' + output_version;
      
        Export.image.toAsset({
          "image": image,
          "assetId": output_asset + imageName,
          "description": imageName,
          // "region": geometry,
          "region": cartasIBGE.geometry().simplify(1),
          "scale": 30,
          "maxPixels": 1e13,
        });
      };
    
    var bestProbResult = cartasIBGE.map(function(feature){
      
        var probImage = infraprob.filter(ee.Filter.eq('year',year))
                                 .filter(ee.Filter.eq('version',prob_version))
                                 .sort('version')
                                 .max()
                                 .clip(feature)
        
        var grid = feature.get('grid_name')
        
        var bestProbThreshold = ee.Number(
                                ee.Feature(
                                ee.FeatureCollection(assetThreshold + year)
                                  .filter(ee.Filter.eq('grid', grid)).first())
                                  .get('bestProbThreshold'))
            
            bestProbThreshold = ee.Algorithms.If(bestProbThreshold.gte(95),50,bestProbThreshold)
            bestProbThreshold = ee.Number(bestProbThreshold)
            
        var bestProbImage = probImage.gte(bestProbThreshold).unmask()
        
        return bestProbImage//bestImageClassified
    })
    
    var bestImageResult = ee.ImageCollection(bestProbResult).max().set('year', year)
    

    var getImageThreshold = bestImageResult
                            .multiply(spatialMask)
                            // .multiply(all_light)
    
    // function to append an extra mosaic
    function appendMosaic (key){
      
      // filter to get the grid
      var filter = ee.Filter.eq('grid_name', key)
      
      // grid feature 
      var gridFeature = ee.Feature(cartasIBGE.filter(filter).first())
      
      // grid model
      var gridModel = ee.Dictionary(extraGrid).get(key)
      
      // get the best threshold
      var bestProbThreshold = ee.Number(
                              ee.Feature(
                              ee.FeatureCollection(assetThreshold + year)
                                .filter(ee.Filter.eq('grid', gridModel)).first())
                                .get('bestProbThreshold'))
      
      bestProbThreshold = ee.Algorithms.If(bestProbThreshold.gte(95),50,bestProbThreshold)
      bestProbThreshold = ee.Number(bestProbThreshold)
      
      // filter to get the probImage
      var probFilter = ee.Filter.and(ee.Filter.eq('version', prob_version), ee.Filter.eq('year', year))
      
      // prob image
      var probImageByYear = ee.Image(infraprob.filter(probFilter).first())
                              .clip(gridFeature).gte(bestProbThreshold).unmask()
      
      return probImageByYear
      
    }
    
    // var extraImgCol = ee.ImageCollection(keys.map(appendMosaic)).max()

    //Apply the spatial filter to obtain the urban environment
        // var mosaicProb = ee.ImageCollection([getInfraProbImage(year), extraImgCol]).max()
        var mosaicProb = getInfraProbImage(year)
        var imagFinal = getImageThreshold
        var imgSF = applySpatialFilter(imagFinal);
        var reclassIMG = reclassImage(imagFinal,imgSF).reproject({crs:'EPSG:4326', scale:30})
        
        //print(year)
        //Map.addLayer(mosaicProb, {min:0,max:100}, 'mosaicProb',false)
        //Map.addLayer(getImageThreshold, {}, 'getImageThreshold',false)
        //Map.addLayer(getNighttimeLayer.gt(NL_threshold),{},'getNighttimeLayer',false)
        //Map.addLayer(all_light,{min:0,max:1},'all_light',false)
        //Map.addLayer(spatialMask,{},'spatialMask',false)
        //Map.addLayer(imgSF, {}, 'Remove - Noises/Holes',false)
        Map.addLayer(reclassIMG, {}, 'reclassIMG',false)
        //print(reclassIMG)
        ExportImage(reclassIMG.select(['remapped'],['classification']).byte(), geometry, year)

  return bestImageResult
}

listYears.forEach(bestProbImage)
