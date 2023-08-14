/*
Código organizando os resultados de acurácia segundo os maiores valores de acurácia
*/

// size of superfeature list
var listToMap = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// assets and variables
var municipios = ee.FeatureCollection('projects/ee-bmm-mapbiomas/assets/ibge/BR_Municipios_2021')
var hexag = ee.FeatureCollection('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA5/cartas_hex_col')
var cartasBrasil = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/cartas').filterBounds(hexag)

// Collection 8
var infraprob = ee.ImageCollection('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8_1-Prob')
var probVersion = '5'
var bestThresholdVersion = '4'
var bandName = 'predicted'
var scale = 30

// list years
var listYears = ee.List.sequence(1985, 2022).getInfo()

// list to test the probability
var listProb = ee.List.sequence(25, 75, 5).getInfo()//Probability layer

//Samples asstes adress
var nurb_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8/SAMPLES/NUrb/Samples_NUrb_v5_'
var urb_asset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8/SAMPLES/Urb/Samples_Urb_v5_'
var selectProp = ['year','value']

// get the image or probability
var getInfraProbImage = function(year){ 
    
      var prob = infraprob.filter(ee.Filter.eq('year',year))
                          .filter(ee.Filter.eq('version', probVersion))// essa linha n deve ser usada na col 7
      //print('Prob_' + year, prob, prob.size())  
      
    return prob.mosaic().unmask().toByte()
    };

// grids de carta analisadas
var grid_1= [
'NA-20-X-A',
'NA-20-X-B',
'NA-20-X-C',
'NA-20-X-D',
'NA-20-Z-B',
'NA-20-Z-D',
'NA-21-V-A',
'NA-21-Y-A',
'NA-21-Y-C',
'NA-22-V-B',
'NA-22-V-D',
'NA-22-X-C',
'NA-22-Y-B',
'NA-22-Y-D',
'NA-22-Z-A',
'NA-22-Z-C',
'NB-20-Z-D',
'SA-19-X-B',
'SA-19-X-D',
'SA-19-Y-B',
'SA-19-Y-D',
'SA-19-Z-A',
'SA-19-Z-B',
'SA-19-Z-C',
'SA-19-Z-D',
'SA-20-V-A',
'SA-20-V-C',
'SA-20-X-A',
'SA-20-X-B',
'SA-20-X-C',
'SA-20-X-D',
'SA-20-Y-A',
'SA-20-Y-C',
'SA-20-Y-D',
'SA-20-Z-B',
'SA-20-Z-C',
'SA-20-Z-D',
'SA-21-V-A',
'SA-21-V-C',
'SA-21-X-C',
'SA-21-X-D',
'SA-21-Y-A',
'SA-21-Y-B',
'SA-21-Y-C',
'SA-21-Y-D',
'SA-21-Z-A',
'SA-21-Z-B',
]

var grid_2= [
'SA-21-Z-C',
'SA-21-Z-D',
'SA-22-V-A',
'SA-22-V-B',
'SA-22-V-C',
'SA-22-V-D',
'SA-22-X-A',
'SA-22-X-B',
'SA-22-X-C',
'SA-22-X-D',
'SA-22-Y-A',
'SA-22-Y-B',
'SA-22-Y-C',
'SA-22-Y-D',
'SA-22-Z-A',
'SA-22-Z-B',
'SA-22-Z-C',
'SA-22-Z-D',
'SA-23-V-A',
'SA-23-V-B',
'SA-23-V-C',
'SA-23-V-D',
'SA-23-X-C',
'SA-23-Y-A',
'SA-23-Y-B',
'SA-23-Y-C',
'SA-23-Y-D',
'SA-23-Z-A',
'SA-23-Z-B',
'SA-23-Z-C',
'SA-23-Z-D',
'SA-24-Y-A',
'SA-24-Y-B',
'SA-24-Y-C',
'SA-24-Y-D',
'SA-24-Z-C',
'SB-18-Z-D',
'SB-19-V-A',
'SB-19-V-B',
'SB-19-X-B',
'SB-19-Y-A',
'SB-19-Y-B',
'SB-19-Y-C',
'SB-19-Y-D',
'SB-19-Z-A',
'SB-19-Z-D',

]

var grid_3= [
'SB-20-V-A',
'SB-20-V-B',
'SB-20-V-D',
'SB-20-X-B',
'SB-20-X-D',
'SB-20-Y-B',
'SB-20-Y-C',
'SB-20-Y-D',
'SB-20-Z-A',
'SB-20-Z-C',
'SB-20-Z-D',
'SB-21-V-A',
'SB-21-X-A',
'SB-21-X-B',
'SB-21-X-C',
'SB-21-Y-B',
'SB-21-Y-C',
'SB-21-Z-A',
'SB-21-Z-B',
'SB-21-Z-C',
'SB-21-Z-D',
'SB-22-V-D',
'SB-22-X-A',
'SB-22-X-B',
'SB-22-X-C',
'SB-22-X-D',
'SB-22-Y-B',
'SB-22-Z-A',
'SB-22-Z-B',
'SB-22-Z-C',
'SB-22-Z-D',
'SB-23-V-A',
'SB-23-V-B',
'SB-23-V-C',
'SB-23-V-D',
'SB-23-X-A',
'SB-23-X-B',
'SB-23-X-C',
'SB-23-X-D',
'SB-23-Y-A',
'SB-23-Y-B',
'SB-23-Y-C',
'SB-23-Y-D',
'SB-23-Z-A',
'SB-23-Z-B',
'SB-23-Z-C',
'SB-23-Z-D',
]

var grid_4= [
'SB-24-V-A',
'SB-24-V-B',
'SB-24-V-C',
'SB-24-V-D',
'SB-24-X-A',
'SB-24-X-B',
'SB-24-X-C',
'SB-24-X-D',
'SB-24-Y-A',
'SB-24-Y-B',
'SB-24-Y-C',
'SB-24-Y-D',
'SB-24-Z-A',
'SB-24-Z-B',
'SB-24-Z-C',
'SB-24-Z-D',
'SB-25-V-C',
'SB-25-Y-A',
'SB-25-Y-C',
'SC-18-X-B',
'SC-18-X-D',
'SC-19-V-A',
'SC-19-V-B',
'SC-19-V-C',
'SC-19-V-D',
'SC-19-X-A',
'SC-19-X-B',
'SC-19-X-C',
'SC-19-X-D',
'SC-19-Y-B',
'SC-19-Y-D',
'SC-19-Z-A',
'SC-19-Z-B',
'SC-19-Z-C',
'SC-20-V-B',
'SC-20-V-C',
'SC-20-V-D',
'SC-20-X-A',
'SC-20-X-C',
'SC-20-X-D',
'SC-20-Y-A',
'SC-20-Y-B',
'SC-20-Y-C',
'SC-20-Y-D',
'SC-20-Z-A',
'SC-20-Z-B',
'SC-20-Z-C',
]

var grid_5= [
'SC-20-Z-D',
'SC-21-V-C',
'SC-21-V-D',
'SC-21-X-B',
'SC-21-X-C',
'SC-21-X-D',
'SC-21-Y-A',
'SC-21-Y-B',
'SC-21-Y-C',
'SC-21-Y-D',
'SC-21-Z-A',
'SC-21-Z-B',
'SC-21-Z-C',
'SC-21-Z-D',
'SC-22-V-C',
'SC-22-V-D',
'SC-22-X-A',
'SC-22-X-B',
'SC-22-X-C',
'SC-22-X-D',
'SC-22-Y-A',
'SC-22-Y-B',
'SC-22-Y-C',
'SC-22-Y-D',
'SC-22-Z-A',
'SC-22-Z-B',
'SC-22-Z-C',
'SC-22-Z-D',
'SC-23-V-A',
'SC-23-V-B',
'SC-23-V-C',
'SC-23-V-D',
'SC-23-X-A',
'SC-23-X-B',
'SC-23-X-C',
'SC-23-X-D',
'SC-23-Y-A',
'SC-23-Y-B',
'SC-23-Y-C',
'SC-23-Y-D',
'SC-23-Z-A',
'SC-23-Z-B',
'SC-23-Z-C',
'SC-23-Z-D',
'SC-24-V-A',
'SC-24-V-B',
'SC-24-V-C',
]

var grid_6= [
'SC-24-V-D',
'SC-24-X-A',
'SC-24-X-B',
'SC-24-X-C',
'SC-24-X-D',
'SC-24-Y-A',
'SC-24-Y-B',
'SC-24-Y-C',
'SC-24-Y-D',
'SC-24-Z-A',
'SC-24-Z-B',
'SC-24-Z-C',
'SC-24-Z-D',
'SC-25-V-A',
'SC-25-V-C',
'SD-20-V-B',
'SD-20-X-A',
'SD-20-X-B',
'SD-20-X-D',
'SD-20-Z-B',
'SD-20-Z-D',
'SD-21-V-A',
'SD-21-V-B',
'SD-21-V-C',
'SD-21-V-D',
'SD-21-X-A',
'SD-21-X-B',
'SD-21-X-C',
'SD-21-X-D',
'SD-21-Y-A',
'SD-21-Y-B',
'SD-21-Y-C',
'SD-21-Y-D',
'SD-21-Z-A',
'SD-21-Z-B',
'SD-21-Z-C',
'SD-21-Z-D',
'SD-22-V-A',
'SD-22-V-B',
'SD-22-V-C',
'SD-22-V-D',
'SD-22-X-A',
'SD-22-X-B',
'SD-22-X-C',
'SD-22-X-D',
'SD-22-Y-A',
'SD-22-Y-B',
]

var grid_7= [
'SD-22-Y-C',
'SD-22-Y-D',
'SD-22-Z-A',
'SD-22-Z-B',
'SD-22-Z-C',
'SD-22-Z-D',
'SD-23-V-A',
'SD-23-V-B',
'SD-23-V-C',
'SD-23-V-D',
'SD-23-X-A',
'SD-23-X-B',
'SD-23-X-C',
'SD-23-X-D',
'SD-23-Y-A',
'SD-23-Y-B',
'SD-23-Y-C',
'SD-23-Y-D',
'SD-23-Z-A',
'SD-23-Z-B',
'SD-23-Z-C',
'SD-23-Z-D',
'SD-24-V-A',
'SD-24-V-B',
'SD-24-V-C',
'SD-24-V-D',
'SD-24-X-A',
'SD-24-X-C',
'SD-24-Y-A',
'SD-24-Y-B',
'SD-24-Y-C',
'SD-24-Y-D',
'SD-24-Z-A',
'SD-24-Z-C',
'SE-20-X-B',
'SE-21-V-A',
'SE-21-V-B',
'SE-21-X-A',
'SE-21-X-B',
'SE-21-X-D',
'SE-21-Y-B',
'SE-21-Y-D',
'SE-21-Z-A',
'SE-21-Z-B',
'SE-21-Z-C',
'SE-21-Z-D',
'SE-22-V-A',
]

var grid_8= [
'SE-22-V-B',
'SE-22-V-C',
'SE-22-V-D',
'SE-22-X-A',
'SE-22-X-B',
'SE-22-X-C',
'SE-22-X-D',
'SE-22-Y-A',
'SE-22-Y-B',
'SE-22-Y-C',
'SE-22-Y-D',
'SE-22-Z-A',
'SE-22-Z-B',
'SE-22-Z-C',
'SE-22-Z-D',
'SE-23-V-A',
'SE-23-V-B',
'SE-23-V-C',
'SE-23-V-D',
'SE-23-X-A',
'SE-23-X-B',
'SE-23-X-C',
'SE-23-X-D',
'SE-23-Y-A',
'SE-23-Y-B',
'SE-23-Y-C',
'SE-23-Y-D',
'SE-23-Z-A',
'SE-23-Z-B',
'SE-23-Z-C',
'SE-23-Z-D',
'SE-24-V-A',
'SE-24-V-B',
'SE-24-V-C',
'SE-24-V-D',
'SE-24-X-A',
'SE-24-Y-A',
'SE-24-Y-B',
'SE-24-Y-C',
'SE-24-Y-D',
'SF-21-V-B',
'SF-21-V-D',
'SF-21-X-A',
'SF-21-X-B',
'SF-21-X-C',
'SF-21-X-D',
'SF-21-Y-B',
]

var grid_9= [
'SF-21-Z-A',
'SF-21-Z-B',
'SF-21-Z-C',
'SF-21-Z-D',
'SF-22-V-A',
'SF-22-V-B',
'SF-22-V-C',
'SF-22-V-D',
'SF-22-X-A',
'SF-22-X-B',
'SF-22-X-C',
'SF-22-X-D',
'SF-22-Y-A',
'SF-22-Y-B',
'SF-22-Y-C',
'SF-22-Y-D',
'SF-22-Z-A',
'SF-22-Z-B',
'SF-22-Z-C',
'SF-22-Z-D',
'SF-23-V-A',
'SF-23-V-B',
'SF-23-V-C',
'SF-23-V-D',
'SF-23-X-A',
'SF-23-X-B',
'SF-23-X-C',
'SF-23-X-D',
'SF-23-Y-A',
'SF-23-Y-B',
'SF-23-Y-C',
'SF-23-Y-D',
'SF-23-Z-A',
'SF-23-Z-B',
'SF-23-Z-C',
'SF-23-Z-D',
'SF-24-V-A',
'SF-24-V-B',
'SF-24-V-C',
'SF-24-Y-A',
'SF-24-Y-C',
'SG-21-X-B',
'SG-21-X-D',
'SG-21-Z-D',
'SG-22-V-A',
'SG-22-V-B',
'SG-22-V-C',
]

var grid_10= [
'SG-22-V-D',
'SG-22-X-A',
'SG-22-X-B',
'SG-22-X-C',
'SG-22-X-D',
'SG-22-Y-A',
'SG-22-Y-B',
'SG-22-Y-C',
'SG-22-Y-D',
'SG-22-Z-A',
'SG-22-Z-B',
'SG-22-Z-C',
'SG-22-Z-D',
'SG-23-V-A',
'SG-23-V-B',
'SG-23-V-C',
'SH-21-V-D',
'SH-21-X-A',
'SH-21-X-B',
'SH-21-X-C',
'SH-21-X-D',
'SH-21-Y-B',
'SH-21-Z-A',
'SH-21-Z-B',
'SH-21-Z-C',
'SH-21-Z-D',
'SH-22-V-A',
'SH-22-V-B',
'SH-22-V-C',
'SH-22-V-D',
'SH-22-X-A',
'SH-22-X-B',
'SH-22-X-C',
'SH-22-X-D',
'SH-22-Y-A',
'SH-22-Y-B',
'SH-22-Y-C',
'SH-22-Y-D',
'SH-22-Z-A',
'SH-22-Z-C',
'SI-22-V-A',
'SI-22-V-B',
'SI-22-V-C',
]

var extraGrid = {
// this gridlist was used to polygons without samples
'NA-19-Z-B': 'SA-19-X-D',	
'NA-21-Z-A': 'NA-21-Y-C',	
'NA-22-Y-B': 'NA-22-Y-D',	
'SA-19-V-D': 'SA-19-Y-B',	
'NA-19-Y-D': 'SA-19-Y-B',	
'NA-19-Z-A': 'SA-19-X-D',	
'NA-19-Z-C': 'SA-19-X-D',	
'NA-19-Z-D': 'SA-19-X-D',	
'NA-20-Y-C': 'SA-20-V-C',	
'NB-20-Y-D': 'NB-20-Z-D',	
'SA-19-X-B': 'SA-19-X-D',	
'SA-20-V-A': 'SA-20-V-C',	
'SA-20-V-B': 'SA-20-X-A',	
'SA-20-V-D': 'SA-20-V-C',	
'SA-20-X-C': 'SA-20-X-D',	
'SB-19-Z-C': 'SB-19-Y-B',	
'SB-20-X-A': 'SA-20-Z-C',	
'NA-19-Y-B': 'SA-19-X-D',	
'NA-20-V-A': 'NA-20-X-B',	
'NA-20-V-B': 'NA-20-X-B',	
'NA-20-V-D': 'NA-20-X-D',	
'NA-20-X-A': 'NA-20-X-B',	
'NA-20-X-C': 'NA-20-X-D',	
'NA-20-Y-A': 'SA-20-V-C',	
'NA-20-Y-D': 'SA-20-X-A',	
'NA-20-Z-A': 'NA-20-Z-B',	
'NA-21-V-C': 'NA-20-X-D',	
'NA-21-X-C': 'NA-21-Y-C',	
'NA-21-X-D': 'SA-22-V-A',	
'NA-21-Y-A': 'NA-21-Y-C',	
'NA-21-Y-D': 'NA-21-Y-C',	
'NA-21-Z-B': 'SA-22-V-A',	
'NA-21-Z-C': 'SA-21-X-C',	
'NA-21-Z-D': 'SA-22-V-A',	
'NA-22-V-D': 'NA-22-Y-D',	
'NA-22-Y-A': 'NA-22-Y-D',	
'NA-22-Y-C': 'SA-22-V-A',	
'NB-20-Y-C': 'NB-20-Z-D',	
'NB-20-Z-B': 'NB-20-Z-D',	
'NB-20-Z-C': 'NB-20-Z-D',	
'NB-21-Y-C': 'NB-20-Z-D',	
'NB-22-Y-D': 'NA-22-Y-D',	
'SA-19-X-A': 'SA-19-X-D',	
'SA-20-Y-D': 'SB-20-V-B',	
'SA-20-Z-A': 'SA-20-Z-C',	
'SA-21-V-A': 'NA-21-Y-C',	
'SA-21-V-B': 'NA-21-Y-C',	
'SA-21-V-D': 'SA-21-V-C',	
'SA-21-X-A': 'SA-21-X-C',	
'SA-21-Z-C': 'SB-21-X-A',	
'SA-23-V-B': 'SA-23-V-D',	
'SB-18-X-D': 'SB-18-Z-D',	
'SB-18-Z-B': 'SB-18-Z-D',	
'SB-19-V-A': 'SB-19-V-B',	
'SB-19-V-C': 'SB-19-Y-B',	
'SB-19-X-D': 'SB-19-X-B',	
'SB-19-Y-A': 'SB-19-Y-B',	
'SB-19-Y-C': 'SC-19-V-A',	
'SB-20-V-A': 'SB-19-X-B',	
'SB-20-X-B': 'SA-20-Z-D',	
'SB-20-X-C': 'SB-20-X-D',	
'SB-20-Z-A': 'SB-20-X-D',	
'SB-20-Z-B': 'SB-20-X-D',	
'SB-20-Z-D': 'SB-20-X-D',	
'SB-21-V-D': 'SB-21-Y-B',	
'SB-21-X-D': 'SB-21-X-C',	
'SB-21-Y-A': 'SB-21-Y-B',	
'SB-21-Y-D': 'SB-21-Y-B',	
'SB-21-Z-B': 'SB-21-Z-D',	
'SB-21-Z-C': 'SB-21-Z-D',	
'SB-22-V-A': 'SA-22-Y-C',	
'SB-22-V-B': 'SA-22-Y-C',	
'SB-22-V-C': 'SB-22-Y-B',	
'SB-22-V-D': 'SB-22-Y-B',	
'SB-22-Y-A': 'SB-22-Y-B',	
'SB-22-Y-C': 'SB-21-Z-D',	
'SB-22-Y-D': 'SB-22-Y-B',	
'SC-18-X-D': 'SC-18-X-B',	
'SC-19-X-A': 'SC-19-X-C',	
'SC-19-Y-D': 'SC-19-Y-B',	
'SC-20-X-A': 'SC-20-X-C',	
'SC-20-Y-C': 'SC-20-Y-A',	
'SC-21-V-B': 'SC-21-V-D',	
'SC-22-V-A': 'SC-21-X-B',	
'SC-22-V-B': 'SC-22-X-A',	
'SC-22-V-C': 'SC-22-Y-A',	
'SC-22-V-D': 'SC-22-Y-B',	
'SC-22-Y-C': 'SC-22-Y-A',	
'SD-20-X-C': 'SD-20-X-A',	
'SD-20-Z-B': 'SD-20-X-D',	
'SD-20-Z-D': 'SD-21-Y-C',	
'SD-22-V-A': 'SD-21-X-B',	
'SE-20-X-B': 'SD-21-Y-C',	
'SE-21-V-A': 'SD-21-Y-C',	
'SE-21-V-D': 'SE-21-Y-B',	
'SF-21-V-B': 'SF-21-V-D',	
'SF-24-Y-C': 'SF-24-Y-A',	
'SH-21-Z-C': 'SH-21-Z-A',	
}

var gridDict = {
  1: grid_1,	
  2: grid_2, 
  3: grid_3,
  4: grid_4,
  5: grid_5,
  6: grid_6,
  7: grid_7,
  8: grid_8,
  9: grid_9,
  10: grid_10,
  11: extraGrid
}

function gridList (i){
  return gridDict[i]
}

// function to calc best threshold by carta
function bestProbBySuperFeature(i){
    
    // filtra por supergrid
    var cartas = gridList(i)
    
    // aplica a funcao de calculo de limiares
    listYears.forEach(function(year){
      
        var mosaicProb = getInfraProbImage(year);
        
        // var accuracyByProb = cartasFiltered.map(function(feature){
        var accuracyByProb = cartas.map(function(grid){
          
              var filter = ee.Filter.eq('grid_name', grid)
              
              var feature = ee.Feature(cartasBrasil.filter(filter).first())
              // var grid = feature.get('grid_name')
              
              var geometry = feature.geometry()
              
              var nurbSamples = ee.FeatureCollection(nurb_asset + year)
                                  .select(selectProp)
                                  .filterBounds(geometry)
              
              var urbSamples = ee.FeatureCollection(urb_asset + year)
                                 .select(selectProp)
                                 .filterBounds(geometry)
                                // .randomColumn().filter('random < 0.5')
              
              var points = urbSamples.merge(nurbSamples)
              
              var accuracyCalc = listProb.map(function(n){
                
                    var imageToClassify = mosaicProb.gte(n).rename(bandName)
                    
                    var sampleRegion = imageToClassify.unmask().sampleRegions({
                          collection: points.select('value'),
                          geometries: false,
                          scale: scale,
                          tileScale: 10
                      });
                    
                    var errorMatrix = sampleRegion.errorMatrix('value', bandName)
                    // print(errorMatrix)
                  
                    var accuracy = errorMatrix.accuracy().multiply(10000).toInt()
                    
                  return ee.Feature(null)
                          .set('grid', grid)
                          .set('accuracy', accuracy)
                          .set('nProb', n)
                  })
          
              var result = ee.Feature(
                           ee.FeatureCollection(accuracyCalc)
                             // .select(['accuracy', 'nProb', 'grid'])
                             .sort('nProb')//, false)
                             .sort('accuracy', false)
                             .first()
                             )
          
              var bestThreshold = ee.Feature(feature.centroid())
                                    .set('bestProbThreshold', result.get('nProb'))
                                    .set('accuracy', result.get('accuracy'))
                                    .set('grid', grid)
                                    .set('probVersion', probVersion)// versão da probabilidade
                                    .set('version', bestThresholdVersion) // versão do código de best threshold
                                    .set('sp_grid', i)
                                    .set('nProbsort', 'true')
                                    .set('randFilter', '0.0')
                                    // .set('consAcc', result.get('consAcc'))
                                    // .set('prodAcc', result.get('prodAcc'))
        
        // return result
        return bestThreshold
        })
      
      var accuracyResults = ee.FeatureCollection(accuracyByProb)
                              //.flatten() ativar para análise de curva de acurácia
                              
      // print(accuracyResults)
      
      var name = 'Threshold_Grid-v'+ bestThresholdVersion + '_' + i + '_' + year
      
      // // Map.addLayer(accuracyResults)
      // Export.table.toDrive({
      //   collection: accuracyResults, 
      //   description: 'teste_' + name, 
      //   folder: 'exports_mapbiomas', 
      //   fileNamePrefix: 'teste_' + name,
      //   fileFormat: 'CSV'
      // })
      
      Export.table.toAsset({
        collection:accuracyResults, 
        description: name, 
        assetId: 'users/edimilsonrodriguessantos/mapbiomasCollections/col8/limiares/' + name
        // assetId: 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA8/LIMIARES/' + name
      })
      
    return accuracyResults
    })
  
  // return ee.Feature(null)
  //         .set('sp_grid', i)
          // .set('sizeCartas', cartasFiltered.size())
  }

listToMap.forEach(bestProbBySuperFeature)
