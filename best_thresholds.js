var municipios = ee.FeatureCollection("projects/ee-bmm-mapbiomas/assets/ibge/BR_Municipios_2021"),
    cartas = ee.FeatureCollection("projects/mapbiomas-workspace/AUXILIAR/cartas"),
    infraprob = ee.ImageCollection("projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-PROB");
    //Assets and variables
var scale = 30

var listYears = ee.List.sequence(1985, 2021).getInfo()

//Samples asstes adress
var samples_urban = "users/Col7/Samples_Train/Urb_Train_Filter/Col7UrbV3_1_TAll_AllSamples_Urb_Filter_"
var samples_notUrban = "users/Col7/Samples_Train/NUrb_Train/Col7UrbV3_1_TAll_AllSamples_NUrb_"

listYears.map(function(year){
  
  var getInfraProbImage = function(year){
  
  var prob = infraprob.filter(ee.Filter.eq('year',year))
  //print('Prob_' + year, prob, prob.size())
  
  return prob.mosaic()
  };
  
  //Constructed areas
  //Values for each input layer
  var listProb = ee.List.sequence(0, 100, 5).getInfo()//Probability layer
  
  var mosaicProb = getInfraProbImage(year);
  
  var accuracyByProb = cartas.map(function(feature){
    
        var grid = ee.Feature(feature).get('grid_name')
        
        var urbanSamples = ee.FeatureCollection(samples_urban + year)
                             .filterBounds(feature.geometry())
                             .map(function(f){return f.set('value', 1)})
        
        var notUrbanSamples = ee.FeatureCollection(samples_notUrban + year)
                                .filterBounds(feature.geometry())
                                .map(function(f){return f.set('value', 0)})
        
        var points = urbanSamples.merge(notUrbanSamples).select('value')
        
        var accuracyCalc = listProb.map(function(n){
            
              //var imageToClassify = reclassIMG.eq(24).multiply(mosaicProb).gte(n)
              var bandName = 'predicted'
              var imageToClassify = mosaicProb.gte(n)
                                              .clip(feature.geometry())
                                              .rename(bandName)
              
              var sampleRegion = imageToClassify.unmask().sampleRegions({
                collection: points.select('value'),
                geometries: true,
                scale: scale
              });
              
              var errorMatrix = sampleRegion.errorMatrix('value', bandName)
            
              var accuracy = errorMatrix.accuracy().multiply(100).toInt()
              
              return ee.Feature(null)
                       .set('grid', grid)
                       .set('accuracy', accuracy)
                       .set('nProb', n)
              })
    
        var result = ee.Feature(
                     ee.FeatureCollection(accuracyCalc)
                       .select(['accuracy', 'nProb', 'grid'])
                       .sort('nProb')//, false)
                       .sort('accuracy', false)
                       .first()
                       )
    
        var bestThreshold = ee.Feature(feature.geometry())
                              .set('bestProbThreshold', result.get('nProb'))
                              .set('accuracy', result.get('accuracy'))
                              .set('grid', grid)
  
  return bestThreshold
  })
  
  var accuracyResults = ee.FeatureCollection(accuracyByProb)//.flatten()
  //var accuracyResults = ee.FeatureCollection(accuracyByIRS)
  //print(accuracyResults)
  
  Export.table.toAsset({
    collection:accuracyResults, 
    description:'Threshold_Grid-'+ year, 
    assetId:'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7/LIMIARES/Threshold_Grid_v2-'+ year
  })
})
